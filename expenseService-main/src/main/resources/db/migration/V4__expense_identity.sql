-- Migrate Expense.id from GenerationType.AUTO (Hibernate 5 hibernate_sequence)
-- to GenerationType.IDENTITY (MySQL AUTO_INCREMENT).
--
-- Why: Hibernate 6 (Spring Boot 3.x) changed GenerationType.AUTO on MySQL to expect
-- a per-entity sequence table named `expense_seq`. V1 created a shared
-- `hibernate_sequence` table (Hibernate 5 behavior) which Hibernate 6 ignores,
-- causing schema-validation to fail with "missing table [expense_seq]".
-- GenerationType.IDENTITY with AUTO_INCREMENT is the correct MySQL approach.

-- Add AUTO_INCREMENT to expense.id so IDENTITY strategy works.
ALTER TABLE expense
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

-- Drop the Hibernate 5 shared sequence table — no longer needed.
DROP TABLE IF EXISTS hibernate_sequence;
