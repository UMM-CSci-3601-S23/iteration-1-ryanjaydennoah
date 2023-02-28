package umm3601.request_forms;

import com.mongodb.client.MongoDatabase;

import org.bson.UuidRepresentation;
import org.mongojack.JacksonMongoCollection;

/**
 * Controller that manages requests for info about request forms.
 */
public class RequestFormController {
  private final JacksonMongoCollection<RequestForm> requestFormCollection;

  public RequestFormController(MongoDatabase database) {

    requestFormCollection = JacksonMongoCollection.builder().build(
        database,
        "requestForms",
        RequestForm.class,
        UuidRepresentation.STANDARD);
  }

}
