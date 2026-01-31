import { createApiClient } from '@/lib/supabase/api-server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = createApiClient(request);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization from organization_members
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Organization membership not found' },
        { status: 403 }
      );
    }

    // Fetch contacts with account join
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        phone,
        mobile,
        title,
        department,
        status,
        lead_status,
        lead_source,
        tags,
        archived,
        account:accounts(
          id,
          name,
          industry
        )
      `
      )
      .eq('organization_id', membership.organization_id)
      .eq('archived', false) // Only active contacts
      .order('created_at', { ascending: false });

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ contacts }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/crm/contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
