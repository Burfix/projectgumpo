import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { protectRoute } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verify SUPER_ADMIN role
    await protectRoute(['SUPER_ADMIN']);

    const supabase = await createClient();
    const limit = request.nextUrl.searchParams.get('limit') || '5';

    // Fetch recent audit logs
    const { data, error } = await supabase
      .from('super_admin_audit')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
