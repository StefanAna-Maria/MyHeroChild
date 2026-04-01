-- =========================
-- PACKAGES
-- =========================
CREATE TABLE packages (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    age_group VARCHAR(50),
    description TEXT
);

-- =========================
-- TASKS
-- =========================
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    xp INT NOT NULL,
    reward_points INT NOT NULL,
    type VARCHAR(100),
    package_id BIGINT,
    CONSTRAINT fk_task_package
        FOREIGN KEY (package_id)
        REFERENCES packages(id)
        ON DELETE CASCADE
);

-- =========================
-- REWARDS
-- =========================
CREATE TABLE rewards (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    type VARCHAR(100),
    image VARCHAR(255),
    package_id BIGINT,
    CONSTRAINT fk_reward_package
        FOREIGN KEY (package_id)
        REFERENCES packages(id)
        ON DELETE CASCADE
);