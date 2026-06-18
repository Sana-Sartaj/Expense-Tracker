-- Initial schema for UserService.
--
-- Creates all tables required by the JPA entities on a completely fresh database.
-- IF NOT EXISTS makes this safe to apply against a database that was previously
-- created by ddl-auto=update — the existing tables are left untouched and Flyway
-- simply records the migration as applied.
--
-- Entity → table mapping:
--   UserInfo → users  (primary key is user_id VARCHAR, assigned by AuthService)

CREATE TABLE IF NOT EXISTS users (
    user_id      VARCHAR(255) NOT NULL,
    first_name   VARCHAR(255) NOT NULL,
    last_name    VARCHAR(255) NOT NULL,
    phone_number BIGINT       NOT NULL,
    email        VARCHAR(255) NOT NULL,
    profile_pic  VARCHAR(255),
    PRIMARY KEY (user_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
