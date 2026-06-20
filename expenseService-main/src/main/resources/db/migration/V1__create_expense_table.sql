-- Baseline schema for the ExpenseService.
--
-- Schema is derived from the Expense entity (com.expense.service.entities.Expense).
-- V4 migration alters id to AUTO_INCREMENT and drops hibernate_sequence once this
-- baseline has been applied (handles both fresh installs and existing databases).

CREATE TABLE IF NOT EXISTS expense (
    id          BIGINT       NOT NULL,
    external_id VARCHAR(255),
    user_id     VARCHAR(255),
    amount      DECIMAL(38, 2),
    merchant    VARCHAR(255),
    currency    VARCHAR(255),
    created_at  DATETIME(6),
    PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Hibernate 6 SequenceStyleGenerator creates this table to track the next id value
-- when the target database does not support native sequences (MySQL).
CREATE TABLE IF NOT EXISTS hibernate_sequence (
    next_val BIGINT
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Seed with 1 so the first entity gets id = 1.
INSERT IGNORE INTO hibernate_sequence
VALUES (1);
