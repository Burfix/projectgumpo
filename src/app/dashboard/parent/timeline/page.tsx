import { protectRoute } from "@/lib/auth/middleware";
import Link from "next/link";

export default async function ParentTimeline() {
  const user = await protectRoute(["PARENT", "TEACHER", "ADMIN", "SUPER_ADMIN"]);

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link 
            href="/dashboard/parent"
            className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900"
          >
            <span className="mr-2">←</span>
            <span>Today</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Date Indicator */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">Today</h1>
          <p className="text-sm text-stone-500 mt-1">Saturday, 1 February 2026</p>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {[
            {
              time: "7:45 AM",
              title: "Arrived at school",
              description: "Dropped off by parent",
              icon: "arrival",
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-600"
            },
            {
              time: "8:00 AM",
              title: "Breakfast",
              description: "Porridge with honey and sliced banana. Ate well.",
              icon: "meal",
              iconBg: "bg-amber-50",
              iconColor: "text-amber-600"
            },
            {
              time: "9:30 AM",
              title: "Creative time",
              description: "Painted a rainbow during art activity",
              icon: "activity",
              iconBg: "bg-purple-50",
              iconColor: "text-purple-600",
              hasPhoto: true
            },
            {
              time: "10:30 AM",
              title: "Outside play",
              description: "Explored the garden and played with friends",
              icon: "play",
              iconBg: "bg-blue-50",
              iconColor: "text-blue-600"
            },
            {
              time: "11:00 AM",
              title: "Morning snack",
              description: "Crackers with cheese. Drank water.",
              icon: "snack",
              iconBg: "bg-orange-50",
              iconColor: "text-orange-600"
            },
            {
              time: "12:00 PM",
              title: "Lunch",
              description: "Pasta with vegetables and a small fruit cup. Good appetite.",
              icon: "meal",
              iconBg: "bg-amber-50",
              iconColor: "text-amber-600"
            },
            {
              time: "12:30 PM",
              title: "Nap started",
              description: "Settled down quickly",
              icon: "nap",
              iconBg: "bg-indigo-50",
              iconColor: "text-indigo-600"
            },
            {
              time: "2:15 PM",
              title: "Woke up",
              description: "Slept for 1 hour 45 minutes. Well-rested.",
              icon: "nap",
              iconBg: "bg-indigo-50",
              iconColor: "text-indigo-600"
            },
            {
              time: "3:00 PM",
              title: "Mood update",
              description: "Content and playful. Engaged well with peers.",
              icon: "mood",
              iconBg: "bg-rose-50",
              iconColor: "text-rose-600"
            },
            {
              time: "3:30 PM",
              title: "Afternoon snack",
              description: "Apple slices and a small cookie",
              icon: "snack",
              iconBg: "bg-orange-50",
              iconColor: "text-orange-600"
            },
          ].map((event, i) => (
            <div key={i} className="flex gap-4">
              {/* Time */}
              <div className="flex-shrink-0 w-16 text-right pt-1">
                <p className="text-xs font-medium text-stone-500">{event.time}</p>
              </div>

              {/* Event Card */}
              <div className="flex-grow bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 ${event.iconBg} rounded-lg flex items-center justify-center`}>
                    <div className={`w-5 h-5 ${event.iconColor}`}>
                      {event.icon === 'arrival' && (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      )}
                      {event.icon === 'meal' && (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                      {event.icon === 'snack' && (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                      {event.icon === 'activity' && (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      )}
                      {event.icon === 'play' && (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {event.icon === 'nap' && (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      )}
                      {event.icon === 'mood' && (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-semibold text-stone-900 mb-1">{event.title}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{event.description}</p>
                    
                    {/* Photo Thumbnail */}
                    {event.hasPhoto && (
                      <div className="mt-3 w-24 h-24 bg-stone-100 rounded-lg overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                          <span className="text-xs text-stone-400">Photo</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Spacing */}
        <div className="h-12"></div>
      </div>
    </main>
  );
}
