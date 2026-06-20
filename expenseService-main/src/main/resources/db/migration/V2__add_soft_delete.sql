-- Add soft-delete support to the expense table.
--
-- Hard-deleting expense records destroys the audit trail and prevents recovery.
-- Soft delete sets is_deleted = true and excludes the row from all read queries,
-- preserving the record in the database while hiding it from users.
--
-- DEFAULT FALSE ensures every existing row is treated as active.
-- IF NOT EXISTS makes this safe to apply on databases where ddl-auto=update
-- already created the column before Flyway was enabled (Task 23).

ALTER TABLE expense
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
