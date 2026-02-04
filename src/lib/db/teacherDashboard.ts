import { createClient } from '@/lib/supabase/server';
import type { 
  Classroom, 
  Child, 
  AttendanceLog, 
  MealLog, 
  NapLog, 
  IncidentReport,
  DailyActivity,
  TeacherDashboardData 
} from '@/types/database';

/**
 * Get the classrooms assigned to a teacher
 */
export async function getTeacherClassrooms(teacherId: string): Promise<Classroom[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('teacher_classroom')
    .select(`
      classroom:classrooms (
        id,
        name,
        school_id,
        capacity,
        age_group,
        description,
        created_at,
        updated_at
      )
    `)
    .eq('teacher_id', teacherId);

  if (error) {
    console.error('Error fetching teacher classrooms:', error);
    return [];
  }

  return data?.map(tc => tc.classroom).filter(Boolean) as Classroom[] || [];
}

/**
 * Get children in a specific classroom
 */
export async function getClassroomChildren(classroomId: number): Promise<Child[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('status', 'active')
    .order('first_name');

  if (error) {
    console.error('Error fetching classroom children:', error);
    return [];
  }

  return data || [];
}

/**
 * Get today's attendance for a classroom
 */
export async function getClassroomAttendanceToday(classroomId: number): Promise<AttendanceLog[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('date', today);

  if (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }

  return data || [];
}

/**
 * Get today's meals for a classroom
 */
export async function getClassroomMealsToday(classroomId: number): Promise<MealLog[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('date', today)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching meals:', error);
    return [];
  }

  return data || [];
}

/**
 * Get today's naps for a classroom
 */
export async function getClassroomNapsToday(classroomId: number): Promise<NapLog[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('nap_logs')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('date', today)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching naps:', error);
    return [];
  }

  return data || [];
}

/**
 * Get recent incidents for a classroom (last 7 days)
 */
export async function getClassroomRecentIncidents(classroomId: number): Promise<IncidentReport[]> {
  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const { data, error } = await supabase
    .from('incident_reports')
    .select('*')
    .eq('classroom_id', classroomId)
    .gte('date', weekAgo.toISOString().split('T')[0])
    .order('occurred_at', { ascending: false });

  if (error) {
    console.error('Error fetching incidents:', error);
    return [];
  }

  return data || [];
}

/**
 * Get today's activities for a classroom
 */
export async function getClassroomActivitiesToday(classroomId: number): Promise<DailyActivity[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_activities')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('date', today)
    .order('start_time');

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return data || [];
}

/**
 * Get complete teacher dashboard data for a classroom
 */
export async function getTeacherDashboardData(
  teacherId: string, 
  classroomId?: number
): Promise<TeacherDashboardData | null> {
  // Get teacher's classrooms
  const classrooms = await getTeacherClassrooms(teacherId);
  
  if (classrooms.length === 0) {
    return null;
  }

  // Use specified classroom or first assigned classroom
  const classroom = classroomId 
    ? classrooms.find(c => c.id === classroomId) || classrooms[0]
    : classrooms[0];

  // Fetch all data in parallel
  const [children, attendance_today, recent_incidents, activities_today] = await Promise.all([
    getClassroomChildren(classroom.id),
    getClassroomAttendanceToday(classroom.id),
    getClassroomRecentIncidents(classroom.id),
    getClassroomActivitiesToday(classroom.id),
  ]);

  return {
    classroom,
    children,
    attendance_today,
    recent_incidents,
    activities_today,
  };
}

/**
 * Get teacher dashboard stats
 */
export async function getTeacherDashboardStats(classroomId: number) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Get children count
  const { count: totalChildren } = await supabase
    .from('children')
    .select('*', { count: 'exact', head: true })
    .eq('classroom_id', classroomId)
    .eq('status', 'active');

  // Get present count
  const { count: presentCount } = await supabase
    .from('attendance_logs')
    .select('*', { count: 'exact', head: true })
    .eq('classroom_id', classroomId)
    .eq('date', today)
    .eq('status', 'present');

  // Get incidents today
  const { count: incidentsToday } = await supabase
    .from('incident_reports')
    .select('*', { count: 'exact', head: true })
    .eq('classroom_id', classroomId)
    .eq('date', today);

  // Get meals logged
  const { count: mealsLogged } = await supabase
    .from('meal_logs')
    .select('*', { count: 'exact', head: true })
    .eq('classroom_id', classroomId)
    .eq('date', today);

  // Get naps logged
  const { count: napsLogged } = await supabase
    .from('nap_logs')
    .select('*', { count: 'exact', head: true })
    .eq('classroom_id', classroomId)
    .eq('date', today);

  return {
    total_children: totalChildren || 0,
    present_today: presentCount || 0,
    absent_today: (totalChildren || 0) - (presentCount || 0),
    incidents_today: incidentsToday || 0,
    meals_logged_today: mealsLogged || 0,
    naps_logged_today: napsLogged || 0,
  };
}

// ============================================================
// WRITE OPERATIONS
// ============================================================

/**
 * Log attendance for a child
 */
export async function logAttendance(
  childId: number,
  classroomId: number,
  schoolId: string,
  loggedBy: string,
  status: string,
  checkInTime?: string,
  notes?: string
) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance_logs')
    .upsert({
      child_id: childId,
      classroom_id: classroomId,
      school_id: schoolId,
      logged_by: loggedBy,
      status,
      check_in_time: checkInTime || new Date().toISOString(),
      notes,
      date: today,
    }, {
      onConflict: 'child_id,date',
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging attendance:', error);
    throw error;
  }

  return data;
}

/**
 * Log a meal for a child
 */
export async function logMeal(
  childId: number,
  classroomId: number,
  schoolId: string,
  loggedBy: string,
  mealType: string,
  amountEaten?: string,
  notes?: string
) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      child_id: childId,
      classroom_id: classroomId,
      school_id: schoolId,
      logged_by: loggedBy,
      meal_type: mealType,
      amount_eaten: amountEaten,
      notes,
      date: today,
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging meal:', error);
    throw error;
  }

  return data;
}

/**
 * Start a nap for a child
 */
export async function startNap(
  childId: number,
  classroomId: number,
  schoolId: string,
  loggedBy: string,
  notes?: string
) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('nap_logs')
    .insert({
      child_id: childId,
      classroom_id: classroomId,
      school_id: schoolId,
      logged_by: loggedBy,
      start_time: new Date().toISOString(),
      notes,
      date: today,
    })
    .select()
    .single();

  if (error) {
    console.error('Error starting nap:', error);
    throw error;
  }

  return data;
}

/**
 * End a nap for a child
 */
export async function endNap(napId: number, quality?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('nap_logs')
    .update({
      end_time: new Date().toISOString(),
      quality,
    })
    .eq('id', napId)
    .select()
    .single();

  if (error) {
    console.error('Error ending nap:', error);
    throw error;
  }

  return data;
}

/**
 * Report an incident
 */
export async function reportIncident(
  childId: number,
  classroomId: number,
  schoolId: string,
  reportedBy: string,
  incidentType: string,
  severity: string,
  description: string,
  actionTaken?: string
) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('incident_reports')
    .insert({
      child_id: childId,
      classroom_id: classroomId,
      school_id: schoolId,
      reported_by: reportedBy,
      incident_type: incidentType,
      severity,
      description,
      action_taken: actionTaken,
      occurred_at: new Date().toISOString(),
      date: today,
    })
    .select()
    .single();

  if (error) {
    console.error('Error reporting incident:', error);
    throw error;
  }

  return data;
}
