-- Migration: 005_dashboard_analytics_columns
-- Description: Add analytics columns and performance indexes for Phase 1.5 Dashboard
-- Date: 2026-01-31

-- Add analytics columns to deals table
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS acquisition_cost DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS lifetime_value DECIMAL(12, 2);

COMMENT ON COLUMN deals.acquisition_cost IS 'Customer Acquisition Cost per deal';
COMMENT ON COLUMN deals.lifetime_value IS 'Projected Lifetime Value per deal';

-- Create performance indexes for dashboard queries

-- Deals table indexes
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(create_date);
CREATE INDEX IF NOT EXISTS idx_deals_close_date ON deals(close_date) WHERE close_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_user_stage ON deals(user_id, stage);

-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON crm_contacts(created_at);

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_type_created ON activities(activity_type, created_at);
