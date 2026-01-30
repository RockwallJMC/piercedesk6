-- =============================================================================
-- 01-organizations.sql
-- Seed data for organizations table
-- =============================================================================
--
-- This file contains the seed data for multi-tenant organizations.
-- Run with: supabase db seed or via Supabase dashboard
--
-- Test Data Counts:
--   - 13 organizations total
--   - 2 production-like orgs (Acme Corp, TechStart Industries)
--   - 2 RLS test orgs (Alpha, Beta)
--   - 3 seed orgs for general testing
--   - 6 user-created orgs from test runs
-- =============================================================================

-- Clear existing data (for idempotent seeding)
-- Note: Be careful with this in production!
TRUNCATE organizations CASCADE;

-- =============================================================================
-- Core Test Organizations
-- =============================================================================

-- Primary test organizations (used by most tests)
INSERT INTO organizations (id, name, slug, subscription_tier, subscription_status, is_active, created_by)
VALUES
  -- Production-like organizations
  ('00000000-0000-0000-0000-000000000001', 'Acme Corporation', 'acme-corp', 'professional', 'active', true, NULL),
  ('00000000-0000-0000-0000-000000000002', 'TechStart Industries', 'techstart', 'basic', 'active', true, NULL),

  -- RLS Test Organizations (for isolation testing)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'RLS Test Org Alpha', 'rls-test-org-alpha', 'professional', 'active', true, NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'RLS Test Org Beta', 'rls-test-org-beta', 'professional', 'active', true, NULL);

-- =============================================================================
-- Seed Organizations (for integration tests)
-- =============================================================================

INSERT INTO organizations (id, name, slug, subscription_tier, subscription_status, is_active, created_by)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Acme Security Corp', 'seed-acme-security', 'free', 'trial', true, 'a1111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222', 'Guardian Systems Inc', 'seed-guardian-systems', 'free', 'trial', true, 'b1111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333333', 'Sentinel Protection LLC', 'seed-sentinel-protection', 'free', 'trial', true, 'c1111111-1111-1111-1111-111111111111');

-- =============================================================================
-- Verification Query
-- =============================================================================
-- Run this to verify seed data:
-- SELECT name, slug, subscription_tier, subscription_status FROM organizations ORDER BY name;
--
-- Expected output: 7 core organizations with various tiers
-- =============================================================================
