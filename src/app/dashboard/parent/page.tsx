import { protectRoute } from "@/lib/auth/middleware";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { 
  getParentChildren, 
  getChildTodaySummary,
  getChildDailyTimeline,
  getUnreadMessageCount 
} from "@/lib/db/parentDashboard";

export default async function ParentDashboard() {
  let user;
  try {
    user = await protectRoute(["PARENT", "TEACHER", "ADMIN", "PRINCIPAL", "SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  // Get user's profile
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('users')
    .select('id, name, school_id')
    .eq('email', user.email)
    .single();

  // Get parent's children
  const children = profile?.id ? await getParentChildren(profile.id) : [];
  const currentChild = children[0] || null;

  // Get today's data for the first child
  let todaySummary = null;
  let timeline: Awaited<ReturnType<typeof getChildDailyTimeline>> = [];
  let unreadCount = 0;

  if (currentChild && profile?.id) {
    [todaySummary, timeline, unreadCount] = await Promise.all([
      getChildTodaySummary(currentChild.id),
      getChildDailyTimeline(currentChild.id),
      getUnreadMessageCount(profile.id),
    ]);
  }

  // Get classroom name
  let classroomName = 'Not assigned';
  if (currentChild?.classroom_id) {
    const { data: classroom } = await supabase
      .from('classrooms')
      .select('name')
      .eq('id', currentChild.classroom_id)
      .single();
    classroomName = classroom?.name || 'Not assigned';
  }

  // Calculate nap duration
  const totalNapMinutes = todaySummary?.naps?.reduce((total, nap) => {
    if (nap.start_time && nap.end_time) {
      const start = new Date(nap.start_time);
      const end = new Date(nap.end_time);
      return total + Math.round((end.getTime() - start.getTime()) / 60000);
    }
    return total;
  }, 0) || 0;
  const napHours = Math.floor(totalNapMinutes / 60);
  const napMins = totalNapMinutes % 60;
  const napDisplay = totalNapMinutes > 0 ? `${napHours}h ${napMins}m` : 'No nap yet';

  // Count meals eaten
  const mealsEaten = todaySummary?.meals?.filter(m => m.amount_eaten !== 'none' && m.amount_eaten !== 'refused').length || 0;
  const totalMeals = todaySummary?.meals?.length || 0;

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-900">Project Gumpo</h1>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
            <div className="text-xs text-stone-500">
              {profile?.name || user.email?.split('@')[0]}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* No Children Linked */}
        {!currentChild && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-yellow-800">No Children Linked</h2>
            <p className="text-yellow-700 mt-1">
              Your account hasn&apos;t been linked to any children yet. Please contact your school administrator.
            </p>
          </div>
        )}

        {/* Child Card */}
        {currentChild && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-stone-200 flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-2xl font-semibold text-emerald-700">
                  {currentChild.first_name[0]}
                </div>
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-semibold text-stone-900">
                  {currentChild.first_name} {currentChild.last_name}
                </h2>
                <p className="text-sm text-stone-500 mt-0.5">{classroomName}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    todaySummary?.has_checked_in && !todaySummary?.has_checked_out
                      ? 'bg-emerald-50 text-emerald-700'
                      : todaySummary?.has_checked_out
                      ? 'bg-stone-100 text-stone-600'
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {todaySummary?.has_checked_in && !todaySummary?.has_checked_out
                      ? 'In Care'
                      : todaySummary?.has_checked_out
                      ? 'Picked Up'
                      : 'Not Arrived'}
                  </span>
                </div>
              </div>
            </div>

            {/* Multiple children selector */}
            {children.length > 1 && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                {children.map((child) => (
                  <button
                    key={child.id}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      child.id === currentChild.id
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {child.first_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Today at a Glance */}
        {currentChild && (
          <div>
            <h3 className="text-base font-semibold text-stone-900 mb-3 px-1">Today at a Glance</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Arrival</p>
                <p className="text-2xl font-semibold text-stone-900">
                  {todaySummary?.attendance?.check_in_time 
                    ? new Date(todaySummary.attendance.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                    : '—'}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Nap</p>
                <p className="text-2xl font-semibold text-stone-900">{napDisplay}</p>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Meals</p>
                <p className="text-base font-medium text-stone-900">
                  {totalMeals > 0 ? `${mealsEaten} of ${totalMeals} eaten` : 'No meals logged'}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Incidents</p>
                <p className={`text-base font-medium ${todaySummary?.incidents?.length ? 'text-orange-600' : 'text-stone-900'}`}>
                  {todaySummary?.incidents?.length || 0} today
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Timeline */}
        {currentChild && timeline.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-stone-900 mb-3 px-1">Today&apos;s Moments</h3>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="divide-y divide-stone-100">
                {timeline.map((event, i) => {
                  const time = new Date(event.time).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  });
                  
                  let activity = '';
                  switch (event.type) {
                    case 'check_in':
                      activity = 'Arrived at school';
                      break;
                    case 'check_out':
                      activity = 'Picked up';
                      break;
                    case 'meal':
                      const meal = event.data as { meal_type?: string; amount_eaten?: string };
                      activity = `${meal.meal_type || 'Meal'} — ${meal.amount_eaten || 'logged'}`;
                      break;
                    case 'nap_start':
                      activity = 'Nap started';
                      break;
                    case 'nap_end':
                      const nap = event.data as { quality?: string };
                      activity = `Woke up${nap.quality ? ` — ${nap.quality}` : ''}`;
                      break;
                    case 'incident':
                      const incident = event.data as { incident_type?: string; severity?: string };
                      activity = `⚠️ ${incident.incident_type || 'Incident'} (${incident.severity || 'reported'})`;
                      break;
                    default:
                      activity = 'Activity logged';
                  }

                  return (
                    <div key={i} className="p-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-12 text-right">
                          <p className="text-xs text-stone-500 font-medium">{time}</p>
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm text-stone-700 leading-relaxed">{activity}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* No Activity Today */}
        {currentChild && timeline.length === 0 && (
          <div className="bg-stone-100 rounded-2xl p-6 text-center">
            <p className="text-stone-600">No activity logged yet today.</p>
          </div>
        )}

        {/* Message Teacher */}
        {currentChild && (
          <div className="pb-6">
            <Link 
              href="/dashboard/parent/timeline"
              className="block w-full px-4 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 text-sm font-medium text-center mb-3"
            >
              View Full Timeline
            </Link>
            <Link 
              href="/dashboard/parent/messages"
              className="block w-full px-4 py-3 bg-white border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 text-sm font-medium text-center"
            >
              Message Teacher {unreadCount > 0 && `(${unreadCount} unread)`}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
