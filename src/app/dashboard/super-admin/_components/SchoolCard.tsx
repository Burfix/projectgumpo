"use client";

import { SchoolWithStats } from "@/types/schools";

interface SchoolCardProps {
  school: SchoolWithStats;
}

export default function SchoolCard({ school }: SchoolCardProps) {
  const totalUsers = school.parents_count + school.teachers_count + school.admins_count;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base">
            {school.name}
          </h3>
          <div className="flex flex-col gap-1 mt-1">
              <p className="text-sm text-gray-600">
                City: {school.city}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Type: {school.type}
              </p>
          </div>
        </div>
      </div>

      {/* User and Children Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-900">
            {school.children_count}
          </div>
          <div className="text-xs text-gray-600">Children</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-900">
            {school.parents_count}
          </div>
          <div className="text-xs text-gray-600">Parents</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-900">
            {school.teachers_count}
          </div>
          <div className="text-xs text-gray-600">Teachers</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-900">
            {school.admins_count}
          </div>
          <div className="text-xs text-gray-600">Admins</div>
        </div>
      </div>

      {/* Total Summary */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
          <span>{totalUsers} total users</span>
        </div>
    </div>
  );
}
