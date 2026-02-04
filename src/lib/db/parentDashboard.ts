import { createClient } from '@/lib/supabase/server';
import type { 
  Child, 
  AttendanceLog, 
  MealLog, 
  NapLog, 
  IncidentReport,
  Message,
  ParentDashboardData 
} from '@/types/database';

/**
 * Get children linked to a parent (no school_id required)
 */
export async function getParentChildren(parentId: string): Promise<Child[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('parent_child')
    .select(`
      child:children (
        id,
        school_id,
        classroom_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        allergies,
        medical_notes,
        photo_url,
        status,
        created_at,
        updated_at
      )
    `)
    .eq('parent_id', parentId);

  if (error) {
    console.error('Error fetching parent children:', error);
    return [];
  }

  // Flatten nested array and filter out null values
  const children = data?.map(pc => pc.child).flat().filter(Boolean) || [];
  return children as Child[];
}

/**
 * Get attendance history for a child (last 30 days)
 */
export async function getChildAttendanceHistory(childId: number): Promise<AttendanceLog[]> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('child_id', childId)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching attendance history:', error);
    return [];
  }

  return data || [];
}

/**
 * Get recent meals for a child (last 7 days)
 */
export async function getChildRecentMeals(childId: number): Promise<MealLog[]> {
  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('child_id', childId)
    .gte('date', weekAgo.toISOString().split('T')[0])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching meals:', error);
    return [];
  }

  return data || [];
}

/**
 * Get recent naps for a child (last 7 days)
 */
export async function getChildRecentNaps(childId: number): Promise<NapLog[]> {
  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const { data, error } = await supabase
    .from('nap_logs')
    .select('*')
    .eq('child_id', childId)
    .gte('date', weekAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching naps:', error);
    return [];
  }

  return data || [];
}

/**
 * Get incidents for a child (last 30 days)
 */
export async function getChildIncidents(childId: number): Promise<IncidentReport[]> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data, error } = await supabase
    .from('incident_reports')
    .select('*')
    .eq('child_id', childId)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('occurred_at', { ascending: false });

  if (error) {
    console.error('Error fetching incidents:', error);
    return [];
  }

  return data || [];
}

/**
 * Get messages for a parent
 */
export async function getParentMessages(parentId: string): Promise<Message[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`recipient_id.eq.${parentId},message_type.eq.announcement`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

/**
 * Get unread message count for a parent
 */
export async function getUnreadMessageCount(parentId: string): Promise<number> {
  const supabase = await createClient();
  
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', parentId)
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('messages')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('id', messageId);

  if (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

/**
 * Get complete parent dashboard data
 */
export async function getParentDashboardData(parentId: string): Promise<ParentDashboardData | null> {
  // Get parent's children
  const children = await getParentChildren(parentId);
  
  if (children.length === 0) {
    return {
      children: [],
      attendance_history: [],
      recent_meals: [],
      recent_naps: [],
      incidents: [],
      messages: [],
    };
  }

  // Get data for all children in parallel
  const childIds = children.map(c => c.id);
  
  const [messages, ...childData] = await Promise.all([
    getParentMessages(parentId),
    ...childIds.map(async (childId) => ({
      childId,
      attendance: await getChildAttendanceHistory(childId),
      meals: await getChildRecentMeals(childId),
      naps: await getChildRecentNaps(childId),
      incidents: await getChildIncidents(childId),
    })),
  ]);

  // Combine all child data
  const attendance_history = childData.flatMap(d => d.attendance);
  const recent_meals = childData.flatMap(d => d.meals);
  const recent_naps = childData.flatMap(d => d.naps);
  const incidents = childData.flatMap(d => d.incidents);

  return {
    children,
    attendance_history,
    recent_meals,
    recent_naps,
    incidents,
    messages,
  };
}

/**
 * Get today's summary for a child
 */
export async function getChildTodaySummary(childId: number) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Get today's attendance
  const { data: attendance } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('child_id', childId)
    .eq('date', today)
    .single();

  // Get today's meals
  const { data: meals } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('child_id', childId)
    .eq('date', today)
    .order('created_at', { ascending: false });

  // Get today's nap
  const { data: naps } = await supabase
    .from('nap_logs')
    .select('*')
    .eq('child_id', childId)
    .eq('date', today)
    .order('start_time', { ascending: false });

  // Get today's incidents
  const { data: incidents } = await supabase
    .from('incident_reports')
    .select('*')
    .eq('child_id', childId)
    .eq('date', today);

  return {
    attendance: attendance || null,
    meals: meals || [],
    naps: naps || [],
    incidents: incidents || [],
    has_checked_in: !!attendance?.check_in_time,
    has_checked_out: !!attendance?.check_out_time,
  };
}

/**
 * Get child's daily timeline (for parent timeline view)
 */
export async function getChildDailyTimeline(childId: number, date?: string) {
  const supabase = await createClient();
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Get all events for the day
  const [attendance, meals, naps, incidents] = await Promise.all([
    supabase
      .from('attendance_logs')
      .select('*')
      .eq('child_id', childId)
      .eq('date', targetDate),
    supabase
      .from('meal_logs')
      .select('*')
      .eq('child_id', childId)
      .eq('date', targetDate),
    supabase
      .from('nap_logs')
      .select('*')
      .eq('child_id', childId)
      .eq('date', targetDate),
    supabase
      .from('incident_reports')
      .select('*')
      .eq('child_id', childId)
      .eq('date', targetDate),
  ]);

  // Combine into timeline events
  type TimelineEvent = {
    type: 'check_in' | 'check_out' | 'meal' | 'nap_start' | 'nap_end' | 'incident';
    time: string;
    data: Record<string, unknown>;
  };
  
  const events: TimelineEvent[] = [];

  // Add attendance events
  if (attendance.data?.[0]) {
    if (attendance.data[0].check_in_time) {
      events.push({
        type: 'check_in',
        time: attendance.data[0].check_in_time,
        data: attendance.data[0],
      });
    }
    if (attendance.data[0].check_out_time) {
      events.push({
        type: 'check_out',
        time: attendance.data[0].check_out_time,
        data: attendance.data[0],
      });
    }
  }

  // Add meal events
  meals.data?.forEach(meal => {
    events.push({
      type: 'meal',
      time: meal.created_at,
      data: meal,
    });
  });

  // Add nap events
  naps.data?.forEach(nap => {
    events.push({
      type: 'nap_start',
      time: nap.start_time,
      data: nap,
    });
    if (nap.end_time) {
      events.push({
        type: 'nap_end',
        time: nap.end_time,
        data: nap,
      });
    }
  });

  // Add incident events
  incidents.data?.forEach(incident => {
    events.push({
      type: 'incident',
      time: incident.occurred_at,
      data: incident,
    });
  });

  // Sort by time
  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return events;
}
