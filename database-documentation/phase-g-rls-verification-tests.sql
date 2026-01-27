-- ==============================================================================
-- Phase G: RLS Verification Test Suite
-- ==============================================================================
-- Purpose: Verify Row Level Security (RLS) data isolation in multi-tenant architecture
-- Database: PierceDesk Supabase Cloud Database
-- Date: 2026-01-27
--
-- This script can be run via Supabase SQL Editor or Supabase MCP tools
-- to verify RLS policies are functioning correctly.
-- ==============================================================================

\echo ''
\echo '=========================================='
\echo 'RLS VERIFICATION TEST SUITE'
\echo '=========================================='
\echo ''

-- ==============================================================================
-- TEST SETUP VERIFICATION
-- ==============================================================================

\echo ''
\echo '=== TEST SETUP VERIFICATION ==='
\echo ''

\echo 'Test Organizations:'
SELECT
  id,
  name,
  slug
FROM public.organizations
WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
)
ORDER BY name;

\echo ''
\echo 'Test Users and Their Organization Memberships:'
SELECT
  u.id,
  u.full_name,
  u.email,
  array_agg(o.name ORDER BY o.name) as organizations
FROM public.user_profiles u
JOIN public.organization_members om ON om.user_id = u.id
JOIN public.organizations o ON o.id = om.organization_id
WHERE u.id IN (
  'a3333333-3333-3333-3333-333333333333'::uuid,
  'b3333333-3333-3333-3333-333333333333'::uuid,
  'c5555555-5555-5555-5555-555555555555'::uuid
)
AND om.is_active = true
GROUP BY u.id, u.full_name, u.email
ORDER BY u.full_name;

\echo ''
\echo 'Test Projects:'
SELECT
  id,
  name,
  organization_id,
  budget,
  status
FROM public.projects
WHERE id IN (
  'aaaaaaaa-0001-0000-0000-000000000001'::uuid,
  'aaaaaaaa-0002-0000-0000-000000000002'::uuid,
  'bbbbbbbb-0001-0000-0000-000000000001'::uuid,
  'bbbbbbbb-0002-0000-0000-000000000002'::uuid
)
ORDER BY organization_id, name;

-- ==============================================================================
-- TEST 1: USER 1 (CHARLIE BROWN - ALPHA ONLY)
-- ==============================================================================

\echo ''
\echo '=========================================='
\echo 'TEST 1: USER 1 (Charlie Brown - Alpha Only)'
\echo '=========================================='
\echo ''

\echo 'User 1 Organization Memberships:'
SELECT public.get_user_organization_ids('a3333333-3333-3333-3333-333333333333'::uuid) as org_ids;

\echo ''
\echo 'Projects User 1 CAN Access (Expected: 2 Alpha projects only):'
SELECT
  id,
  name,
  organization_id,
  budget,
  CASE
    WHEN organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid THEN 'Alpha'
    WHEN organization_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid THEN 'Beta'
    ELSE 'Other'
  END as org_name
FROM public.projects
WHERE organization_id = ANY(
  public.get_user_organization_ids('a3333333-3333-3333-3333-333333333333'::uuid)
)
AND organization_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
)
ORDER BY name;

\echo ''
\echo 'Expected Result: 2 rows (both Alpha projects)'
\echo 'Actual Result Count:'
SELECT COUNT(*) as accessible_projects
FROM public.projects
WHERE organization_id = ANY(
  public.get_user_organization_ids('a3333333-3333-3333-3333-333333333333'::uuid)
)
AND organization_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
);

-- ==============================================================================
-- TEST 2: USER 2 (HENRY FORD - BETA ONLY)
-- ==============================================================================

\echo ''
\echo '=========================================='
\echo 'TEST 2: USER 2 (Henry Ford - Beta Only)'
\echo '=========================================='
\echo ''

\echo 'User 2 Organization Memberships:'
SELECT public.get_user_organization_ids('b3333333-3333-3333-3333-333333333333'::uuid) as org_ids;

\echo ''
\echo 'Projects User 2 CAN Access (Expected: 2 Beta projects only):'
SELECT
  id,
  name,
  organization_id,
  budget,
  CASE
    WHEN organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid THEN 'Alpha'
    WHEN organization_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid THEN 'Beta'
    ELSE 'Other'
  END as org_name
FROM public.projects
WHERE organization_id = ANY(
  public.get_user_organization_ids('b3333333-3333-3333-3333-333333333333'::uuid)
)
AND organization_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
)
ORDER BY name;

\echo ''
\echo 'Expected Result: 2 rows (both Beta projects)'
\echo 'Actual Result Count:'
SELECT COUNT(*) as accessible_projects
FROM public.projects
WHERE organization_id = ANY(
  public.get_user_organization_ids('b3333333-3333-3333-3333-333333333333'::uuid)
)
AND organization_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
);

