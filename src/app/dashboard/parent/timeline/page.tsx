"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
};

type TimelineEvent = {
  type: 'check_in' | 'check_out' | 'meal' | 'nap_start' | 'nap_end' | 'incident';
  time: string;
  data: Record<string, unknown>;
};

export default function ParentTimeline() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<Child | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (childId) {
      fetchTimeline();
    }
  }, [childId, selectedDate]);

  async function fetchTimeline() {
    try {
      const response = await fetch(`/api/parent/timeline?childId=${childId}&date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch timeline");
      
      const data = await response.json();
      setChild(data.child);
      setTimeline(data.timeline || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      setLoading(false);
    }
  }

  function changeDate(days: number) {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
    setLoading(true);
  }

  if (loading && !child) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isFuture = new Date(selectedDate) > new Date();

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link 
            href="/dashboard/parent"
            className="inline-flex items-center text-sm font-medium text-stone-600 hover:text-emerald-600"
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {child?.first_name}&apos;s Timeline
          </h1>
          <p className="text-stone-600">Complete daily activity log</p>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
            
            <div className="text-center">
              <p className="text-xl font-bold text-stone-900">
                {isToday ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-stone-500">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  year: 'numeric'
                })}
              </p>
            </div>
            
            <button
              onClick={() => changeDate(1)}
              disabled={isFuture}
              className={`p-2 rounded-lg transition-colors ${
                isFuture ? 'text-stone-300 cursor-not-allowed' : 'hover:bg-stone-100'
              }`}
            >
              <span className="text-xl">→</span>
            </button>
          </div>
          
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="w-full mt-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              Jump to Today
            </button>
          )}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : timeline.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-12 text-center">
            <span className="text-6xl block mb-4">📅</span>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">No Activity Yet</h3>
            <p className="text-stone-600">
              {isToday ? "Check back later for today's updates!" : "No activity was logged on this day."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.map((event, i) => {
              const time = new Date(event.time).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              });
              
              let icon = '📍';
              let title = '';
              let description = '';
              let colorClasses = 'bg-stone-50 border-stone-200';
              let iconBg = 'bg-stone-100';
              let iconColor = 'text-stone-600';

              switch (event.type) {
                case 'check_in':
                  icon = '🚪';
                  title = 'Arrived at School';
                  description = 'Checked in safely';
                  colorClasses = 'bg-emerald-50 border-emerald-200';
                  iconBg = 'bg-emerald-100';
                  iconColor = 'text-emerald-600';
                  break;
                  
                case 'check_out':
                  icon = '👋';
                  title = 'Picked Up';
                  description = 'Checked out from school';
                  colorClasses = 'bg-blue-50 border-blue-200';
                  iconBg = 'bg-blue-100';
                  iconColor = 'text-blue-600';
                  break;
                  
                case 'meal':
                  icon = '🍽️';
                  const meal = event.data as { meal_type?: string; food_items?: string; amount_eaten?: string; notes?: string };
                  title = meal.meal_type ? meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1) : 'Meal';
                  description = meal.food_items || '';
                  if (meal.amount_eaten) {
                    description += (description ? ' • ' : '') + `Ate ${meal.amount_eaten}`;
                  }
                  if (meal.notes) {
                    description += (description ? ' • ' : '') + meal.notes;
                  }
                  colorClasses = 'bg-amber-50 border-amber-200';
                  iconBg = 'bg-amber-100';
                  iconColor = 'text-amber-600';
                  break;
                  
                case 'nap_start':
                  icon = '😴';
                  title = 'Nap Time Started';
                  description = 'Settled down for nap';
                  colorClasses = 'bg-indigo-50 border-indigo-200';
                  iconBg = 'bg-indigo-100';
                  iconColor = 'text-indigo-600';
                  break;
                  
                case 'nap_end':
                  icon = '🌟';
                  const nap = event.data as { start_time?: string; quality?: string; notes?: string };
                  title = 'Woke Up from Nap';
                  if (nap.start_time) {
                    const napDuration = Math.round(
                      (new Date(event.time).getTime() - new Date(nap.start_time).getTime()) / 60000
                    );
                    const hours = Math.floor(napDuration / 60);
                    const mins = napDuration % 60;
                    description = `Slept for ${hours}h ${mins}m`;
                  }
                  if (nap.quality) {
                    description += (description ? ' • ' : '') + `${nap.quality} rest`;
                  }
                  if (nap.notes) {
                    description += (description ? ' • ' : '') + nap.notes;
                  }
                  colorClasses = 'bg-purple-50 border-purple-200';
                  iconBg = 'bg-purple-100';
                  iconColor = 'text-purple-600';
                  break;
                  
                case 'incident':
                  icon = '⚠️';
                  const incident = event.data as { incident_type?: string; severity?: string; description?: string };
                  title = incident.incident_type ? 
                    incident.incident_type.charAt(0).toUpperCase() + incident.incident_type.slice(1) : 
                    'Incident';
                  description = incident.description || '';
                  if (incident.severity) {
                    description += (description ? ' • ' : '') + `Severity: ${incident.severity}`;
                  }
                  colorClasses = 'bg-orange-50 border-orange-200';
                  iconBg = 'bg-orange-100';
                  iconColor = 'text-orange-600';
                  break;
              }

              return (
                <div key={i} className={`relative ${colorClasses} border-2 rounded-2xl p-5 transition-all hover:shadow-md`}>
                  {/* Connector Line (not for last item) */}
                  {i < timeline.length - 1 && (
                    <div className="absolute left-9 top-16 w-0.5 h-8 bg-stone-200"></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-2xl`}>
                      {icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`text-lg font-bold ${iconColor}`}>{title}</h3>
                        <span className="text-sm font-semibold text-stone-500">{time}</span>
                      </div>
                      {description && (
                        <p className="text-sm text-stone-700 leading-relaxed">{description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
