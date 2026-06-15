BEGIN;

INSERT INTO parent_catalog_packages (parent_id, package_id)
SELECT values_to_insert.parent_id, values_to_insert.package_id
FROM (
    VALUES
        (6, 6),
        (6, 12),
        (6, 40),
        (34, 6),
        (34, 40),
        (37, 4),
        (37, 40)
) AS values_to_insert(parent_id, package_id)
WHERE NOT EXISTS (
    SELECT 1
    FROM parent_catalog_packages existing
    WHERE existing.parent_id = values_to_insert.parent_id
      AND existing.package_id = values_to_insert.package_id
);

INSERT INTO child_assigned_tasks (
    id,
    parent_id,
    child_id,
    title,
    xp,
    reward_points,
    type,
    start_date,
    end_date,
    completed,
    completion_requested,
    completion_requested_at,
    reviewed,
    approved,
    reviewed_at,
    expired,
    source_kind,
    source_id,
    created_at
)
VALUES
    (52, 6, 40, 'Dedeman', 80, 35, 'default', '2026-03-12', '2026-03-15', TRUE, FALSE, NULL, TRUE, TRUE, '2026-03-14 18:10:00', FALSE, 'PACKAGE_TASK', 15, '2026-03-12 08:30:00'),
    (53, 6, 40, 'Mop the hallway', 200, 180, 'chores', '2026-06-08', '2026-06-12', TRUE, FALSE, NULL, TRUE, TRUE, '2026-06-09 18:45:00', FALSE, 'PACKAGE_TASK', 45, '2026-06-08 09:00:00'),
    (54, 34, 35, 'Help a family member with a task at home', 200, 250, 'family_help', '2026-04-10', '2026-04-14', TRUE, FALSE, NULL, TRUE, TRUE, '2026-04-12 19:00:00', FALSE, 'PACKAGE_TASK', 46, '2026-04-10 08:20:00'),
    (55, 34, 35, 'Help with laundry', 130, 100, 'chores', '2026-05-03', '2026-05-06', TRUE, FALSE, NULL, TRUE, FALSE, '2026-05-05 18:00:00', FALSE, 'PACKAGE_TASK', 47, '2026-05-03 09:10:00'),
    (56, 34, 35, 'Help preparing dinner', 150, 150, 'family_help', '2026-06-06', '2026-06-10', TRUE, FALSE, NULL, TRUE, TRUE, '2026-06-08 20:30:00', FALSE, 'PACKAGE_TASK', 50, '2026-06-06 10:00:00'),
    (57, 37, 38, 'Pick up your toys after play', 324, 234, 'default', '2026-05-10', '2026-05-13', TRUE, FALSE, NULL, TRUE, TRUE, '2026-05-11 17:40:00', FALSE, 'PACKAGE_TASK', 4, '2026-05-10 08:15:00'),
    (58, 37, 38, 'Wash your hands before every meal', 234, 384, 'default', '2026-05-18', '2026-05-22', TRUE, FALSE, NULL, TRUE, TRUE, '2026-05-20 19:30:00', FALSE, 'PACKAGE_TASK', 5, '2026-05-18 09:45:00'),
    (59, 37, 38, 'Clean your room', 50, 70, 'neat_tidy', '2026-06-07', '2026-06-11', TRUE, FALSE, NULL, TRUE, TRUE, '2026-06-09 16:50:00', FALSE, 'PACKAGE_TASK', 49, '2026-06-07 11:20:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO child_assigned_rewards (
    id,
    parent_id,
    child_id,
    title,
    price,
    type,
    start_date,
    end_date,
    expired,
    claimed,
    claimed_at,
    granted,
    granted_at,
    source_kind,
    source_id,
    created_at
)
VALUES
    (40, 6, 40, 'poppo', 60, 'family', '2026-06-08', '2026-06-16', FALSE, TRUE, '2026-06-09 20:00:00', TRUE, '2026-06-09 21:00:00', 'PACKAGE_REWARD', 11, '2026-06-08 09:05:00'),
    (41, 34, 35, 'gahah', 100, 'toy', '2026-04-15', '2026-04-30', FALSE, TRUE, '2026-04-18 18:20:00', TRUE, '2026-04-19 12:00:00', 'PACKAGE_REWARD', 7, '2026-04-15 08:45:00'),
    (42, 37, 38, 'Caca la olita', 300, 'family', '2026-05-21', '2026-05-31', FALSE, TRUE, '2026-05-24 14:10:00', TRUE, '2026-05-24 18:00:00', 'PACKAGE_REWARD', 23, '2026-05-21 08:30:00'),
    (43, 37, 38, 'Go out with friends on a week day', 300, 'social', '2026-06-08', '2026-06-18', FALSE, TRUE, '2026-06-09 19:25:00', FALSE, NULL, 'PACKAGE_REWARD', 52, '2026-06-08 09:30:00'),
    (44, 34, 35, '1 extra hour of gaming', 200, 'gaming', '2026-06-07', '2026-06-14', FALSE, TRUE, '2026-06-09 17:40:00', FALSE, NULL, 'PACKAGE_REWARD', 54, '2026-06-07 10:05:00')