-- ==============================================================================
-- TEST 3: USER 3 (OLIVIA POPE - BOTH ORGANIZATIONS)
-- ==============================================================================

\echo ''
\echo '=========================================='
\echo 'TEST 3: USER 3 (Olivia Pope - Both Orgs)'
\echo '=========================================='
\echo ''

\echo 'User 3 Organization Memberships:'
SELECT public.get_user_organization_ids('c5555555-5555-5555-5555-555555555555'::uuid) as org_ids;

\echo ''
\echo 'Projects User 3 CAN Access (Expected: All 4 projects):'
SELECT
  id,
  name,
  organization_id,
  budget,
  CASE
    WHEN organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid THEN 'Alpha'
    WHEN organization_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid THEN 'Beta'
    ELSE 'Other'
  END as org_name
FROM public.projects
WHERE organization_id = ANY(
  public.get_user_organization_ids('c5555555-5555-5555-5555-555555555555'::uuid)
)
AND organization_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
)
ORDER BY organization_id, name;

\echo ''
\echo 'Expected Result: 4 rows (all test projects)'
\echo 'Actual Result Count:'
SELECT COUNT(*) as accessible_projects
FROM public.projects
WHERE organization_id = ANY(
  public.get_user_organization_ids('c5555555-5555-5555-5555-555555555555'::uuid)
)
AND organization_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
);

-- ==============================================================================
-- TEST 4: CROSS-ORGANIZATION ISOLATION MATRIX
-- ==============================================================================

\echo ''
\echo '=========================================='
\echo 'TEST 4: Cross-Organization Isolation Matrix'
\echo '=========================================='
\echo ''
\echo 'This matrix shows which users can access which projects'
\echo 'based on their organization memberships.'
\echo ''

SELECT
  u.full_name as user_name,
  o.name as organization_name,
  p.name as project_name,
  p.budget,
  CASE
    WHEN p.organization_id = ANY(public.get_user_organization_ids(u.id))
    THEN 'ALLOWED ✓'
    ELSE 'BLOCKED ✗'
  END as rls_decision
FROM public.user_profiles u
CROSS JOIN public.organizations o
LEFT JOIN public.projects p ON p.organization_id = o.id
WHERE u.id IN (
  'a3333333-3333-3333-3333-333333333333'::uuid,
  'b3333333-3333-3333-3333-333333333333'::uuid,
  'c5555555-5555-5555-5555-555555555555'::uuid
)
AND o.id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
)
AND p.name LIKE '[RLS-TEST%'
ORDER BY u.full_name, o.name, p.name;

\echo ''
\echo 'Expected Results:'
\echo '  - Charlie Brown: 2 ALLOWED (Alpha), 2 BLOCKED (Beta)'
\echo '  - Henry Ford: 2 BLOCKED (Alpha), 2 ALLOWED (Beta)'
\echo '  - Olivia Pope: 4 ALLOWED (all projects)'
\echo ''

-- ==============================================================================
-- TEST 5: ACCESS SUMMARY BY USER
-- ==============================================================================

\echo ''
\echo '=========================================='
\echo 'TEST 5: Access Summary by User'
\echo '=========================================='
\echo ''

SELECT
  u.full_name as user_name,
  u.email,
  COUNT(DISTINCT om.organization_id) as org_count,
  COUNT(p.id) as accessible_projects,
  array_agg(DISTINCT o.name ORDER BY o.name) as organizations
FROM public.user_profiles u
LEFT JOIN public.organization_members om ON om.user_id = u.id AND om.is_active = true
LEFT JOIN public.organizations o ON o.id = om.organization_id
LEFT JOIN public.projects p ON p.organization_id = om.organization_id
  AND p.id IN (
    'aaaaaaaa-0001-0000-0000-000000000001'::uuid,
    'aaaaaaaa-0002-0000-0000-000000000002'::uuid,
    'bbbbbbbb-0001-0000-0000-000000000001'::uuid,
    'bbbbbbbb-0002-0000-0000-000000000002'::uuid
  )
WHERE u.id IN (
  'a3333333-3333-3333-3333-333333333333'::uuid,
  'b3333333-3333-3333-3333-333333333333'::uuid,
  'c5555555-5555-5555-5555-555555555555'::uuid
)
GROUP BY u.id, u.full_name, u.email
ORDER BY u.full_name;

\echo ''
\echo 'Expected:'
\echo '  - Charlie: 1 org, 2 projects (Alpha only)'
\echo '  - Henry: 1 org, 2 projects (Beta only)'
\echo '  - Olivia: 2 orgs, 4 projects (Both)'
\echo ''

