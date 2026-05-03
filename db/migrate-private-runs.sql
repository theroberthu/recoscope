-- Add prospect-specific (private) run support
-- Existing rows default to public with no client

ALTER TABLE runs ADD COLUMN IF NOT EXISTS client_id TEXT NULL;
ALTER TABLE runs ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;