ON CONFLICT (id) DO NOTHING;

UPDATE users
SET xp = seeded.xp,
    reward_points = seeded.reward_points,
    level = seeded.level
FROM (
    VALUES
        (40, 280, 155, 3),
        (35, 350, 100, 3),
        (38, 608, 88, 4)
) AS seeded(id, xp, reward_points, level)
WHERE users.id = seeded.id;

INSERT INTO user_points_history (
    id,
    user_id,
    action_type,
    source_type,
    source_id,
    delta_xp,
    delta_reward_points,
    total_xp_after,
    total_reward_points_after,
    description,
    created_at
)
VALUES
    (7, 40, 'TASK_APPROVED', 'ASSIGNED_TASK', 52, 80, 35, 80, 35, 'Earned 80 XP and 35 reward points from approved task "Dedeman".', '2026-03-14 18:10:00'),
    (8, 40, 'TASK_APPROVED', 'ASSIGNED_TASK', 53, 200, 180, 280, 215, 'Earned 200 XP and 180 reward points from approved task "Mop the hallway".', '2026-06-09 18:45:00'),
    (9, 40, 'REWARD_PURCHASED', 'ASSIGNED_REWARD', 40, 0, -60, 280, 155, 'Spent 60 reward points to purchase "poppo".', '2026-06-09 20:00:00'),
    (10, 35, 'TASK_APPROVED', 'ASSIGNED_TASK', 54, 200, 250, 200, 250, 'Earned 200 XP and 250 reward points from approved task "Help a family member with a task at home".', '2026-04-12 19:00:00'),
    (11, 35, 'REWARD_PURCHASED', 'ASSIGNED_REWARD', 41, 0, -100, 200, 150, 'Spent 100 reward points to purchase "gahah".', '2026-04-18 18:20:00'),
    (12, 35, 'TASK_APPROVED', 'ASSIGNED_TASK', 56, 150, 150, 350, 300, 'Earned 150 XP and 150 reward points from approved task "Help preparing dinner".', '2026-06-08 20:30:00'),
    (13, 35, 'REWARD_PURCHASED', 'ASSIGNED_REWARD', 44, 0, -200, 350, 100, 'Spent 200 reward points to purchase "1 extra hour of gaming".', '2026-06-09 17:40:00'),
    (14, 38, 'TASK_APPROVED', 'ASSIGNED_TASK', 57, 324, 234, 324, 234, 'Earned 324 XP and 234 reward points from approved task "Pick up your toys after play".', '2026-05-11 17:40:00'),
    (15, 38, 'TASK_APPROVED', 'ASSIGNED_TASK', 58, 234, 384, 558, 618, 'Earned 234 XP and 384 reward points from approved task "Wash your hands before every meal".', '2026-05-20 19:30:00'),
    (16, 38, 'REWARD_PURCHASED', 'ASSIGNED_REWARD', 42, 0, -300, 558, 318, 'Spent 300 reward points to purchase "Caca la olita".', '2026-05-24 14:10:00'),
    (17, 38, 'TASK_APPROVED', 'ASSIGNED_TASK', 59, 50, 70, 608, 388, 'Earned 50 XP and 70 reward points from approved task "Clean your room".', '2026-06-09 16:50:00'),
    (18, 38, 'REWARD_PURCHASED', 'ASSIGNED_REWARD', 43, 0, -300, 608, 88, 'Spent 300 reward points to purchase "Go out with friends on a week day".', '2026-06-09 19:25:00')
ON CONFLICT (id) DO NOTHING;

SELECT setval('child_assigned_tasks_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM child_assigned_tasks), 59), TRUE);
SELECT setval('child_assigned_rewards_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM child_assigned_rewards), 44), TRUE);
SELECT setval('user_points_history_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM user_points_history), 18), TRUE);

COMMIT;
