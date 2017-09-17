package controllers;

import api.CreateReceiptRequest;
import api.ReceiptResponse;
import dao.ReceiptDao;
import dao.TagDao;
import generated.tables.records.ReceiptsRecord;
import generated.tables.records.TagsRecord;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;

import static java.util.stream.Collectors.toList;

@Path("/receipts")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ReceiptController {
    final private ReceiptDao receiptDao;
    final private TagDao tagDao;

    public ReceiptController(ReceiptDao receiptDao, TagDao tagDao) {
        this.receiptDao = receiptDao;
        this.tagDao = tagDao;
    }

    @POST
    public int createReceipt(@Valid @NotNull CreateReceiptRequest receipt) {
        return receiptDao.insert(receipt.merchant, receipt.amount);
    }

    @GET
    public List<ReceiptResponse> getReceipts() {
        List<ReceiptsRecord> receiptRecords = receiptDao.getAllReceipts();
        List<TagsRecord> tagRecords = tagDao.getAllTags();
        return receiptRecords.stream().map(receiptRecord -> new ReceiptResponse(receiptRecord, tagRecords)).collect(toList());
    }
}
