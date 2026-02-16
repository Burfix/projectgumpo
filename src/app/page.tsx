import Link from "next/link";
import Image from "next/image";

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
            Know how your child's day went without having to ask.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Project Goose delivers peace of mind with verified updates from staff, secure check-ins, and clear communication plus hands-on onboarding for every school.
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
              <span className="text-green-600 font-bold">✓</span> POPIA-aligned privacy
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span> Verified staff updates
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span> Guardian-only access
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span> Guided onboarding included
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl h-96 overflow-hidden shadow-xl">
          <Image
            src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=1200&auto=format&fit=crop"
            alt="Happy children learning and playing together"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Audience Split */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">I’m a...</h2>
          <p className="text-center text-gray-600 mb-10">
            Choose your path for tailored messaging and next steps
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Pre-School / Daycare</h3>
              <p className="text-gray-600 mb-4">
                Strengthen parent trust, reduce admin overhead, and run a more transparent center.
              </p>
              <Link
                href="/schools"
                className="text-green-700 font-semibold hover:text-green-800"
              >
                Explore for schools →
              </Link>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Parent / Caregiver</h3>
              <p className="text-gray-600 mb-4">
                Get real-time reassurance, safety updates, and proof of care throughout the day.
              </p>
              <Link
                href="/parents"
                className="text-green-700 font-semibold hover:text-green-800"
              >
                Explore for parents →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Outcomes that build trust
          </h2>
          <p className="text-center text-gray-600 mb-16">
            This isn’t just software — it’s visibility, accountability, and support.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Live Updates */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Peace of mind</h3>
              <p className="text-gray-600 mb-6">
                Parents see verified updates in real time — not hours later.
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Meals, naps, mood, and milestones
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Verified by staff, time-stamped
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Instant visibility for guardians
                </div>
              </div>
              <div className="mt-8 relative rounded-xl h-48 overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop"
                  alt="Parent viewing child's daily updates on mobile app"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Photos & Reports */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proof of care</h3>
              <p className="text-gray-600 mb-6">
                Photos, notes, and observations create a clear record of the day.
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Daily photo updates (guardian-only)
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
              <div className="mt-8 relative rounded-xl h-48 overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800&auto=format&fit=crop"
                  alt="Teacher documenting children's activities with photos"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Safety First */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Safety & accountability</h3>
              <p className="text-gray-600 mb-6">
                Clear audit trails, secure check-in, and approved pickups only.
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
              <div className="mt-8 relative rounded-xl h-48 overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1587135941948-670b381f08ce?q=80&w=800&auto=format&fit=crop"
                  alt="Secure check-in system with QR code scanning"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Direct Messaging */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Human support</h3>
              <p className="text-gray-600 mb-6">
                We don’t just hand you an app — we help you roll it out.
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Onboarding & rollout guidance
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Training for staff & admins
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">→</span>
                  </div>
                  Ongoing success check-ins
                </div>
              </div>
              <div className="mt-8 relative rounded-xl h-48 overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
                  alt="Support team helping school staff with onboarding"
                  fill
                  className="object-cover"
                />
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
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            How Project Goose works
          </h2>
          <p className="text-center text-gray-600 mb-16">Three simple steps to launch</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Teachers */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">1. Book a demo</h3>
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
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">👨‍👩‍👧</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">2. Set up your school</h3>
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
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                3. Invite your community
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
      <section id="about" className="bg-white py-20">
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

      {/* Trust & Privacy */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Trust signals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Privacy-first by default</h3>
              <p className="text-gray-600">
                Guardian-only access, role-based permissions, and POPIA-aligned data handling.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Founder-led onboarding</h3>
              <p className="text-gray-600">
                We help you set up rooms, roles, and workflows so rollout is smooth.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Built for accountability</h3>
              <p className="text-gray-600">
                Time-stamped logs and verified staff updates reduce ambiguity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Direction */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing direction</h2>
          <p className="text-gray-600 mb-8">
            Schools subscribe monthly. Parents get access included. Premium family add-ons can be
            enabled if desired.
          </p>
          <Link
            href="/book-demo"
            className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Request pricing
          </Link>
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
