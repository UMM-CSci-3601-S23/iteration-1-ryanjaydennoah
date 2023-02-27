package umm3601.fsclient;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.result.DeleteResult;

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;

/**
 * Controller that manages requests for info about fsclients.
 */
public class FsclientController {

  static final String AGE_KEY = "age";
  static final String COMPANY_KEY = "company";
  static final String ROLE_KEY = "role";
  static final String SORT_ORDER_KEY = "sortorder";

  private static final int REASONABLE_AGE_LIMIT = 150;
  private static final String ROLE_REGEX = "^(admin|editor|viewer)$";
  public static final String EMAIL_REGEX = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$";

  private final JacksonMongoCollection<Fsclient> fsclientCollection;

  /**
   * Construct a controller for fsclients.
   *
   * @param database the database containing fsclient data
   */
  public FsclientController(MongoDatabase database) {
    fsclientCollection = JacksonMongoCollection.builder().build(
        database,
        "fsclients",
        Fsclient.class,
        UuidRepresentation.STANDARD);
  }

  /**
   * Set the JSON body of the response to be the single fsclient
   * specified by the `id` parameter in the request
   *
   * @param ctx a Javalin HTTP context
   */
  public void getFsclient(Context ctx) {
    String id = ctx.pathParam("id");
    Fsclient fsclient;

    try {
      fsclient = fsclientCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested fsclient id wasn't a legal Mongo Object ID.");
    }
    if (fsclient == null) {
      throw new NotFoundResponse("The requested fsclient was not found");
    } else {
      ctx.json(fsclient);
      ctx.status(HttpStatus.OK);
    }
  }

  /**
   * Set the JSON body of the response to be a list of all the fsclients returned from the database
   * that match any requested filters and ordering
   *
   * @param ctx a Javalin HTTP context
   */
  public void getFsclients(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    // All three of the find, sort, and into steps happen "in parallel" inside the
    // database system. So MongoDB is going to find the fsclients with the specified
    // properties, return those sorted in the specified manner, and put the
    // results into an initially empty ArrayList.
    ArrayList<Fsclient> matchingFsclients = fsclientCollection
      .find(combinedFilter)
      .sort(sortingOrder)
      .into(new ArrayList<>());

    // Set the JSON body of the response to be the list of fsclients returned by the database.
    // According to the Javalin documentation (https://javalin.io/documentation#context),
    // this calls result(jsonString), and also sets content type to json
    ctx.json(matchingFsclients);

    // Explicitly set the context status to OK
    ctx.status(HttpStatus.OK);
  }

  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>(); // start with a blank document

    if (ctx.queryParamMap().containsKey(AGE_KEY)) {
      int targetAge = ctx.queryParamAsClass(AGE_KEY, Integer.class)
        .check(it -> it > 0, "Fsclient's age must be greater than zero")
        .check(it -> it < REASONABLE_AGE_LIMIT, "Fsclient's age must be less than " + REASONABLE_AGE_LIMIT)
        .get();
      filters.add(eq(AGE_KEY, targetAge));
    }
    if (ctx.queryParamMap().containsKey(COMPANY_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(COMPANY_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(COMPANY_KEY, pattern));
    }
    if (ctx.queryParamMap().containsKey(ROLE_KEY)) {
      String role = ctx.queryParamAsClass(ROLE_KEY, String.class)
        .check(it -> it.matches(ROLE_REGEX), "Fsclient must have a legal fsclient role")
        .get();
      filters.add(eq(ROLE_KEY, role));
    }

    // Combine the list of filters into a single filtering document.
    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

    return combinedFilter;
  }

  private Bson constructSortingOrder(Context ctx) {
    // Sort the results. Use the `sortby` query param (default "name")
    // as the field to sort by, and the query param `sortorder` (default
    // "asc") to specify the sort order.
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "name");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);
    return sortingOrder;
  }

  /**
   * Add a new fsclient using information from the context
   * (as long as the information gives "legal" values to Fsclient fields)
   *
   * @param ctx a Javalin HTTP context
   */
  public void addNewFsclient(Context ctx) {
    /*
     * The follow chain of statements uses the Javalin validator system
     * to verify that instance of `Fsclient` provided in this context is
     * a "legal" fsclient. It checks the following things (in order):
     *    - The fsclient has a value for the name (`usr.name != null`)
     *    - The fsclient name is not blank (`usr.name.length > 0`)
     *    - The provided email is valid (matches EMAIL_REGEX)
     *    - The provided age is > 0
     *    - The provided role is valid (one of "admin", "editor", or "viewer")
     *    - A non-blank company is provided
     */
    Fsclient newFsclient = ctx.bodyValidator(Fsclient.class)
      .check(usr -> usr.name != null && usr.name.length() > 0, "Fsclient must have a non-empty fsclient name")
      .check(usr -> usr.email.matches(EMAIL_REGEX), "Fsclient must have a legal email")
      .check(usr -> usr.age > 0, "Fsclient's age must be greater than zero")
      .check(usr -> usr.age < REASONABLE_AGE_LIMIT, "Fsclient's age must be less than " + REASONABLE_AGE_LIMIT)
      .check(usr -> usr.role.matches(ROLE_REGEX), "Fsclient must have a legal fsclient role")
      .check(usr -> usr.company != null && usr.company.length() > 0, "Fsclient must have a non-empty company name")
      .get();

    // Generate a fsclient avatar (you won't need this part for todos)
    newFsclient.avatar = generateAvatar(newFsclient.email);

    fsclientCollection.insertOne(newFsclient);

    ctx.json(Map.of("id", newFsclient._id));
    // 201 is the HTTP code for when we successfully
    // create a new resource (a fsclient in this case).
    // See, e.g., https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    // for a description of the various response codes.
    ctx.status(HttpStatus.CREATED);
  }

  /**
   * Delete the fsclient specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void deleteFsclient(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = fsclientCollection.deleteOne(eq("_id", new ObjectId(id)));
    if (deleteResult.getDeletedCount() != 1) {
      ctx.status(HttpStatus.NOT_FOUND);
      throw new NotFoundResponse(
        "Was unable to delete ID "
          + id
          + "; perhaps illegal ID or an ID for an item not in the system?");
    }
    ctx.status(HttpStatus.OK);
  }

  /**
   * Utility function to generate an URI that points
   * at a unique avatar image based on a fsclient's email.
   *
   * This uses the service provided by gravatar.com; there
   * are numerous other similar services that one could
   * use if one wished.
   *
   * @param email the email to generate an avatar for
   * @return a URI pointing to an avatar image
   */
  private String generateAvatar(String email) {
    String avatar;
    try {
      // generate unique md5 code for identicon
      avatar = "https://gravatar.com/avatar/" + md5(email) + "?d=identicon";
    } catch (NoSuchAlgorithmException ignored) {
      // set to mystery person
      avatar = "https://gravatar.com/avatar/?d=mp";
    }
    return avatar;
  }

  /**
   * Utility function to generate the md5 hash for a given string
   *
   * @param str the string to generate a md5 for
   */
  @SuppressWarnings("lgtm[java/weak-cryptographic-algorithm]")
  public String md5(String str) throws NoSuchAlgorithmException {
    MessageDigest md = MessageDigest.getInstance("MD5");
    byte[] hashInBytes = md.digest(str.toLowerCase().getBytes(StandardCharsets.UTF_8));

    StringBuilder result = new StringBuilder();
    for (byte b : hashInBytes) {
      result.append(String.format("%02x", b));
    }
    return result.toString();
  }
}
