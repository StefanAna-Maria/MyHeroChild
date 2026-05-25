CREATE TABLE child_wishlist_rewards (
    id BIGSERIAL PRIMARY KEY,
    child_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type reward_type NOT NULL,
    added_to_parent_catalogue BOOLEAN NOT NULL DEFAULT FALSE,
    added_to_parent_catalogue_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_child_wishlist_child
        FOREIGN KEY (child_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_child_wishlist_child_active
    ON child_wishlist_rewards (child_id, added_to_parent_catalogue, created_at DESC);
