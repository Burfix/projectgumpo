import { protectRoute } from "@/lib/auth/middleware";
import Link from "next/link";

export default async function ParentDashboard() {
  let user;
  try {
    user = await protectRoute(["PARENT", "TEACHER", "ADMIN", "SUPER_ADMIN"]);
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-900">Project Goose</h1>
          <div className="text-xs text-stone-500">
            {user.email?.split('@')[0]}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Child Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-stone-200 flex-shrink-0 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-2xl font-semibold text-emerald-700">
                B
              </div>
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-semibold text-stone-900">Ben Smith</h2>
              <p className="text-sm text-stone-500 mt-0.5">Sunflower Room</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                  In Care
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Today at a Glance */}
        <div>
          <h3 className="text-base font-semibold text-stone-900 mb-3 px-1">Today at a Glance</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs text-stone-500 mb-1">Arrival</p>
              <p className="text-2xl font-semibold text-stone-900">7:45 AM</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs text-stone-500 mb-1">Nap</p>
              <p className="text-2xl font-semibold text-stone-900">1h 45m</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs text-stone-500 mb-1">Meals</p>
              <p className="text-base font-medium text-stone-900">2 of 3 eaten</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs text-stone-500 mb-1">Mood</p>
              <p className="text-base font-medium text-stone-900">Content</p>
            </div>
          </div>
        </div>

        {/* Today's Moments */}
        <div>
          <h3 className="text-base font-semibold text-stone-900 mb-3 px-1">Today's Moments</h3>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="divide-y divide-stone-100">
              {[
                { time: "7:45 AM", activity: "Arrived at school", type: "arrival" },
                { time: "8:00 AM", activity: "Breakfast — porridge & fruit", type: "meal" },
                { time: "9:30 AM", activity: "Creative time — painted rainbow", type: "photo", hasPhoto: true },
                { time: "11:00 AM", activity: "Morning snack — crackers & cheese", type: "snack" },
                { time: "12:00 PM", activity: "Lunch — pasta & vegetables", type: "meal" },
                { time: "12:30 PM", activity: "Nap started", type: "nap" },
                { time: "2:15 PM", activity: "Woke up — well-rested", type: "nap" },
                { time: "3:00 PM", activity: "Mood update — content and playful", type: "mood" },
              ].map((item, i) => (
                <div key={i} className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-12 text-right">
                      <p className="text-xs text-stone-500 font-medium">{item.time}</p>
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-stone-700 leading-relaxed">{item.activity}</p>
                      {item.hasPhoto && (
                        <div className="mt-2 w-24 h-24 bg-stone-100 rounded-lg overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-xs text-stone-400">
                            Photo
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Teacher */}
        <div className="pb-6">
          <Link 
            href="/dashboard/parent/messages"
            className="block w-full px-4 py-3 bg-white border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 text-sm font-medium text-center"
          >
            Message Teacher
          </Link>
        </div>
      </div>
    </main>
  );
}
