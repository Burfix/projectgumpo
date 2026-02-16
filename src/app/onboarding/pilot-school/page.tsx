"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ErrorDisplay, EmptyState } from "@/components/ErrorBoundary";

type OnboardingStep = "school" | "principal" | "classrooms" | "teachers" | "summary";

export default function PilotSchoolOnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("school");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Form state
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState("daycare");
  const [city, setCity] = useState("Cape Town");
  const [principalName, setPrincipalName] = useState("");
  const [principalEmail, setPrincipalEmail] = useState("");
  const [principalPhone, setPrincipalPhone] = useState("");
  const [classrooms, setClassrooms] = useState([
    { name: "Sunflowers", capacity: 15, age_group: "2-3 years" },
    { name: "Rainbow", capacity: 20, age_group: "3-4 years" },
  ]);
  const [teachers, setTeachers] = useState([
    { name: "Teacher One", email: "", classroom_name: "Sunflowers" },
    { name: "Teacher Two", email: "", classroom_name: "Rainbow" },
  ]);
  const [includeSampleData, setIncludeSampleData] = useState(true);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/pilot-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName,
          schoolType,
          city,
          principalName,
          principalEmail,
          principalPhone,
          teachers: teachers.filter(t => t.email),
          classrooms,
          skipSampleData: !includeSampleData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Onboarding failed");
      }

      setResult(data.data);
      setCurrentStep("summary");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addClassroom = () => {
    setClassrooms([...classrooms, { name: "", capacity: 20, age_group: "3-4 years" }]);
  };

  const removeClassroom = (index: number) => {
    setClassrooms(classrooms.filter((_, i) => i !== index));
  };

  const addTeacher = () => {
    setTeachers([...teachers, { name: "", email: "", classroom_name: "" }]);
  };

  const removeTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const steps = [
    { id: "school", label: "School Info", icon: "🏫" },
    { id: "principal", label: "Principal", icon: "👤" },
    { id: "classrooms", label: "Classrooms", icon: "🚪" },
    { id: "teachers", label: "Teachers", icon: "👨‍🏫" },
    { id: "summary", label: "Summary", icon: "✅" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Setting up pilot school..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 Pilot School Onboarding
          </h1>
          <p className="text-gray-600">
            Set up your first school with sample data in minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${
                      index <= currentStepIndex
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      index <= currentStepIndex ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} retry={() => setError(null)} />
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* School Info Step */}
          {currentStep === "school" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">School Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g., Sunshine Daycare"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Type
                </label>
                <select
                  value={schoolType}
                  onChange={(e) => setSchoolType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="daycare">Daycare</option>
                  <option value="preschool">Preschool</option>
                  <option value="nursery">Nursery</option>
                  <option value="kindergarten">Kindergarten</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep("principal")}
                  disabled={!schoolName}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Principal Step */}
          {currentStep === "principal" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Principal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="e.g., Jane Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={principalEmail}
                  onChange={(e) => setPrincipalEmail(e.target.value)}
                  placeholder="jane@sunshinedaycare.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Temporary password will be: <code className="bg-gray-100 px-2 py-1 rounded">PilotSchool2026!</code>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={principalPhone}
                  onChange={(e) => setPrincipalPhone(e.target.value)}
                  placeholder="+27 12 345 6789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep("school")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep("classrooms")}
                  disabled={!principalName || !principalEmail}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Classrooms Step */}
          {currentStep === "classrooms" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Classrooms</h2>
                <button
                  onClick={addClassroom}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  + Add Classroom
                </button>
              </div>

              {classrooms.map((classroom, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Classroom {index + 1}</h3>
                    {classrooms.length > 1 && (
                      <button
                        onClick={() => removeClassroom(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={classroom.name}
                        onChange={(e) => {
                          const updated = [...classrooms];
                          updated[index].name = e.target.value;
                          setClassrooms(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity
                      </label>
                      <input
                        type="number"
                        value={classroom.capacity}
                        onChange={(e) => {
                          const updated = [...classrooms];
                          updated[index].capacity = parseInt(e.target.value);
                          setClassrooms(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age Group
                      </label>
                      <input
                        type="text"
                        value={classroom.age_group}
                        onChange={(e) => {
                          const updated = [...classrooms];
                          updated[index].age_group = e.target.value;
                          setClassrooms(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep("principal")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep("teachers")}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Teachers Step */}
          {currentStep === "teachers" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Teachers</h2>
                <button
                  onClick={addTeacher}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  + Add Teacher
                </button>
              </div>

              {teachers.map((teacher, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Teacher {index + 1}</h3>
                    {teachers.length > 1 && (
                      <button
                        onClick={() => removeTeacher(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={teacher.name}
                        onChange={(e) => {
                          const updated = [...teachers];
                          updated[index].name = e.target.value;
                          setTeachers(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={teacher.email}
                        onChange={(e) => {
                          const updated = [...teachers];
                          updated[index].email = e.target.value;
                          setTeachers(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Classroom
                      </label>
                      <select
                        value={teacher.classroom_name}
                        onChange={(e) => {
                          const updated = [...teachers];
                          updated[index].classroom_name = e.target.value;
                          setTeachers(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">None</option>
                        {classrooms.map((c, i) => (
                          <option key={i} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Temporary password: <code className="bg-gray-100 px-2 py-1 rounded">Teacher2026!</code>
                  </p>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeSampleData}
                    onChange={(e) => setIncludeSampleData(e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Include Sample Data</span>
                    <p className="text-sm text-gray-600">
                      Create 3 sample children and parent accounts for testing
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep("classrooms")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  🚀 Create Pilot School
                </button>
              </div>
            </div>
          )}

          {/* Summary Step */}
          {currentStep === "summary" && result && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Pilot School Created!
                </h2>
                <p className="text-gray-600">
                  {schoolName} is ready to use
                </p>
              </div>

              <div className="space-y-4">
                {/* School Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">🏫 School</h3>
                  <p className="text-sm text-green-800">
                    <strong>Name:</strong> {result.school?.name}<br />
                    <strong>ID:</strong> {result.school?.id}<br />
                    <strong>Status:</strong> {result.school?.status}
                  </p>
                </div>

                {/* Principal */}
                {result.principal && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">👤 Principal</h3>
                    <p className="text-sm text-blue-800">
                      <strong>Name:</strong> {result.principal.name}<br />
                      <strong>Email:</strong> {result.principal.email}<br />
                      <strong>Password:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{result.principal.temporaryPassword}</code>
                    </p>
                  </div>
                )}

                {/* Classrooms */}
                {result.classrooms?.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2">🚪 Classrooms ({result.classrooms.length})</h3>
                    <ul className="text-sm text-purple-800 space-y-1">
                      {result.classrooms.map((c: any) => (
                        <li key={c.id}>• {c.name} (Capacity: {c.capacity}, Age: {c.age_group})</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Teachers */}
                {result.teachers?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">👨‍🏫 Teachers ({result.teachers.length})</h3>
                    <div className="text-sm text-yellow-800 space-y-2">
                      {result.teachers.map((t: any) => (
                        <div key={t.id}>
                          <strong>{t.name}</strong> - {t.email}
                          <br />
                          <span className="text-xs">
                            Password: <code className="bg-yellow-100 px-2 py-1 rounded">{t.temporaryPassword}</code>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Data */}
                {(result.sampleChildren?.length > 0 || result.sampleParents?.length > 0) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">📊 Sample Data</h3>
                    <p className="text-sm text-gray-800">
                      <strong>Children:</strong> {result.sampleChildren?.length || 0}<br />
                      <strong>Parents:</strong> {result.sampleParents?.length || 0}
                    </p>
                  </div>
                )}

                {/* Errors */}
                {result.errors?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-2">⚠️ Errors</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      {result.errors.map((e: any, i: number) => (
                        <li key={i}>• {e.step}: {e.error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => window.location.href = `/dashboard/super-admin/schools`}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  View School →
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Create Another School
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
