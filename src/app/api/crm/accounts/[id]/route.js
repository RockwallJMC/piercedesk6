import { NextResponse } from 'next/server';
import { createApiClient } from 'lib/supabase/api-server';

// Helper: Check if user has access to the account via organization membership
async function verifyAccountAccess(supabase, userId, accountId) {
  // Get the account's organization_id
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id, organization_id')
    .eq('id', accountId)
    .single();

  if (accountError || !account) {
    return { hasAccess: false, account: null, error: 'Account not found' };
  }

  // Verify user belongs to that organization
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('id, role')
    .eq('user_id', userId)
    .eq('organization_id', account.organization_id)
    .eq('is_active', true)
    .single();

  if (membershipError || !membership) {
    return { hasAccess: false, account: null, error: 'Access denied' };
  }

  return { hasAccess: true, account, membership };
}

// ============================================================================
// GET /api/crm/accounts/[id]
// Fetch single account by ID
// ============================================================================
export async function GET(request, { params }) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token server-side
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accountId = (await params).id;

    // Verify access and get account
    const { hasAccess, error: accessError } = await verifyAccountAccess(supabase, user.id, accountId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: accessError },
        { status: accessError === 'Account not found' ? 404 : 403 }
      );
    }

    // Fetch full account details
    const { data: account, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) {
      console.error('Error fetching account:', error);
      return NextResponse.json(
        { error: 'Failed to fetch account' },
        { status: 500 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/crm/accounts/[id]
// Update existing account
// ============================================================================
export async function PATCH(request, { params }) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token server-side
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accountId = (await params).id;
    const body = await request.json();

    // Verify access
    const { hasAccess, account, error: accessError } = await verifyAccountAccess(supabase, user.id, accountId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: accessError },
        { status: accessError === 'Account not found' ? 404 : 403 }
      );
    }

    // Sanitize body - only allow specific fields (MVP: 4 fields)
    const allowedFields = ['name', 'industry', 'website', 'phone'];
    const sanitizedData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    // Add updated_at timestamp
    sanitizedData.updated_at = new Date().toISOString();

    // Update account with organization filter for defense-in-depth
    const { data: updatedAccount, error: updateError } = await supabase
      .from('accounts')
      .update(sanitizedData)
      .eq('id', accountId)
      .eq('organization_id', account.organization_id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating account:', updateError);
      return NextResponse.json(
        { error: 'Failed to update account' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/crm/accounts/[id]
// Delete account
// ============================================================================
export async function DELETE(request, { params }) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token server-side
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accountId = (await params).id;

    // Verify access
    const { hasAccess, account, error: accessError } = await verifyAccountAccess(supabase, user.id, accountId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: accessError },
        { status: accessError === 'Account not found' ? 404 : 403 }
      );
    }

    // Delete account with organization filter for defense-in-depth
    const { error: deleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)
      .eq('organization_id', account.organization_id);

    if (deleteError) {
      console.error('Error deleting account:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
