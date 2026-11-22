CREATE TABLE tenant_accounts (
    id BIGSERIAL PRIMARY KEY,
    room_id VARCHAR(120) NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    reservation_paid BOOLEAN NOT NULL DEFAULT FALSE,
    deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_paid_months TEXT NOT NULL DEFAULT ''
);
