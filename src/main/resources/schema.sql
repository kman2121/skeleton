DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS tags;

CREATE TABLE receipts (
  id INT UNSIGNED AUTO_INCREMENT,
  uploaded TIME DEFAULT CURRENT_TIME(),
  merchant VARCHAR(255),
  amount DECIMAL(12,2),
  receipt_type INT UNSIGNED,

  PRIMARY KEY (id)
);

CREATE TABLE tags (
  id INT UNSIGNED AUTO_INCREMENT,
  tag_name   VARCHAR(255),
  receipt_id INT UNSIGNED,

  PRIMARY KEY (id),
  CONSTRAINT TAGRECEIPT UNIQUE (tag_name, receipt_id)
);

ALTER TABLE `tags` ADD FOREIGN KEY (`receipt_id`) REFERENCES `receipts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;