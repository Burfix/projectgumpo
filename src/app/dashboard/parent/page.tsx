"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorDisplay, EmptyState } from "@/components/ErrorBoundary";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  classroom_id?: number;
  photo_url?: string;
  date_of_birth?: string;
  allergies?: string;
};

type ChildSummary = {
  attendance: { check_in_time?: string; check_out_time?: string } | null;
  meals: { meal_type: string; amount_eaten: string }[];
  naps: { start_time: string; end_time?: string; quality?: string }[];
  incidents: { incident_type: string; severity: string }[];
  has_checked_in: boolean;
  has_checked_out: boolean;
};

type TimelineEvent = {
  type: string;
  time: string;
  data: Record<string, unknown>;
};

export default function ParentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [todaySummary, setTodaySummary] = useState<ChildSummary | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      const response = await fetch("/api/parent/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      
      setChildren(data.children || []);
      setUnreadMessages(data.unreadMessages || 0);
      
      // Set first child as selected
      if (data.children?.length > 0) {
        const firstChild = data.children[0];
        setSelectedChild(firstChild);
        
        // Get summary for first child
        const childSummary = data.childSummaries?.find((s: { childId: number }) => s.childId === firstChild.id);
        setTodaySummary(childSummary?.summary || null);
        
        // Fetch timeline for first child
        const timelineResponse = await fetch(`/api/parent/timeline?childId=${firstChild.id}`);
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json();
          setTimeline(timelineData.timeline || []);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard. Please try again.");
      setLoading(false);
    }
  }

  async function switchChild(child: Child) {
    setSelectedChild(child);
    setLoading(true);
    
    try {
      // Fetch child-specific data
      const [summaryResponse, timelineResponse] = await Promise.all([
        fetch("/api/parent/stats"),
        fetch(`/api/parent/timeline?childId=${child.id}`)
      ]);

      if (summaryResponse.ok) {
        const data = await summaryResponse.json();
        const childSummary = data.childSummaries?.find((s: { childId: number }) => s.childId === child.id);
        setTodaySummary(childSummary?.summary || null);
      }

      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json();
        setTimeline(timelineData.timeline || []);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error switching child:", err);
      setLoading(false);
    }
  }

  if (loading && !selectedChild) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <ErrorDisplay 
          error={error}
          retry={() => window.location.reload()}
          context="Failed to load dashboard"
        />
      </main>
    );
  }

  if (!selectedChild || children.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <EmptyState
          icon="👶"
          title="No Children Linked"
          description="You don't have any children linked to your account yet. Please contact your school administrator."
          action={{
            label: "Refresh Page",
            onClick: () => window.location.reload()
          }}
        />
      </main>
    );
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

  // Count meals eaten well
  const mealsEaten = todaySummary?.meals?.filter(m => 
    m.amount_eaten === 'all' || m.amount_eaten === 'most'
  ).length || 0;
  const totalMeals = todaySummary?.meals?.length || 0;


  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Project Gumpo</h1>
            <p className="text-xs text-stone-500 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadMessages > 0 && (
              <Link href="/dashboard/parent/messages" className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 text-lg">💬</span>
                </div>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {unreadMessages}
                </span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* No Children Linked */}
        {children.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Welcome to Project Gumpo!</h2>
            <p className="text-stone-600 leading-relaxed">
              Your account hasn&apos;t been linked to any children yet. 
              <br />Please contact your school administrator.
            </p>
          </div>
        )}

        {/* Child Selector - Multiple Children */}
        {children.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => switchChild(child)}
                className={`flex-shrink-0 px-5 py-3 rounded-2xl font-medium text-sm transition-all ${
                  selectedChild?.id === child.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-emerald-300'
                }`}
              >
                {child.first_name}
              </button>
            ))}
          </div>
        )}

        {/* Child Profile Card */}
        {selectedChild && (
          <div className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex-shrink-0 overflow-hidden border-2 border-white/30">
                {selectedChild.photo_url ? (
                  <img src={selectedChild.photo_url} alt={selectedChild.first_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                    {selectedChild.first_name[0]}
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold mb-1">
                  {selectedChild.first_name} {selectedChild.last_name}
                </h2>
                {selectedChild.date_of_birth && (
                  <p className="text-sm text-white/80">
                    Age: {Math.floor((new Date().getTime() - new Date(selectedChild.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                  </p>
                )}
                <div className="mt-3">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${
                    todaySummary?.has_checked_in && !todaySummary?.has_checked_out
                      ? 'bg-white text-emerald-700'
                      : todaySummary?.has_checked_out
                      ? 'bg-white/20 text-white'
                      : 'bg-white/20 text-white'
                  }`}>
                    {todaySummary?.has_checked_in && !todaySummary?.has_checked_out
                      ? '✓ In Care Now'
                      : todaySummary?.has_checked_out
                      ? '👋 Picked Up'
                      : '⏰ Not Arrived'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Highlights */}
        {selectedChild && (
          <div>
            <h3 className="text-lg font-bold text-stone-900 mb-4 px-1">📊 Today&apos;s Highlights</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Arrival Time */}
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🕐</span>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Arrival</p>
                </div>
                <p className="text-2xl font-bold text-stone-900">
                  {todaySummary?.attendance?.check_in_time 
                    ? new Date(todaySummary.attendance.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                    : '—'}
                </p>
              </div>

              {/* Nap Duration */}
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">😴</span>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Nap Time</p>
                </div>
                <p className="text-2xl font-bold text-stone-900">{napDisplay}</p>
              </div>

              {/* Meals */}
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🍽️</span>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Meals</p>
                </div>
                <p className="text-base font-bold text-stone-900">
                  {totalMeals > 0 ? `${mealsEaten} eaten well` : 'No meals yet'}
                </p>
                {totalMeals > 0 && (
                  <p className="text-xs text-stone-500 mt-1">out of {totalMeals} served</p>
                )}
              </div>

              {/* Incidents */}
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{todaySummary?.incidents?.length ? '⚠️' : '✅'}</span>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Status</p>
                </div>
                <p className={`text-base font-bold ${todaySummary?.incidents?.length ? 'text-orange-600' : 'text-emerald-600'}`}>
                  {todaySummary?.incidents?.length ? `${todaySummary.incidents.length} incident${todaySummary.incidents.length > 1 ? 's' : ''}` : 'All good!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Activity Timeline */}
        {selectedChild && timeline.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-stone-900 mb-4 px-1">⏰ Today&apos;s Timeline</h3>
            <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
              <div className="divide-y divide-stone-100">
                {timeline.slice(0, 5).map((event, i) => {
                  const time = new Date(event.time).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  });
                  
                  let icon = '📍';
                  let activity = '';
                  let color = 'text-stone-700';
                  let photos: any[] = [];

                  switch (event.type) {
                    case 'check_in':
                      icon = '🚪';
                      activity = 'Arrived at school';
                      color = 'text-emerald-700';
                      break;
                    case 'check_out':
                      icon = '👋';
                      activity = 'Picked up from school';
                      color = 'text-blue-700';
                      break;
                    case 'meal':
                      icon = '🍽️';
                      const meal = event.data as { meal_type?: string; amount_eaten?: string };
                      activity = `${meal.meal_type || 'Meal'} — ${meal.amount_eaten || 'logged'}`;
                      color = 'text-amber-700';
                      break;
                    case 'nap_start':
                      icon = '😴';
                      activity = 'Nap time started';
                      color = 'text-indigo-700';
                      break;
                    case 'nap_end':
                      icon = '🌟';
                      const nap = event.data as { quality?: string };
                      activity = `Woke up${nap.quality ? ` — ${nap.quality} rest` : ''}`;
                      color = 'text-purple-700';
                      break;
                    case 'incident':
                      icon = '⚠️';
                      const incident = event.data as { incident_type?: string; severity?: string; photos?: any[] };
                      activity = `${incident.incident_type || 'Incident'} (${incident.severity || 'minor'})`;
                      color = 'text-orange-700';
                      photos = incident.photos || [];
                      break;
                    case 'activity':
                      icon = '🎨';
                      const activityData = event.data as { activity_type?: string; description?: string; photos?: any[] };
                      activity = activityData.description || activityData.activity_type || 'Daily activity';
                      color = 'text-blue-700';
                      photos = activityData.photos || [];
                      break;
                  }

                  return (
                    <div key={i} className="p-4 hover:bg-stone-50 transition-colors">
                      <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{icon}</span>
                        </div>
                        <div className="flex-grow">
                          <p className={`text-sm font-semibold ${color} mb-0.5`}>{activity}</p>
                          <p className="text-xs text-stone-500">{time}</p>
                          {photos.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {photos.slice(0, 3).map((photo: any, idx: number) => (
                                <img 
                                  key={idx}
                                  src={photo.url} 
                                  alt={photo.caption || 'Activity photo'} 
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => window.open(photo.url, '_blank')}
                                  title={photo.caption || 'Click to view full size'}
                                />
                              ))}
                              {photos.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                  +{photos.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {timeline.length > 5 && (
                <Link 
                  href={`/dashboard/parent/timeline?childId=${selectedChild?.id}`}
                  className="block p-4 text-center text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  View all {timeline.length} activities →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* No Activity Today */}
        {selectedChild && timeline.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8 text-center">
            <span className="text-5xl mb-3 block">🌅</span>
            <p className="text-stone-600 font-medium">No activity logged yet today.</p>
            <p className="text-sm text-stone-500 mt-1">Check back soon!</p>
          </div>
        )}

        {/* Quick Actions */}
        {selectedChild && (
          <div className="space-y-3 pb-8">
            <Link 
              href={`/dashboard/parent/children/${selectedChild.id}`}
              className="block w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl hover:from-emerald-700 hover:to-blue-700 text-base font-semibold text-center shadow-lg transition-all transform hover:scale-105"
            >
              📱 View Full Profile & History
            </Link>
            <Link 
              href="/dashboard/parent/messages"
              className="block w-full px-6 py-4 bg-white border-2 border-stone-300 text-stone-700 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 text-base font-semibold text-center transition-all"
            >
              💬 Message Teacher {unreadMessages > 0 && `(${unreadMessages} new)`}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
