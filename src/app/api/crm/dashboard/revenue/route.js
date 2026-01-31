import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

/**
 * GET /api/crm/dashboard/revenue
 * Returns revenue data with month-over-month trends
 */
export async function GET(request) {
  try {
    const supabase = createApiClient(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate current and previous month dates
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // This month's revenue (won deals with close_date in current month)
    const { data: thisMonthDeals, error: thisMonthError } = await supabase
      .from('deals')
      .select('amount')
      .eq('user_id', user.id)
      .eq('stage', 'Won')
      .gte('close_date', firstDayThisMonth.toISOString())
      .lte('close_date', now.toISOString());

    if (thisMonthError) throw thisMonthError;

    const thisMonth = thisMonthDeals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0);

    // Last month's revenue
    const { data: lastMonthDeals, error: lastMonthError } = await supabase
      .from('deals')
      .select('amount')
      .eq('user_id', user.id)
      .eq('stage', 'Won')
      .gte('close_date', firstDayLastMonth.toISOString())
      .lt('close_date', firstDayThisMonth.toISOString());

    if (lastMonthError) throw lastMonthError;

    const lastMonth = lastMonthDeals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0);

    // Calculate month-over-month percentage
    const monthOverMonth = lastMonth > 0
      ? parseFloat((((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1))
      : 0;

    const trend = monthOverMonth > 0 ? 'up' : monthOverMonth < 0 ? 'down' : 'stable';

    return NextResponse.json({
      thisMonth: parseFloat(thisMonth.toFixed(2)),
      lastMonth: parseFloat(lastMonth.toFixed(2)),
      monthOverMonth,
      trend
    });

  } catch (error) {
    console.error('Dashboard revenue error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
