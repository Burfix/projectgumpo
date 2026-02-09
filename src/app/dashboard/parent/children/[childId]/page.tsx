"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  allergies?: string;
  medical_notes?: string;
  photo_url?: string;
  classroom_id?: number;
};

type Classroom = {
  id: number;
  name: string;
  age_group?: string;
};

type AttendanceLog = {
  date: string;
  status: string;
  check_in_time?: string;
  check_out_time?: string;
};

type MealLog = {
  date: string;
  meal_type: string;
  food_items?: string;
  amount_eaten: string;
  notes?: string;
};

type NapLog = {
  date: string;
  start_time: string;
  end_time?: string;
  quality?: string;
  notes?: string;
};

type IncidentReport = {
  date: string;
  incident_type: string;
  severity: string;
  description?: string;
  occurred_at: string;
};

export default function ChildProfilePage() {
  const params = useParams();
  const childId = params.childId as string;

  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<Child | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [naps, setNaps] = useState<NapLog[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'meals' | 'naps' | 'incidents'>('attendance');

  useEffect(() => {
    fetchChildDetails();
  }, [childId]);

  async function fetchChildDetails() {
    try {
      const response = await fetch(`/api/parent/children/${childId}`);
      if (!response.ok) throw new Error("Failed to fetch child details");
      
      const data = await response.json();
      setChild(data.child);
      setClassroom(data.classroom);
      setAttendance(data.attendance || []);
      setMeals(data.meals || []);
      setNaps(data.naps || []);
      setIncidents(data.incidents || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching child details:", error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  if (!child) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-stone-600 mb-4">Child not found</p>
          <Link href="/dashboard/parent" className="text-emerald-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const age = child.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(child.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  // Calculate attendance stats
  const attendanceDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = attendanceDays > 0 ? Math.round((presentDays / attendanceDays) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-3xl shadow-xl p-8 text-white">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex-shrink-0 overflow-hidden border-3 border-white/40">
              {child.photo_url ? (
                <img src={child.photo_url} alt={child.first_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                  {child.first_name[0]}
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-2">
                {child.first_name} {child.last_name}
              </h1>
              <div className="space-y-1 text-white/90">
                {age && <p className="text-sm">Age: {age} years old</p>}
                {child.gender && <p className="text-sm">Gender: {child.gender}</p>}
                {classroom && <p className="text-sm">Class: {classroom.name} {classroom.age_group ? `(${classroom.age_group})` : ''}</p>}
              </div>
            </div>
          </div>

          {/* Important Info */}
          {(child.allergies || child.medical_notes) && (
            <div className="mt-6 pt-6 border-t border-white/20">
              {child.allergies && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
                  <p className="text-sm font-semibold mb-1">⚠️ Allergies</p>
                  <p className="text-sm text-white/90">{child.allergies}</p>
                </div>
              )}
              {child.medical_notes && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-sm font-semibold mb-1">🏥 Medical Notes</p>
                  <p className="text-sm text-white/90">{child.medical_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5 text-center">
            <p className="text-sm text-stone-500 mb-2">Attendance Rate</p>
            <p className="text-3xl font-bold text-emerald-600">{attendanceRate}%</p>
            <p className="text-xs text-stone-500 mt-1">{presentDays} of {attendanceDays} days</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5 text-center">
            <p className="text-sm text-stone-500 mb-2">Recent Meals</p>
            <p className="text-3xl font-bold text-amber-600">{meals.length}</p>
            <p className="text-xs text-stone-500 mt-1">last 7 days</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5 text-center">
            <p className="text-sm text-stone-500 mb-2">Incidents</p>
            <p className={`text-3xl font-bold ${incidents.length === 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
              {incidents.length}
            </p>
            <p className="text-xs text-stone-500 mt-1">last 30 days</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
          <div className="flex border-b border-stone-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              📅 Attendance ({attendance.length})
            </button>
            <button
              onClick={() => setActiveTab('meals')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'meals'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              🍽️ Meals ({meals.length})
            </button>
            <button
              onClick={() => setActiveTab('naps')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'naps'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              😴 Naps ({naps.length})
            </button>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'incidents'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              ⚠️ Incidents ({incidents.length})
            </button>
          </div>

          <div className="p-6">
            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="space-y-3">
                {attendance.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">No attendance records yet</p>
                ) : (
                  attendance.map((record, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-stone-900">
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-stone-600 mt-1">
                          {record.check_in_time && `Check-in: ${new Date(record.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                          {record.check_in_time && record.check_out_time && ' • '}
                          {record.check_out_time && `Check-out: ${new Date(record.check_out_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Meals Tab */}
            {activeTab === 'meals' && (
              <div className="space-y-3">
                {meals.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">No meal records yet</p>
                ) : (
                  meals.map((meal, i) => (
                    <div key={i} className="p-4 bg-stone-50 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-stone-900 capitalize">{meal.meal_type}</p>
                          <p className="text-xs text-stone-500">
                            {new Date(meal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          meal.amount_eaten === 'all' ? 'bg-emerald-100 text-emerald-700' :
                          meal.amount_eaten === 'most' ? 'bg-blue-100 text-blue-700' :
                          meal.amount_eaten === 'some' ? 'bg-amber-100 text-amber-700' :
                          'bg-stone-200 text-stone-700'
                        }`}>
                          {meal.amount_eaten}
                        </span>
                      </div>
                      {meal.food_items && (
                        <p className="text-sm text-stone-600 mb-1">🍽️ {meal.food_items}</p>
                      )}
                      {meal.notes && (
                        <p className="text-sm text-stone-500 italic">{meal.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Naps Tab */}
            {activeTab === 'naps' && (
              <div className="space-y-3">
                {naps.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">No nap records yet</p>
                ) : (
                  naps.map((nap, i) => {
                    const duration = nap.end_time
                      ? Math.round((new Date(nap.end_time).getTime() - new Date(nap.start_time).getTime()) / 60000)
                      : null;
                    const hours = duration ? Math.floor(duration / 60) : 0;
                    const mins = duration ? duration % 60 : 0;

                    return (
                      <div key={i} className="p-4 bg-stone-50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-stone-900">
                              {new Date(nap.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-stone-500">
                              {new Date(nap.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              {nap.end_time && ` - ${new Date(nap.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                            </p>
                          </div>
                          {duration && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                              {hours}h {mins}m
                            </span>
                          )}
                        </div>
                        {nap.quality && (
                          <p className="text-sm text-stone-600">Quality: <span className="capitalize">{nap.quality}</span></p>
                        )}
                        {nap.notes && (
                          <p className="text-sm text-stone-500 italic mt-1">{nap.notes}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Incidents Tab */}
            {activeTab === 'incidents' && (
              <div className="space-y-3">
                {incidents.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-5xl block mb-2">✅</span>
                    <p className="text-emerald-600 font-semibold">No incidents reported!</p>
                  </div>
                ) : (
                  incidents.map((incident, i) => (
                    <div key={i} className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-orange-900 capitalize">{incident.incident_type}</p>
                          <p className="text-xs text-orange-600">
                            {new Date(incident.occurred_at).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          incident.severity === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                          incident.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {incident.severity}
                        </span>
                      </div>
                      {incident.description && (
                        <p className="text-sm text-orange-800 mt-2">{incident.description}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
