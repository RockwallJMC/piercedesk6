import { NextResponse } from 'next/server';
import { createApiClient } from 'lib/supabase/api-server';

// ============================================================================
// GET /api/crm/accounts
// Fetch all accounts for authenticated user's organizations
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

    // Get user's organization IDs
    const { data: memberships, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      return NextResponse.json(
        { error: 'Failed to fetch user organizations' },
        { status: 500 }
      );
    }

    const orgIds = memberships.map(m => m.organization_id);

    if (orgIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch accounts for user's organizations
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .in('organization_id', orgIds)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching accounts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 }
      );
    }

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/crm/accounts
// Create new account
// ============================================================================
export async function POST(request) {
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

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    if (!body.organization_id) {
      return NextResponse.json(
        { error: 'Missing required field: organization_id' },
        { status: 400 }
      );
    }

    // Verify user belongs to the specified organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('id, role')
      .eq('user_id', user.id)
      .eq('organization_id', body.organization_id)
      .eq('is_active', true)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    // Sanitize body - only allow specific fields (MVP: 4 fields)
    const allowedFields = ['name', 'industry', 'website', 'phone', 'organization_id'];
    const sanitizedData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    // Add server-derived fields
    sanitizedData.created_by = user.id;
    sanitizedData.owner_id = user.id;

    // Insert account
    const { data: newAccount, error } = await supabase
      .from('accounts')
      .insert(sanitizedData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating account:', error);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
