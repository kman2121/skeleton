package dao;

import generated.tables.records.TagsRecord;
import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

import static com.google.common.base.Preconditions.checkState;
import static generated.Tables.RECEIPTS;
import static generated.Tables.TAGS;

public class TagDao {
    DSLContext dsl;

    public TagDao(Configuration jooqConfig) {
        this.dsl = DSL.using(jooqConfig);
    }

    public int exists(String tagName, int receiptId) {
        TagsRecord tagsRecord = dsl.selectFrom(TAGS)
                                    .where(TAGS.RECEIPT_ID.eq(receiptId))
                                    .and(TAGS.TAG_NAME.eq(tagName))
                                    .fetchOne();
        if (tagsRecord != null) {
            return tagsRecord.getId();
        } else {
            return 0;
        }
    }

    public void insert(String tagName, int receiptId) {
        boolean receiptExists = dsl.fetchExists(
                dsl.selectFrom(RECEIPTS)
                    .where(RECEIPTS.ID.eq(receiptId))
        );
        checkState(receiptExists, "Receipt does not exist");

        TagsRecord tagsRecord = dsl
                .insertInto(TAGS, TAGS.TAG_NAME, TAGS.RECEIPT_ID)
                .values(tagName, receiptId)
                .returning(TAGS.ID)
                .fetchOne();
        checkState(tagsRecord != null && tagsRecord.getId() != null, "Insert failed");
    }

    public void delete(int tagId) {
        dsl.deleteFrom(TAGS)
            .where(TAGS.ID.eq(tagId))
            .execute();
    }
}
