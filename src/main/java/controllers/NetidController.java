package controllers;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

@Path("/netid")
@Produces(MediaType.TEXT_PLAIN)
public class NetidController {
    public NetidController() {
    }

    @GET
    public String getNetId() {
        return "krm257";
    }
}
