CREATE TABLE IF NOT EXISTS user_points_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    source_id BIGINT NULL,
    delta_xp INT NOT NULL DEFAULT 0,
    delta_reward_points INT NOT NULL DEFAULT 0,
    total_xp_after INT NOT NULL DEFAULT 0,
    total_reward_points_after INT NOT NULL DEFAULT 0,
    description VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_points_history_user_created_at
    ON user_points_history (user_id, created_at DESC, id DESC);