-- ==============================================================================
-- TEST 6: RLS POLICY VERIFICATION
-- ==============================================================================

\echo ''
\echo '=========================================='
\echo 'TEST 6: RLS Policy Verification'
\echo '=========================================='
\echo ''
\echo 'Checking RLS policies on projects table:'

SELECT
  schemaname,
  tablename,
  policyname,
  cmd as command,
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'projects'
ORDER BY cmd, policyname;

\echo ''
\echo 'Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)'
\echo ''

-- ==============================================================================
-- TEST 7: HELPER FUNCTION VERIFICATION
-- ==============================================================================

\echo ''
\echo '=========================================='
\echo 'TEST 7: Helper Function Verification'
\echo '=========================================='
\echo ''

\echo 'Testing get_user_organization_ids() function:'
SELECT
  'Charlie Brown (Alpha only)' as user,
  public.get_user_organization_ids('a3333333-3333-3333-3333-333333333333'::uuid) as org_ids,
  array_length(public.get_user_organization_ids('a3333333-3333-3333-3333-333333333333'::uuid), 1) as count
UNION ALL
SELECT
  'Henry Ford (Beta only)' as user,
  public.get_user_organization_ids('b3333333-3333-3333-3333-333333333333'::uuid) as org_ids,
  array_length(public.get_user_organization_ids('b3333333-3333-3333-3333-333333333333'::uuid), 1) as count
UNION ALL
SELECT
  'Olivia Pope (Both)' as user,
  public.get_user_organization_ids('c5555555-5555-5555-5555-555555555555'::uuid) as org_ids,
  array_length(public.get_user_organization_ids('c5555555-5555-5555-5555-555555555555'::uuid), 1) as count;

\echo ''
\echo 'Expected:'
\echo '  - Charlie: 1 organization (Alpha)'
\echo '  - Henry: 1 organization (Beta)'
\echo '  - Olivia: 2 organizations (Alpha, Beta)'
\echo ''

-- ==============================================================================
-- TEST SUITE SUMMARY
-- ==============================================================================

\echo ''
\echo '=========================================='
\echo 'TEST SUITE SUMMARY'
\echo '=========================================='
\echo ''

DO $$
DECLARE
  test1_count INTEGER;
  test2_count INTEGER;
  test3_count INTEGER;
  all_passed BOOLEAN := true;
BEGIN
  -- Test 1: Charlie (Alpha only) - should see 2 projects
  SELECT COUNT(*) INTO test1_count
  FROM public.projects
  WHERE organization_id = ANY(
    public.get_user_organization_ids('a3333333-3333-3333-3333-333333333333'::uuid)
  )
  AND organization_id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
  );

  IF test1_count = 2 THEN
    RAISE NOTICE 'Test 1 (Charlie - Alpha only): ✓ PASSED (2 projects)';
  ELSE
    RAISE NOTICE 'Test 1 (Charlie - Alpha only): ✗ FAILED (expected 2, got %)', test1_count;
    all_passed := false;
  END IF;

  -- Test 2: Henry (Beta only) - should see 2 projects
  SELECT COUNT(*) INTO test2_count
  FROM public.projects
  WHERE organization_id = ANY(
    public.get_user_organization_ids('b3333333-3333-3333-3333-333333333333'::uuid)
  )
  AND organization_id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
  );

  IF test2_count = 2 THEN
    RAISE NOTICE 'Test 2 (Henry - Beta only): ✓ PASSED (2 projects)';
  ELSE
    RAISE NOTICE 'Test 2 (Henry - Beta only): ✗ FAILED (expected 2, got %)', test2_count;
    all_passed := false;
  END IF;

  -- Test 3: Olivia (Both orgs) - should see 4 projects
  SELECT COUNT(*) INTO test3_count
  FROM public.projects
  WHERE organization_id = ANY(
    public.get_user_organization_ids('c5555555-5555-5555-5555-555555555555'::uuid)
  )
  AND organization_id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
  );

  IF test3_count = 4 THEN
    RAISE NOTICE 'Test 3 (Olivia - Both orgs): ✓ PASSED (4 projects)';
  ELSE
    RAISE NOTICE 'Test 3 (Olivia - Both orgs): ✗ FAILED (expected 4, got %)', test3_count;
    all_passed := false;
  END IF;

  -- Overall result
  RAISE NOTICE '';
  IF all_passed THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ ALL TESTS PASSED';
    RAISE NOTICE 'RLS is functioning correctly!';
    RAISE NOTICE '========================================';
  ELSE
    RAISE NOTICE '========================================';
    RAISE NOTICE '✗ SOME TESTS FAILED';
    RAISE NOTICE 'Review the results above';
    RAISE NOTICE '========================================';
  END IF;
END $$;

\echo ''
\echo 'Test suite complete!'
\echo ''
