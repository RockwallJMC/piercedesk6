import { NextResponse } from 'next/server';
import { createApiClient } from 'lib/supabase/api-server';

// ============================================================================
// GET /api/organizations
// Fetch all organizations the authenticated user belongs to
// ============================================================================
export async function GET(request) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token server-side (more secure than getSession)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization memberships with org details
    const { data: memberships, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        role,
        is_active,
        organization:organizations(*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching organizations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      );
    }

    // Extract organization details
    const organizations = memberships
      .filter(m => m.organization)
      .map(m => ({
        ...m.organization,
        role: m.role,
      }));

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
