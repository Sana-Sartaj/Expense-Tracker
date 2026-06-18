-- Idempotency tracking table for the Kafka user consumer.
--
-- Every successfully processed (topic, group_id, partition_num, offset_val) tuple
-- is recorded here. Before processing a message the consumer checks this table;
-- if a matching row exists the message is a replay and is silently skipped.
--
-- "partition" and "offset" are reserved words in MySQL 8 — the columns are named
-- partition_num and offset_val to avoid quoting in every query.

CREATE TABLE IF NOT EXISTS processed_kafka_events (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    topic         VARCHAR(255) NOT NULL,
    group_id      VARCHAR(255) NOT NULL,
    partition_num INT          NOT NULL,
    offset_val    BIGINT       NOT NULL,
    processed_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uc_processed_kafka_events (topic, group_id, partition_num, offset_val)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
