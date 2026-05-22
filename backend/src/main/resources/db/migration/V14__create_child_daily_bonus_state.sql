CREATE TABLE IF NOT EXISTS child_daily_bonus_state (
    id BIGSERIAL PRIMARY KEY,
    child_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bonus_date DATE NOT NULL,
    claimed BOOLEAN NOT NULL DEFAULT FALSE,
    claimed_at TIMESTAMP NULL,
    restricted_until TIMESTAMP NULL,
    restriction_notified_for_date DATE NULL
);
