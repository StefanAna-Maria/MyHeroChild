ALTER TABLE child_assigned_tasks
    ADD COLUMN completion_requested BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE child_assigned_tasks
    ADD COLUMN completion_requested_at TIMESTAMP NULL;
