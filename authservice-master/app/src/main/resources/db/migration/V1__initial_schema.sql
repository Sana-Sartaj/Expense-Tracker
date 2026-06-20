-- Initial schema for AuthService.
--
-- Creates all tables required by the JPA entities on a completely fresh database.
-- Every statement uses IF NOT EXISTS so this script is safe to apply against a
-- database that was previously created by ddl-auto=update (the tables will already
-- exist and the DDL is skipped; Flyway still records the migration as applied).
--
-- Entity → table mapping:
--   UserInfo   → users
--   UserRole   → roles  (GenerationType.AUTO uses hibernate_sequence on MySQL)
--   RefreshToken → tokens (GenerationType.IDENTITY → AUTO_INCREMENT)
--   @ManyToMany → users_roles join table

-- Users: primary key is a VARCHAR assigned by the application before persistence.
CREATE TABLE IF NOT EXISTS users (
    user_id  VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    password VARCHAR(255),
    PRIMARY KEY (user_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Hibernate 6 SequenceStyleGenerator table (used by UserRole GenerationType.AUTO).
-- MySQL has no native sequence support, so Hibernate falls back to a shared table.
CREATE TABLE IF NOT EXISTS hibernate_sequence (
    next_val BIGINT
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

INSERT IGNORE INTO hibernate_sequence VALUES (1);

-- Roles: role_id is managed by hibernate_sequence, NOT AUTO_INCREMENT.
CREATE TABLE IF NOT EXISTS roles (
    role_id BIGINT       NOT NULL,
    name    VARCHAR(255),
    PRIMARY KEY (role_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Many-to-many join table between users and roles.
CREATE TABLE IF NOT EXISTS users_roles (
    user_id VARCHAR(255) NOT NULL,
    role_id BIGINT       NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_users_roles_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_users_roles_role FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Refresh tokens: one token per user (UNIQUE on user_id mirrors @OneToOne).
-- GenerationType.IDENTITY → id is AUTO_INCREMENT.
-- ON DELETE CASCADE removes the token automatically when the user is deleted.
CREATE TABLE IF NOT EXISTS tokens (
    id          INT          NOT NULL AUTO_INCREMENT,
    token       VARCHAR(255),
    expiry_date DATETIME(6),
    user_id     VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_tokens_user_id  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_tokens_user_id  UNIQUE (user_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
