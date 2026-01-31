import Link from "next/link";

export default function SchoolsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-green-700 hover:text-green-800">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">For Pre-Schools & Daycares</h1>
        <p className="text-lg text-gray-600 mb-10">
          Project Goose helps you run a transparent, trusted center with less admin and stronger
          parent retention.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reduce admin</h3>
            <p className="text-gray-600">Streamlined logging, attendance, and parent comms.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Build trust</h3>
            <p className="text-gray-600">Verified updates and clear records reduce complaints.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Improve retention</h3>
            <p className="text-gray-600">Parents stay longer when they feel informed.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Included service</h2>
          <p className="text-gray-600 mb-4">
            We onboard your school, configure rooms and roles, and guide rollout to families.
          </p>
          <Link
            href="/book-demo"
            className="inline-flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Book a school demo
          </Link>
        </div>
      </div>
    </main>
  );
}
