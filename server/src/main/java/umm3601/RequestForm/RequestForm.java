package umm3601.RequestForm;

import java.util.ArrayList;
import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class RequestForm {

  @ObjectId @Id
  // By default Java field names shouldn't start with underscores.
  // Here, though, we *have* to use the name `_id` to match the
  // name of the field as used by MongoDB.
  @SuppressWarnings({"MemberName"})

  public String _id;

  public String name;
  // public String zipCode;
  // public date; (built in?)
  public ArrayList<String> foods;
  // public int income;
  // public int familySize;
  // public int children;
  // public int elders;
  // public Boolean glutenFree;
  // public Boolean lowSugar;
  // public Boolean lactoseFree;
  // public Boolean vegan;


  // Catches error
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
    // This means that equal Requestform will hash the same, which is good.
    return _id.hashCode();
  }
}


