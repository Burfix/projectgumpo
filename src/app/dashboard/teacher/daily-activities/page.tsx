"use client";

import { useState, useEffect } from "react";
import PhotoUpload from "@/components/PhotoUpload";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  photo_url?: string;
};

type ActivityType = "art" | "outdoor" | "learning" | "play" | "music" | "reading" | "other";

export default function DailyActivitiesPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("play");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activityTypes: { value: ActivityType; label: string; icon: string; color: string }[] = [
    { value: "art", label: "Arts & Crafts", icon: "🎨", color: "bg-purple-100 text-purple-900" },
    { value: "outdoor", label: "Outdoor Play", icon: "🌳", color: "bg-green-100 text-green-900" },
    { value: "learning", label: "Learning Time", icon: "📚", color: "bg-blue-100 text-blue-900" },
    { value: "play", label: "Free Play", icon: "🧸", color: "bg-pink-100 text-pink-900" },
    { value: "music", label: "Music & Dance", icon: "🎵", color: "bg-yellow-100 text-yellow-900" },
    { value: "reading", label: "Story Time", icon: "📖", color: "bg-indigo-100 text-indigo-900" },
    { value: "other", label: "Other", icon: "✨", color: "bg-gray-100 text-gray-900" },
  ];

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await fetch("/api/teacher/children");
      if (!response.ok) throw new Error("Failed to load children");
      const data = await response.json();
      setChildren(data);
    } catch (error) {
      console.error("Error loading children:", error);
      setMessage({ type: "error", text: "Failed to load children" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChild || !description) {
      setMessage({ type: "error", text: "Please select a child and add a description" });
      return;
    }

    try {
      setSubmitting(true);

      // Get classroom ID from first child (assuming teacher has one classroom)
      const response = await fetch("/api/teacher/children");
      const childrenData = await response.json();
      const child = childrenData.find((c: any) => c.id === parseInt(selectedChild));
      
      if (!child?.classroom_id) {
        throw new Error("No classroom found");
      }

      const activityData = {
        child_id: parseInt(selectedChild),
        classroom_id: child.classroom_id,
        activity_type: activityType,
        description,
        activity_date: new Date().toISOString().split("T")[0],
      };

      const activityResponse = await fetch("/api/teacher/daily-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityData),
      });

      if (!activityResponse.ok) throw new Error("Failed to log activity");

      // If photo was uploaded, link it to the activity
      if (photoId) {
        const activity = await activityResponse.json();
        // Update photo record with activity_id
        await fetch(`/api/photos/upload?id=${photoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity_id: activity.id }),
        });
      }

      setMessage({ type: "success", text: "Activity logged successfully!" });
      
      // Reset form
      setSelectedChild("");
      setActivityType("play");
      setDescription("");
      setPhotoUrl(null);
      setPhotoId(null);

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error logging activity:", error);
      setMessage({ type: "error", text: "Failed to log activity" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Daily Activities</h1>
          <p className="text-stone-600">
            Share what children are doing throughout the day with photos and descriptions
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Activity Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type Selection */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Activity Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activityTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setActivityType(type.value)}
                  className={`p-4 rounded-lg text-center transition-all ${
                    activityType === type.value
                      ? `${type.color} ring-2 ring-offset-2 ring-green-500`
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Select Child */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Select Child <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-green-600"></div>
              </div>
            ) : (
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose a child...</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.first_name} {child.last_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              What happened? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the activity... (e.g., 'Built an amazing castle with blocks!', 'Had so much fun painting with watercolors')"
              rows={4}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              💡 Tip: Parents love seeing details about what their child enjoyed and learned!
            </p>
          </div>

          {/* Photo Upload */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Add Photo <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Photos make daily updates more engaging for parents! 📸
            </p>
            <PhotoUpload
              childId={selectedChild ? parseInt(selectedChild) : undefined}
              buttonText={photoUrl ? "Change Photo" : "Upload Photo"}
              buttonClassName="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              showPreview={true}
              onUploadSuccess={(url, id) => {
                setPhotoUrl(url);
                setPhotoId(id);
                setMessage({ type: "success", text: "Photo uploaded successfully!" });
                setTimeout(() => setMessage(null), 3000);
              }}
              onUploadError={(error) => {
                setMessage({ type: "error", text: error });
              }}
            />
            {photoUrl && (
              <div className="mt-4">
                <p className="text-sm text-green-600 font-medium mb-2">✓ Photo ready to share</p>
                <img
                  src={photoUrl}
                  alt="Activity"
                  className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setSelectedChild("");
                setActivityType("play");
                setDescription("");
                setPhotoUrl(null);
                setPhotoId(null);
              }}
              className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 font-medium transition-colors"
              disabled={submitting}
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={submitting || !photoUrl}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Sharing..." : "Share Activity"}
            </button>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Activity Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Take photos throughout the day to capture special moments</li>
            <li>• Be specific in descriptions - parents love details!</li>
            <li>• Share both group activities and individual accomplishments</li>
            <li>• Highlight what the child learned or enjoyed</li>
          </ul>
        </div>
      </div>
  );
}
