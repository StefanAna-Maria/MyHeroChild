CREATE TABLE child_assigned_tasks (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    xp INT NOT NULL,
    reward_points INT NOT NULL,
    type VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    source_kind VARCHAR(50) NOT NULL,
    source_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_child_assigned_tasks_child_id
    ON child_assigned_tasks(child_id);

CREATE INDEX idx_child_assigned_tasks_parent_id
    ON child_assigned_tasks(parent_id);

CREATE TABLE child_assigned_rewards (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    type VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    claimed BOOLEAN NOT NULL DEFAULT FALSE,
    claimed_at TIMESTAMP,
    source_kind VARCHAR(50) NOT NULL,
    source_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_child_assigned_rewards_child_id
    ON child_assigned_rewards(child_id);

CREATE INDEX idx_child_assigned_rewards_parent_id
    ON child_assigned_rewards(parent_id);
