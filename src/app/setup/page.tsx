import Link from "next/link";

const steps = [
  {
    title: "Confirm your goals",
    detail: "We align on your daily routines, reporting needs, and parent communication preferences.",
  },
  {
    title: "Configure classrooms",
    detail: "Create rooms, assign lead teachers, and set attendance policies.",
  },
  {
    title: "Set roles & permissions",
    detail: "Define admin, teacher, and parent access so everyone sees the right data.",
  },
  {
    title: "Import your data",
    detail: "We help you add children, guardians, allergies, and pickup permissions.",
  },
  {
    title: "Go live",
    detail: "Run a short pilot, then roll out to the entire school.",
  },
];

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-green-700 hover:text-green-800">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">School setup plan</h1>
        <p className="text-gray-600 mb-10">
          Clear, repeatable steps to launch Project Goose in days.
        </p>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.title} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-sm font-semibold text-green-700 mb-2">
                Step {index + 1}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
