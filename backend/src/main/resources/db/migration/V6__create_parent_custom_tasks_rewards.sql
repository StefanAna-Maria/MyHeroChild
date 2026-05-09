CREATE TABLE parent_custom_tasks (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    xp INT NOT NULL DEFAULT 0,
    reward_points INT NOT NULL DEFAULT 0,
    type VARCHAR(100)
);

CREATE INDEX idx_parent_custom_tasks_parent_id
    ON parent_custom_tasks(parent_id);

CREATE TABLE parent_custom_rewards (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    price INT NOT NULL DEFAULT 0,
    type VARCHAR(100)
);

CREATE INDEX idx_parent_custom_rewards_parent_id
    ON parent_custom_rewards(parent_id);
