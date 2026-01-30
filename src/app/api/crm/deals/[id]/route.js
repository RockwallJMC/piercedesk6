import { NextResponse } from 'next/server';
import { createApiClient } from 'lib/supabase/api-server';

// Helper: Format decimal fields as strings with 2 decimal places
function formatDealDecimals(deal) {
  if (!deal) return deal;
  return {
    ...deal,
    amount: deal.amount != null ? Number(deal.amount).toFixed(2) : null
  };
}

// ============================================================================
// PATCH /api/crm/deals/[id]
// Update existing deal
// ============================================================================
export async function PATCH(request, { params }) {
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

    const dealId = (await params).id;
    const body = await request.json();

    // Check if deal exists with explicit user filter (RLS + defense-in-depth)
    const { data: existingDeal, error: fetchError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Sanitize body - only allow specific fields (prevent user_id injection)
    const allowedFields = ['name', 'stage', 'stage_order', 'company_id', 'contact_id', 'amount', 'priority', 'progress', 'close_date'];
    const sanitizedData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    // Add last_update timestamp
    sanitizedData.last_update = new Date().toISOString();

    // Update deal with explicit user filter
    const { data: updatedDeal, error: updateError } = await supabase
      .from('deals')
      .update(sanitizedData)
      .eq('id', dealId)
      .eq('user_id', user.id)
      .select(`
        *,
        company:companies(*),
        contact:crm_contacts(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating deal:', updateError);
      return NextResponse.json(
        { error: 'Failed to update deal' },
        { status: 500 }
      );
    }

    return NextResponse.json(formatDealDecimals(updatedDeal));
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
