INSERT INTO levels (level, min_total_xp) VALUES
    (21, 54850),
    (22, 68800),
    (23, 86250),
    (24, 108050),
    (25, 135300),
    (26, 169350),
    (27, 211900),
    (28, 265100),
    (29, 331600),
    (30, 414750),
    (31, 518700),
    (32, 648650),
    (33, 811100),
    (34, 1014150),
    (35, 1267950),
    (36, 1585200),
    (37, 1981750),
    (38, 2477450),
    (39, 3097100),
    (40, 3871650),
    (41, 4839850),
    (42, 6050100),
    (43, 7562900),
    (44, 9453900),
    (45, 11817650),
    (46, 14772350),
    (47, 18465700),
    (48, 23082150),
    (49, 28852650),
    (50, 36065800)
ON CONFLICT (level) DO NOTHING;

INSERT INTO avatars (min_lvl, img_avatar) VALUES
    (15, 'clownCat'),
    (25, 'cuteBunny'),
    (35, 'animeLlama'),
    (40, 'blackDog'),
    (45, 'heartEyedCat'),
    (50, 'crazyChicken')
ON CONFLICT (img_avatar) DO UPDATE SET min_lvl = EXCLUDED.min_lvl;

INSERT INTO user_claimed_avatars (user_id, avatar_id, claimed_at)
SELECT u.id, a.id, NOW()
FROM users u
JOIN avatars a ON a.img_avatar = u.avatar
WHERE a.min_lvl > 1
ON CONFLICT (user_id, avatar_id) DO NOTHING;
