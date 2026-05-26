CREATE TABLE IF NOT EXISTS avatars (
    id BIGSERIAL PRIMARY KEY,
    min_lvl INT NOT NULL,
    img_avatar VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_claimed_avatars (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_id BIGINT NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    claimed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_user_claimed_avatar UNIQUE (user_id, avatar_id)
);

INSERT INTO avatars (min_lvl, img_avatar) VALUES
    (1, 'panda'),
    (1, 'robot'),
    (1, 'unicorn'),
    (5, 'dragon'),
    (10, 'fox'),
    (20, 'capybara'),
    (30, 'goldenDog')
ON CONFLICT (img_avatar) DO UPDATE SET min_lvl = EXCLUDED.min_lvl;

INSERT INTO user_claimed_avatars (user_id, avatar_id, claimed_at)
SELECT u.id, a.id, NOW()
FROM users u
JOIN avatars a ON a.img_avatar = u.avatar
WHERE a.min_lvl > 1
ON CONFLICT (user_id, avatar_id) DO NOTHING;
