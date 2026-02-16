"use client";

import { useState, useRef } from "react";

type Props = {
  onUploadSuccess?: (photoUrl: string, photoId: string) => void;
  onUploadError?: (error: string) => void;
  childId?: number;
  classroomId?: number;
  activityId?: number;
  incidentId?: number;
  caption?: string;
  buttonText?: string;
  buttonClassName?: string;
  showPreview?: boolean;
};

export default function PhotoUpload({
  onUploadSuccess,
  onUploadError,
  childId,
  classroomId,
  activityId,
  incidentId,
  caption,
  buttonText = "Upload Photo",
  buttonClassName = "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
  showPreview = true,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.("Only JPEG, PNG, WEBP, and HEIC images are allowed");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      onUploadError?.("File size must be less than 5MB");
      return;
    }

    // Show preview
    if (showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (childId) formData.append("child_id", childId.toString());
      if (classroomId) formData.append("classroom_id", classroomId.toString());
      if (activityId) formData.append("activity_id", activityId.toString());
      if (incidentId) formData.append("incident_id", incidentId.toString());
      if (caption) formData.append("caption", caption);

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      onUploadSuccess?.(data.photo.url, data.photo.id);
    } catch (error: any) {
      console.error("Upload error:", error);
      onUploadError?.(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />
      
      {showPreview && preview && (
        <div className="mb-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`${buttonClassName} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {uploading ? "Uploading..." : buttonText}
      </button>
    </div>
  );
}
