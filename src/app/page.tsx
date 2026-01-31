import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="text-2xl font-bold text-green-600">Project Goose</div>
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Sign In
          </Link>
          <Link
            href="/book-demo"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Book Demo
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Project Goose
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Stay connected with your school's day. Real-time updates on meals, naps, activities, and
            milestones. Easy check-in with QR codes and direct messaging with teachers.
          </p>
          <div className="flex gap-4">
            <Link
              href="/book-demo"
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Book Demo
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 font-semibold"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-12 flex flex-col gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span> POPIA-aligned
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span> Guardian-only photos
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span> Time-stamped logs
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span> Teacher-verified
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl h-96 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg
              className="w-24 h-24 mx-auto mb-4 text-green-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <p>Hero Image</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            What we offer at Project Goose
          </h2>
          <p className="text-center text-gray-600 mb-16">
            Features designed for everyone in your childcare community
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Live Updates */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Live Updates</h3>
              <p className="text-gray-600 mb-6">
                Know exactly how your child's day unfolded.
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Meals, naps, potty, mood
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Logged in real time
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Visible instantly to you
                </div>
              </div>
              <div className="mt-8 bg-green-100 rounded-xl h-48 flex items-center justify-center text-gray-400">
                Feature Image
              </div>
            </div>

            {/* Photos & Reports */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Photos & Reports</h3>
              <p className="text-gray-600 mb-6">
                Capture every special moment.
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Daily photo updates
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Teacher observations
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Milestone celebrations
                </div>
              </div>
              <div className="mt-8 bg-blue-100 rounded-xl h-48 flex items-center justify-center text-gray-400">
                Feature Image
              </div>
            </div>

            {/* Safety First */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Safety First</h3>
              <p className="text-gray-600 mb-6">
                Complete peace of mind.
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Secure QR check-in/out
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Authorised pickup only
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Time-stamped records
                </div>
              </div>
              <div className="mt-8 bg-purple-100 rounded-xl h-48 flex items-center justify-center text-gray-400">
                Feature Image
              </div>
            </div>

            {/* Direct Messaging */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Direct Messaging</h3>
              <p className="text-gray-600 mb-6">
                Stay in touch with teachers.
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  In-app chat
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Share files & photos
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Quick responses
                </div>
              </div>
              <div className="mt-8 bg-orange-100 rounded-xl h-48 flex items-center justify-center text-gray-400">
                Feature Image
              </div>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Easy Check-In */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Check-In</h3>
              <p className="text-gray-600 mb-6">
                Drop-off in seconds.
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Scan your unique QR
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Digital signature
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Automatic notifications
                </div>
              </div>
            </div>

            {/* Invoice Access */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Invoice Access</h3>
              <p className="text-gray-600 mb-6">
                Billing made simple.
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  View invoices online
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Payment history
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Download statements
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            How Project Goose works
          </h2>
          <p className="text-center text-gray-600 mb-16">
            Three simple roles, one connected experience
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Teachers */}
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Teachers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Quick-tap logging for all activities
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Photo and milestone sharing
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Classroom management dashboard
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Attendance scanning
                </li>
              </ul>
            </div>

            {/* Parents */}
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">👨‍👩‍👧</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Parents</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Real-time activity feed
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Direct messaging with teachers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Invoice viewing and payments
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> QR code for check-in/out
                </li>
              </ul>
            </div>

            {/* Administrators */}
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Administrators
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Complete overview dashboard
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Staff and classroom management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Billing and financial reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> System configuration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Nurturing Young Minds Since Day One
          </h2>
          <p className="text-lg text-gray-600">
            At Project Goose, we believe every child deserves a safe, loving environment where
            they can explore, learn, and grow. Our platform helps centers deliver that care with
            consistent updates, secure access, and clear communication across the whole community.
          </p>
        </div>
      </section>

      {/* Next Steps */}
      <section id="next-steps" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Next steps</h2>
          <p className="text-center text-gray-600 mb-12">
            Three simple steps to launch Project Goose at your school
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-sm font-semibold text-green-700 mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Book a demo</h3>
              <p className="text-gray-600 mb-4">
                See the platform in action and confirm your school’s needs.
              </p>
              <Link
                href="/book-demo"
                className="text-green-700 font-semibold hover:text-green-800"
              >
                Book demo →
              </Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-sm font-semibold text-green-700 mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Set up your school</h3>
              <p className="text-gray-600 mb-4">
                We help you configure classes, staff roles, and parent access.
              </p>
              <Link
                href="/setup"
                className="text-green-700 font-semibold hover:text-green-800"
              >
                View setup plan →
              </Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-sm font-semibold text-green-700 mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Invite your team</h3>
              <p className="text-gray-600 mb-4">
                Send staff and parents their invites and go live together.
              </p>
              <Link
                href="/invite-team"
                className="text-green-700 font-semibold hover:text-green-800"
              >
                See invite steps →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Book a demo with Project Goose</h2>
          <p className="text-lg text-gray-600 mb-8">
            Get a walkthrough tailored to your school, then launch in days—not weeks.
          </p>
          <Link
            href="/book-demo"
            className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Book Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Project Goose</h3>
              <p className="text-gray-400">
                Trusted daily care tracking for parents, teachers, and growing schools
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white">
                    About Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>2026 Project Goose. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
