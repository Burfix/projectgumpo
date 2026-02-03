"use client";

import { useState, useEffect } from "react";
import { allocatePrincipalToSchool, getSchoolPrincipals } from "@/lib/actions";

interface Principal {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

interface AllocatePrincipalModalProps {
  schoolId: number;
  schoolName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AllocatePrincipalModal({
  schoolId,
  schoolName,
  isOpen,
  onClose,
  onSuccess,
}: AllocatePrincipalModalProps) {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [principals, setPrincipals] = useState<Principal[]>([]);

  // New principal form
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Existing principal selection
  const [selectedPrincipalId, setSelectedPrincipalId] = useState("");
  const [availablePrincipals, setAvailablePrincipals] = useState<Principal[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, schoolId]);

  async function loadData() {
    try {
      // Load current principals for this school
      const principalsRes = await getSchoolPrincipals(schoolId);
      if (principalsRes.success && principalsRes.data) {
        setPrincipals(principalsRes.data as Principal[]);
      }

      // Load available principals (you'd need an endpoint for this)
      // For now, we'll just allow creating new ones
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await allocatePrincipalToSchool({
        schoolId,
        ...(mode === "new"
          ? { email, name, phone }
          : { principalId: selectedPrincipalId }),
      });

      if (result.success) {
        setSuccess("Principal allocated successfully!");
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 1500);
      } else {
        setError(result.error || "Failed to allocate principal");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setEmail("");
    setName("");
    setPhone("");
    setSelectedPrincipalId("");
    setError(null);
    setSuccess(null);
    setMode("new");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Allocate Principal to {schoolName}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Current Principals */}
          {principals.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Current Principals</h3>
              <div className="space-y-2">
                {principals.map((principal) => (
                  <div key={principal.id} className="text-sm text-blue-800">
                    <span className="font-medium">{principal.name}</span> ({principal.email})
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {success}
            </div>
          )}

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you like to allocate a principal?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setMode("new")}
                className={`flex-1 px-4 py-2 rounded-lg border font-medium ${
                  mode === "new"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Create New Principal
              </button>
              <button
                type="button"
                onClick={() => setMode("existing")}
                className={`flex-1 px-4 py-2 rounded-lg border font-medium ${
                  mode === "existing"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Assign Existing User
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "new" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@school.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User
                </label>
                <select
                  value={selectedPrincipalId}
                  onChange={(e) => setSelectedPrincipalId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose a user --</option>
                  {availablePrincipals.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  The selected user will be assigned the PRINCIPAL role for this school.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Allocating..." : "Allocate Principal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
