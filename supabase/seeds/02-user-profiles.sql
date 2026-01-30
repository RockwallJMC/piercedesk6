-- =============================================================================
-- 02-user-profiles.sql
-- Seed data for user_profiles and organization_members tables
-- =============================================================================
--
-- This file contains the seed data for user profiles and org memberships.
-- Note: auth.users are created via Supabase Auth, not direct SQL inserts.
-- user_profiles are created via trigger on auth.users insert.
--
-- Test Data Counts:
--   - 21 user profiles total
--   - 15 seed test users (alice, bob, charlie, etc.)
--   - 6 test runner users (test-existing, test-single-org, etc.)
--   - 40 organization memberships
-- =============================================================================

-- =============================================================================
-- User Profiles (created via auth trigger, shown here for reference)
-- =============================================================================

-- Note: User profiles are automatically created when users sign up via Supabase Auth.
-- The trigger `on_auth_user_created` creates a profile in user_profiles.
-- These are the expected profiles for testing:

-- Acme Security Corp Users (Org 11111111-...)
-- a1111111-1111-1111-1111-111111111111 - alice.owner@seedtest.com - Alice Admin (Acme) - OWNER
-- a2222222-2222-2222-2222-222222222222 - bob.admin@seedtest.com - Bob Manager (Acme) - ADMIN
-- a3333333-3333-3333-3333-333333333333 - charlie.member@seedtest.com - Charlie Member (Acme) - MEMBER
-- a4444444-4444-4444-4444-444444444444 - diana.member@seedtest.com - Diana Prince - MEMBER
-- a5555555-5555-5555-5555-555555555555 - edward.member@seedtest.com - Edward Norton - MEMBER

-- Guardian Systems Users (Org 22222222-...)
-- b1111111-1111-1111-1111-111111111111 - frank.owner@seedtest.com - Frank CEO (TechStart) - OWNER
-- b2222222-2222-2222-2222-222222222222 - grace.admin@seedtest.com - Grace Rep (TechStart) - ADMIN
-- b3333333-3333-3333-3333-333333333333 - henry.member@seedtest.com - Henry Ford - MEMBER
-- b4444444-4444-4444-4444-444444444444 - irene.member@seedtest.com - Irene Adler - MEMBER
-- b5555555-5555-5555-5555-555555555555 - james.member@seedtest.com - James Bond - MEMBER

-- Sentinel Protection Users (Org 33333333-...)
-- c1111111-1111-1111-1111-111111111111 - kate.owner@seedtest.com - Kate Bishop - OWNER
-- c2222222-2222-2222-2222-222222222222 - lucas.admin@seedtest.com - Lucas Scott - ADMIN
-- c3333333-3333-3333-3333-333333333333 - mary.member@seedtest.com - Mary Jane - MEMBER
-- c4444444-4444-4444-4444-444444444444 - nathan.member@seedtest.com - Nathan Drake - MEMBER
-- c5555555-5555-5555-5555-555555555555 - olivia.member@seedtest.com - Olivia Pope - MEMBER

-- =============================================================================
-- Organization Members (Junction Table)
-- =============================================================================

-- Clear existing memberships for seed orgs
DELETE FROM organization_members
WHERE organization_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Acme Security Corp Memberships
INSERT INTO organization_members (organization_id, user_id, role, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'owner', true),
  ('11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'admin', true),
  ('11111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'member', true),
  ('11111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'member', true),
  ('11111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'member', true);

-- Guardian Systems Memberships
INSERT INTO organization_members (organization_id, user_id, role, is_active)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'owner', true),
  ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'admin', true),
  ('22222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 'member', true),
  ('22222222-2222-2222-2222-222222222222', 'b4444444-4444-4444-4444-444444444444', 'member', true),
  ('22222222-2222-2222-2222-222222222222', 'b5555555-5555-5555-5555-555555555555', 'member', true);

-- Sentinel Protection Memberships
INSERT INTO organization_members (organization_id, user_id, role, is_active)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'owner', true),
  ('33333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'admin', true),
  ('33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'member', true),
  ('33333333-3333-3333-3333-333333333333', 'c4444444-4444-4444-4444-444444444444', 'member', true),
  ('33333333-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', 'member', true);

-- RLS Test Org Alpha Memberships (for isolation testing)
INSERT INTO organization_members (organization_id, user_id, role, is_active)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a3333333-3333-3333-3333-333333333333', 'member', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c5555555-5555-5555-5555-555555555555', 'member', true);

-- RLS Test Org Beta Memberships (for isolation testing)
INSERT INTO organization_members (organization_id, user_id, role, is_active)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b3333333-3333-3333-3333-333333333333', 'member', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c5555555-5555-5555-5555-555555555555', 'member', true);

-- =============================================================================
-- Verification Query
-- =============================================================================
-- Run this to verify seed data:
-- SELECT o.name, COUNT(om.id) as member_count
-- FROM organizations o
-- JOIN organization_members om ON o.id = om.organization_id
-- GROUP BY o.name ORDER BY o.name;
--
-- Expected: Each seed org has 5 members, RLS test orgs have 2 each
-- =============================================================================
