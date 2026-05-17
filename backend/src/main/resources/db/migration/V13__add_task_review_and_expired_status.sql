ALTER TABLE child_assigned_tasks
    ADD COLUMN IF NOT EXISTS reviewed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE child_assigned_tasks
    ADD COLUMN IF NOT EXISTS approved BOOLEAN NULL;

ALTER TABLE child_assigned_tasks
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL;

ALTER TABLE child_assigned_tasks
    ADD COLUMN IF NOT EXISTS expired BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE child_assigned_tasks
    ALTER COLUMN reviewed SET DEFAULT FALSE;

ALTER TABLE child_assigned_tasks
    ALTER COLUMN expired SET DEFAULT FALSE;

UPDATE child_assigned_tasks
SET reviewed = FALSE
WHERE reviewed IS NULL;

UPDATE child_assigned_tasks
SET expired = FALSE
WHERE expired IS NULL;

UPDATE child_assigned_tasks
SET expired = TRUE
WHERE end_date < CURRENT_DATE
  AND reviewed = FALSE;
