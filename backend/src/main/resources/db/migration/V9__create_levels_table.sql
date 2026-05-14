CREATE TABLE IF NOT EXISTS levels (
    level INT PRIMARY KEY,
    min_total_xp INT NOT NULL
);

INSERT INTO levels (level, min_total_xp) VALUES
    (1, 0),
    (2, 100),
    (3, 250),
    (4, 500),
    (5, 800),
    (6, 1200),
    (7, 1700),
    (8, 2300),
    (9, 3050),
    (10, 4000),
    (11, 5200),
    (12, 6700),
    (13, 8550),
    (14, 10900),
    (15, 13800),
    (16, 17450),
    (17, 22000),
    (18, 27700),
    (19, 34800),
    (20, 43700)
ON CONFLICT (level) DO NOTHING;
