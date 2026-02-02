"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { SchoolWithStats, SchoolsStats } from "@/types/schools";
import SchoolsActions from "./SchoolsActions";
import SchoolCard from "./_components/SchoolCard";
import SchoolsSkeleton from "./_components/SchoolsSkeleton";

export default function SchoolsManagement() {
  const [schools, setSchools] = useState<SchoolWithStats[]>([]);
  const [stats, setStats] = useState<SchoolsStats>({
    children: 0,
    parents: 0,
    teachers: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    
    // Set up realtime subscription for schools changes
    const supabase = supabaseBrowser;
    const channel = supabase
      .channel('schools-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schools'
        },
        () => {
          console.log('Schools table changed, reloading data...');
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const supabase = supabaseBrowser;

      // Call the RPC function to get schools with stats
      const { data: schoolsData, error: schoolsError } = await supabase
        .rpc('get_schools_with_stats');

      if (schoolsError) {
        console.error("Error loading schools:", schoolsError);
        setError("Failed to load schools. Please try again.");
        return;
      }

      // Transform the data to match our types
      const transformedSchools: SchoolWithStats[] = (schoolsData || []).map((school: any) => ({
        id: school.id,
        name: school.name,
        location: school.location,
        status: school.status,
        subscription_tier: school.subscription_tier,
        created_at: school.created_at,
        children_count: Number(school.children_count) || 0,
        parents_count: Number(school.parents_count) || 0,
        teachers_count: Number(school.teachers_count) || 0,
        admins_count: Number(school.admins_count) || 0,
      }));

      setSchools(transformedSchools);

      // Calculate total stats across all schools
      const totalStats = transformedSchools.reduce(
        (acc, school) => ({
          children: acc.children + school.children_count,
          parents: acc.parents + school.parents_count,
          teachers: acc.teachers + school.teachers_count,
          admins: acc.admins + school.admins_count,
        }),
        { children: 0, parents: 0, teachers: 0, admins: 0 }
      );

      setStats(totalStats);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolAdded = () => {
    loadData();
  };

  const handleRetry = () => {
    setLoading(true);
    loadData();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Schools Management</h2>
        <SchoolsActions onSchoolAdded={handleSchoolAdded} />
      </div>

      {/* School Statistics Summary */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-900">
              {loading ? "..." : stats.children.toLocaleString()}
            </div>
            <div className="text-xs text-blue-700 mt-1">Children</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-900">
              {loading ? "..." : stats.parents.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-700 mt-1">Parents</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-900">
              {loading ? "..." : stats.teachers.toLocaleString()}
            </div>
            <div className="text-xs text-purple-700 mt-1">Teachers</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-900">
              {loading ? "..." : stats.admins.toLocaleString()}
            </div>
            <div className="text-xs text-orange-700 mt-1">Admins</div>
          </div>
        </div>

        {/* Schools List */}
        {loading ? (
          <SchoolsSkeleton />
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
            >
              Retry
            </button>
          </div>
        ) : schools.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-sm font-medium">No schools added yet</p>
            <p className="text-xs mt-1">Click "+ Add School" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
