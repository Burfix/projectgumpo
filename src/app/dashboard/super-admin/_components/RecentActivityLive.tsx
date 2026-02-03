'use client';

import { useEffect, useState } from 'react';

interface AuditLog {
  id: string;
  actor_user_id: string;
  school_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  changes: Record<string, unknown> | null;
  created_at: string;
}

export default function RecentActivityLive() {
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuditLogs() {
      try {
        const response = await fetch('/api/super-admin/audit-logs?limit=5');
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAuditLogs();
    // Poll for new activities every 10 seconds
    const interval = setInterval(fetchAuditLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const getActivityDescription = (log: AuditLog): string => {
    const actionMap: Record<string, string> = {
      ALLOCATE_PRINCIPAL: 'Allocated Principal role',
      REMOVE_PRINCIPAL: 'Removed Principal role',
      LINK_PARENT_TO_CHILD: 'Linked parent to child',
      UNLINK_PARENT_TO_CHILD: 'Unlinked parent from child',
      ASSIGN_TEACHER_TO_CLASS: 'Assigned teacher to class',
      UNASSIGN_TEACHER_FROM_CLASS: 'Unassigned teacher from class',
    };

    const action = actionMap[log.action_type] || log.action_type;
    const entity = log.entity_id || 'record';
    return `${action}: ${entity}`;
  };

  const getActivityType = (actionType: string): string => {
    if (actionType.includes('PRINCIPAL')) return 'User';
    if (actionType.includes('PARENT') || actionType.includes('TEACHER')) return 'User';
    return 'System';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-ZA', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="px-6 py-8 text-center text-gray-500">No activity yet</div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((log) => {
          const type = getActivityType(log.action_type);
          const bgColor =
            type === 'System'
              ? 'bg-blue-100 text-blue-800'
              : type === 'User'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800';

          return (
            <div key={log.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <p className="text-sm text-gray-900">{getActivityDescription(log)}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(log.created_at)}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${bgColor}`}>
                  {type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
