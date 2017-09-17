package controllers;

import api.ReceiptResponse;
import dao.ReceiptDao;
import dao.TagDao;
import generated.tables.records.ReceiptsRecord;
import generated.tables.records.TagsRecord;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;

import static java.util.stream.Collectors.toList;

@Path("/tags/{tag}")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ToggleTagController {
    final TagDao tagDao;
    final ReceiptDao receiptDao;

    public ToggleTagController(ReceiptDao receiptDao, TagDao tagDao) {
        this.receiptDao = receiptDao;
        this.tagDao = tagDao;
    }

    @GET
    public List<ReceiptResponse> getReceiptsByTag(@PathParam("tag") String tagName) {
        List<ReceiptsRecord> receiptRecords = receiptDao.getFilteredReceipts(tagName);
        List<TagsRecord> tagRecords = tagDao.getAllTags();
        return receiptRecords.stream().map(receiptRecord -> new ReceiptResponse(receiptRecord, tagRecords)).collect(toList());
    }

    @PUT
    public void toggleTag(@PathParam("tag") String tagName, int receiptId) {
        int tagId = tagDao.exists(tagName, receiptId);
        if (tagId == 0) {
            tagDao.insert(tagName, receiptId);
        } else {
            tagDao.delete(tagId);
        }
    }
}
