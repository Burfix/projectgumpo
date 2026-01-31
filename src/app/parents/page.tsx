import Link from "next/link";

export default function ParentsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-green-700 hover:text-green-800">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">For Parents & Caregivers</h1>
        <p className="text-lg text-gray-600 mb-10">
          Never wonder what’s happening while your child is in someone else’s care.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time updates</h3>
            <p className="text-gray-600">Meals, naps, mood, and milestones — all time-stamped.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Safety visibility</h3>
            <p className="text-gray-600">Secure check-in/out and approved pickup tracking.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Direct communication</h3>
            <p className="text-gray-600">Message teachers or caregivers when it matters.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Want Project Goose at your school?</h2>
          <p className="text-gray-600 mb-4">
            Ask your center to book a demo or share your interest with us directly.
          </p>
          <Link
            href="/book-demo"
            className="inline-flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Request a demo
          </Link>
        </div>
      </div>
    </main>
  );
}
