package umm3601.request_forms;

import java.util.ArrayList;
import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class RequestForm {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})

  public String _id;
  public String requesterName;

  /*
   * This ArrayList will store whatever boxes are checked off as "true" on the food request form.
   * For example, if we submit a request form for "appleJuice", "dates" and "cannedChicken",
   * this will be passed as an HTTP request for ?requests=appleJuice_dates_cannedChickens ,
   * when we build a new RequestForm object we will take this list of parameters from the HTTP request
   * to put new items into the ArrayList.
   *
   * Perhaps there is a better way to store the HTTP parameters without making everything "true"?
   * This can get kind of long if the food shelf client requests a lot of items.
   *
   * We're leaning on either using shorthands or numbers to represent each item in the HTTP parameters.
   *
   * There is also the question of how Mongo is going to handle an ArrayList as a JSON/BSON parameter?
  */
  public ArrayList<String> requestItems;
  public String otherRequests;

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof RequestForm)) {
      return false;
    }
    RequestForm other = (RequestForm) obj;
    return _id.equals(other._id);
  }

  @Override
  public int hashCode() {
    return _id.hashCode();
  }
}

