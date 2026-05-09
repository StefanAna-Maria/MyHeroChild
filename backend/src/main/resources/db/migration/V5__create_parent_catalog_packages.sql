CREATE TABLE parent_catalog_packages (
    parent_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    PRIMARY KEY (parent_id, package_id),
    CONSTRAINT fk_parent_catalog_parent
        FOREIGN KEY (parent_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_parent_catalog_package
        FOREIGN KEY (package_id)
        REFERENCES packages(id)
        ON DELETE CASCADE
);
