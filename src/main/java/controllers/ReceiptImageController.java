package controllers;

import api.ReceiptSuggestionResponse;
import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.Collections;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import org.hibernate.validator.constraints.NotEmpty;

@Path("/images")
@Consumes(MediaType.TEXT_PLAIN)
@Produces(MediaType.APPLICATION_JSON)
public class ReceiptImageController {
    private final AnnotateImageRequest.Builder requestBuilder;

    public ReceiptImageController() {
        // DOCUMENT_TEXT_DETECTION is not the best or only OCR method available
        Feature ocrFeature = Feature.newBuilder().setType(Feature.Type.TEXT_DETECTION).build();
        this.requestBuilder = AnnotateImageRequest.newBuilder().addFeatures(ocrFeature);

    }

    /**
     * This borrows heavily from the Google Vision API Docs.  See:
     * https://cloud.google.com/vision/docs/detecting-fulltext
     *
     * YOU SHOULD MODIFY THIS METHOD TO RETURN A ReceiptSuggestionResponse:
     *
     * public class ReceiptSuggestionResponse {
     *     String merchantName;
     *     String amount;
     * }
     */
    @POST
    public ReceiptSuggestionResponse parseReceipt(@NotEmpty String base64EncodedImage) throws Exception {
        Image img = Image.newBuilder().setContent(ByteString.copyFrom(Base64.getDecoder().decode(base64EncodedImage))).build();
        AnnotateImageRequest request = this.requestBuilder.setImage(img).build();

        try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
            BatchAnnotateImagesResponse responses = client.batchAnnotateImages(Collections.singletonList(request));
            AnnotateImageResponse res = responses.getResponses(0);
            if (res.getTextAnnotationsList().size() == 0) {
                return new ReceiptSuggestionResponse(null, null);
            }

            String merchantName = "";
            double amount = 0;

            /*
            * found == 0: looking for merchant
            * found == 1: looking for amount
            */
            int found = 0;
            String[] lines = res.getTextAnnotationsList().get(0).getDescription().split("\n");
            for (String line : lines) {
                if (found == 0) {
                    if (Character.isDigit(line.charAt(0))) {
                        found = 1;
                    } else {
                        merchantName += " " + line;
                    }
                } else {
                    for (String str : line.split(" ")) {
                        if (str.matches("\\d{1,3}\\.\\d{2}")) {
                            amount = Math.max(amount, Double.parseDouble(str));
                        }
                    }
                }
            }

            return new ReceiptSuggestionResponse(merchantName.trim(), BigDecimal.valueOf(amount));
        }
    }
}
