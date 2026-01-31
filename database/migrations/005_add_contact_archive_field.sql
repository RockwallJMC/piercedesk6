-- Migration: Add archived field to contacts table
-- Date: 2026-01-31

-- Add archived column with default false
ALTER TABLE contacts
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for filtering active contacts
CREATE INDEX idx_contacts_archived ON contacts(archived);

-- Add index for organization + archived queries (common filter pattern)
CREATE INDEX idx_contacts_organization_archived ON contacts(organization_id, archived);

-- Update RLS policies to respect archived flag (optional, but good practice)
-- Existing policies should continue to work, this just documents the pattern

COMMENT ON COLUMN contacts.archived IS 'Soft delete flag - archived contacts are hidden from main views';
