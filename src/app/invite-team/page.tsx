import Link from "next/link";

export default function InviteTeamPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-green-700 hover:text-green-800">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">Invite your team</h1>
        <p className="text-gray-600 mb-8">
          Bring staff and parents onto Project Goose with secure email invites.
        </p>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Invite staff</h2>
            <p className="text-gray-600">
              From the Super Admin dashboard, open Users and send invites to teachers and admins.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Invite parents</h2>
            <p className="text-gray-600">
              Add parent emails and link them to children so they receive the right updates.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Confirm access</h2>
            <p className="text-gray-600">
              Once users accept their invites, they’ll land in the correct dashboard automatically.
            </p>
          </div>
          <Link
            href="/dashboard/super-admin/users"
            className="inline-flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Go to user invites
          </Link>
        </div>
      </div>
    </main>
  );
}
