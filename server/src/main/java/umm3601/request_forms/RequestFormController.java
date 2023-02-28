package umm3601.request_forms;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;

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
 * Controller that manages requests for info about request forms.
 */
public class RequestFormController {

  static final String NAME_KEY = "requesterName";
  static final String ITEMS_KEY = "requestItems";
  static final String OTHERS_KEY = "otherRequests";

  private final JacksonMongoCollection<RequestForm> requestFormCollection;

  public RequestFormController(MongoDatabase database) {

    requestFormCollection = JacksonMongoCollection.builder().build(
        database,
        "requestForms",
        RequestForm.class,
        UuidRepresentation.STANDARD);
  }

  /**
   * Set the JSON body of the response to be the single request form
   * specified by the `id` parameter in the request
   *
   * @param ctx a Javalin HTTP context
   */
  public void getRequestForm(Context ctx) {
    String id = ctx.pathParam("id");
    RequestForm requestForm;

    try {
      requestForm = requestFormCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The specified request form id wasn't a legal Mongo Object ID.");
    }
    if (requestForm == null) {
      throw new NotFoundResponse("The specified request form was not found");
    } else {
      ctx.json(requestForm);
      ctx.status(HttpStatus.OK);
    }
  }

  /**
   * Set the JSON body of the response to be a list of all the request forms returned from the database
   * that match any requested filters and ordering
   *
   * @param ctx a Javalin HTTP context
   */
  public void getRequestForms(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    // All three of the find, sort, and into steps happen "in parallel" inside the
    // database system. So MongoDB is going to find the request forms with the specified
    // properties, return those sorted in the specified manner, and put the
    // results into an initially empty ArrayList.
    ArrayList<RequestForm> matchingRequestForms = requestFormCollection
      .find(combinedFilter)
      .sort(sortingOrder)
      .into(new ArrayList<>());

    // Set the JSON body of the response to be the list of request forms returned by the database.
    // According to the Javalin documentation (https://javalin.io/documentation#context),
    // this calls result(jsonString), and also sets content type to json
    ctx.json(matchingRequestForms);

    // Explicitly set the context status to OK
    ctx.status(HttpStatus.OK);
  }

  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>(); // start with a blank document

    if (ctx.queryParamMap().containsKey(NAME_KEY)) {
      String targetName = ctx.queryParamAsClass(NAME_KEY, String.class)
        /* .check()*/
        // TODO: What checks might we need to perform for filtering a name?
        .get();
      filters.add(eq(NAME_KEY, targetName));
    }
    // TODO: Add functionality to filter by specific item requests.
    // We aren't entirely sure how we're going to handle this yet, since our HTTP parameters
    // are being parsed into an ArrayList on the backend.
    // This will almost entirely depend on how we choose to represent these specific item requests
    // in the HTTP parameters...

    // TODO: Is it necessary to add functionality to filter by "additional" requests?


    // Combine the list of filters into a single filtering document.
    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

    return combinedFilter;
  }

  private Bson constructSortingOrder(Context ctx) {
    // Sort the results. Use the `sortby` query param (default "requesterName")
    // as the field to sort by, and the query param `sortorder` (default
    // "asc") to specify the sort order.
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "requesterName");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);
    return sortingOrder;
  }

  // TODO: Add the ability to add and delete new forms to the database via HTTP request.

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
