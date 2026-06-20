ALTER TABLE expense
    ADD COLUMN category         VARCHAR(100) NULL,
    ADD COLUMN transaction_type VARCHAR(20)  NOT NULL DEFAULT 'EXPENSE';
