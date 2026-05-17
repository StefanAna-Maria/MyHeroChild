CREATE TYPE task_type AS ENUM (
    'default',
    'school_work',
    'reading',
    'hygiene',
    'neat_tidy',
    'chores',
    'family_help',
    'responsibility',
    'respect_kindness',
    'health',
    'life_skills',
    'self_improvement',
    'digital_balance',
    'social_skills',
    'creativity'
);

CREATE TYPE reward_type AS ENUM (
    'default',
    'toy',
    'screen_time',
    'sweet_treat',
    'parents_choice',
    'family',
    'social',
    'allowance',
    'shopping',
    'freedom',
    'gaming',
    'education'
);

UPDATE tasks
SET type = CASE
    WHEN type IS NULL OR btrim(type) = '' THEN 'default'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) IN (
        'default', 'school_work', 'reading', 'hygiene', 'neat_tidy', 'chores',
        'family_help', 'responsibility', 'respect_kindness', 'health',
        'life_skills', 'self_improvement', 'digital_balance', 'social_skills', 'creativity'
    ) THEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_'))
    ELSE 'default'
END;

UPDATE parent_custom_tasks
SET type = CASE
    WHEN type IS NULL OR btrim(type) = '' THEN 'default'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) IN (
        'default', 'school_work', 'reading', 'hygiene', 'neat_tidy', 'chores',
        'family_help', 'responsibility', 'respect_kindness', 'health',
        'life_skills', 'self_improvement', 'digital_balance', 'social_skills', 'creativity'
    ) THEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_'))
    ELSE 'default'
END;

UPDATE child_assigned_tasks
SET type = CASE
    WHEN type IS NULL OR btrim(type) = '' THEN 'default'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) IN (
        'default', 'school_work', 'reading', 'hygiene', 'neat_tidy', 'chores',
        'family_help', 'responsibility', 'respect_kindness', 'health',
        'life_skills', 'self_improvement', 'digital_balance', 'social_skills', 'creativity'
    ) THEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_'))
    ELSE 'default'
END;

UPDATE rewards
SET type = CASE
    WHEN type IS NULL OR btrim(type) = '' THEN 'default'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) IN (
        'default', 'toy', 'screen_time', 'sweet_treat', 'parents_choice',
        'family', 'social', 'allowance', 'shopping', 'freedom', 'gaming', 'education'
    ) THEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_'))
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'parent_choice' THEN 'parents_choice'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) IN ('family_time', 'family_activity', 'family_day') THEN 'family'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'parentschoice' THEN 'parents_choice'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'screentime' THEN 'screen_time'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'sweettreat' THEN 'sweet_treat'
    ELSE 'default'
END;

UPDATE parent_custom_rewards
SET type = CASE
    WHEN type IS NULL OR btrim(type) = '' THEN 'default'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) IN (
        'default', 'toy', 'screen_time', 'sweet_treat', 'parents_choice',
        'family', 'social', 'allowance', 'shopping', 'freedom', 'gaming', 'education'
    ) THEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_'))
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'parent_choice' THEN 'parents_choice'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) IN ('family_time', 'family_activity', 'family_day') THEN 'family'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'parentschoice' THEN 'parents_choice'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'screentime' THEN 'screen_time'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'sweettreat' THEN 'sweet_treat'
    ELSE 'default'
END;

UPDATE child_assigned_rewards
SET type = CASE
    WHEN type IS NULL OR btrim(type) = '' THEN 'default'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) IN (
        'default', 'toy', 'screen_time', 'sweet_treat', 'parents_choice',
        'family', 'social', 'allowance', 'shopping', 'freedom', 'gaming', 'education'
    ) THEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_'))
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'parent_choice' THEN 'parents_choice'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) IN ('family_time', 'family_activity', 'family_day') THEN 'family'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'parentschoice' THEN 'parents_choice'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'screentime' THEN 'screen_time'
    WHEN lower(replace(replace(btrim(type), '-', '_'), ' ', '_')) = 'sweettreat' THEN 'sweet_treat'
    ELSE 'default'
END;

ALTER TABLE tasks
    ALTER COLUMN type SET DEFAULT 'default',
    ALTER COLUMN type TYPE task_type USING type::task_type;

ALTER TABLE parent_custom_tasks
    ALTER COLUMN type SET DEFAULT 'default',
    ALTER COLUMN type TYPE task_type USING type::task_type;

ALTER TABLE child_assigned_tasks
    ALTER COLUMN type SET DEFAULT 'default',
    ALTER COLUMN type TYPE task_type USING type::task_type;

ALTER TABLE rewards
    ALTER COLUMN type SET DEFAULT 'default',
    ALTER COLUMN type TYPE reward_type USING type::reward_type;

ALTER TABLE parent_custom_rewards
    ALTER COLUMN type SET DEFAULT 'default',
    ALTER COLUMN type TYPE reward_type USING type::reward_type;

ALTER TABLE child_assigned_rewards
    ALTER COLUMN type SET DEFAULT 'default',
    ALTER COLUMN type TYPE reward_type USING type::reward_type;
