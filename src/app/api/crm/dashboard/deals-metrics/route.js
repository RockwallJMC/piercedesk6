import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * GET /api/crm/dashboard/deals-metrics
 * Returns deals created and closed counts with trends
 */
export async function GET(request) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization_id
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .maybeSingle();

    const organizationId = membership?.organization_id || user.user_metadata?.organization_id || user.app_metadata?.organization_id;

    if (!organizationId) {
      return NextResponse.json({ error: 'User is not a member of any active organization' }, { status: 400 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dateTo = searchParams.get('dateTo') || new Date().toISOString();

    // Calculate previous period dates for trend comparison
    const periodDuration = new Date(dateTo) - new Date(dateFrom);
    const prevDateFrom = new Date(new Date(dateFrom) - periodDuration).toISOString();
    const prevDateTo = dateFrom;

    // Current period - deals created
    const { count: createdCount, error: createdError } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('create_date', dateFrom)
      .lte('create_date', dateTo);

    if (createdError) throw createdError;

    // Previous period - deals created
    const { count: prevCreatedCount, error: prevCreatedError } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('create_date', prevDateFrom)
      .lte('create_date', prevDateTo);

    if (prevCreatedError) throw prevCreatedError;

    // Current period - deals closed
    const { count: closedCount, error: closedError } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .not('close_date', 'is', null)
      .gte('close_date', dateFrom)
      .lte('close_date', dateTo);

    if (closedError) throw closedError;

    // Previous period - deals closed
    const { count: prevClosedCount, error: prevClosedError } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .not('close_date', 'is', null)
      .gte('close_date', prevDateFrom)
      .lte('close_date', prevDateTo);

    if (prevClosedError) throw prevClosedError;

    // Calculate percentages and trends
    const createdPercentage = prevCreatedCount > 0
      ? (((createdCount - prevCreatedCount) / prevCreatedCount) * 100).toFixed(1)
      : 0;

    const closedPercentage = prevClosedCount > 0
      ? (((closedCount - prevClosedCount) / prevClosedCount) * 100).toFixed(1)
      : 0;

    const createdTrend = createdPercentage > 0 ? 'up' : createdPercentage < 0 ? 'down' : 'stable';
    const closedTrend = closedPercentage > 0 ? 'up' : closedPercentage < 0 ? 'down' : 'stable';

    return NextResponse.json({
      created: {
        count: createdCount || 0,
        percentage: parseFloat(createdPercentage),
        trend: createdTrend
      },
      closed: {
        count: closedCount || 0,
        percentage: parseFloat(closedPercentage),
        trend: closedTrend
      }
    });

  } catch (error) {
    console.error('Dashboard deals-metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals metrics' },
      { status: 500 }
    );
  }
}
