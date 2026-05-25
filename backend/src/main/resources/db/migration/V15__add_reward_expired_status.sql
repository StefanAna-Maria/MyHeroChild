ALTER TABLE child_assigned_rewards
    ADD COLUMN IF NOT EXISTS expired BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE child_assigned_rewards
SET expired = TRUE
WHERE claimed = FALSE
  AND end_date < CURRENT_DATE;
