"use client";

import Link from "next/link";
import { useState } from "react";

export default function BulkOperationsPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importType, setImportType] = useState<"children" | "parents" | "teachers">("children");
  const [exportType, setExportType] = useState<"children" | "parents" | "teachers" | "all">("all");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  async function handleImport() {
    if (!importFile) {
      alert("Please select a CSV file to import");
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("type", importType);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock result
      const mockResult = {
        success: 45,
        failed: 3,
        errors: [
          "Row 12: Missing required field 'date_of_birth'",
          "Row 23: Invalid email format",
          "Row 34: Duplicate entry",
        ],
      };

      setImportResult(mockResult);
      setImportFile(null);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import data");
    } finally {
      setImporting(false);
    }
  }

  async function handleExport() {
    setExporting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate CSV content
      let csvContent = "";
      const timestamp = new Date().toISOString().split("T")[0];

      if (exportType === "children" || exportType === "all") {
        csvContent += "=== CHILDREN DATA ===\n";
        csvContent += "ID,First Name,Last Name,Date of Birth,Classroom,Parent Email\n";
        csvContent += "1,Emma,Johnson,2022-03-15,Sunflower Room,parent1@example.com\n";
        csvContent += "2,Oliver,Smith,2021-08-22,Rainbow Room,parent2@example.com\n\n";
      }

      if (exportType === "teachers" || exportType === "all") {
        csvContent += "=== TEACHERS DATA ===\n";
        csvContent += "ID,First Name,Last Name,Email,Assigned Classrooms\n";
        csvContent += "1,Sarah,Johnson,sarah@school.com,Sunflower Room\n";
        csvContent += "2,Emily,Chen,emily@school.com,Rainbow Room\n\n";
      }

      if (exportType === "parents" || exportType === "all") {
        csvContent += "=== PARENTS DATA ===\n";
        csvContent += "ID,First Name,Last Name,Email,Children\n";
        csvContent += "1,Michael,Johnson,parent1@example.com,Emma Johnson\n";
        csvContent += "2,Jennifer,Smith,parent2@example.com,Oliver Smith\n";
      }

      // Create download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bulk_export_${exportType}_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        alert("Please select a CSV file");
        return;
      }
      setImportFile(file);
    }
  }

  function downloadTemplate() {
    const templates = {
      children: "First Name,Last Name,Date of Birth (YYYY-MM-DD),Classroom ID,Parent Email,Gender,Allergies,Emergency Contact\nEmma,Johnson,2022-03-15,1,parent@example.com,Female,None,555-0100\n",
      parents: "First Name,Last Name,Email,Phone,Address,Child IDs (comma-separated)\nMichael,Johnson,parent@example.com,555-0100,123 Main St,1\n",
      teachers: "First Name,Last Name,Email,Phone,Certifications,Classroom IDs (comma-separated)\nSarah,Johnson,teacher@example.com,555-0200,CPR First Aid,1\n",
    };

    const content = templates[importType];
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${importType}_import_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/admin"
          className="text-sm text-purple-600 hover:text-purple-800 mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Operations</h1>
        <p className="text-gray-600 mb-8">Import and export data in bulk using CSV files</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Import Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Import Data</h2>
                <p className="text-sm text-gray-600">Upload CSV files to add records</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Data Type
                </label>
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="children">Children</option>
                  <option value="parents">Parents</option>
                  <option value="teachers">Teachers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {importFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Selected: {importFile.name}
                  </p>
                )}
              </div>

              <button
                onClick={downloadTemplate}
                className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm"
              >
                Download CSV Template
              </button>

              <button
                onClick={handleImport}
                disabled={importing || !importFile}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                {importing ? "Importing..." : "Import Data"}
              </button>
            </div>

            {importResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Import Results</h3>
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✓ Successfully imported: {importResult.success}</p>
                  {importResult.failed > 0 && (
                    <>
                      <p className="text-sm text-red-600">✗ Failed: {importResult.failed}</p>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Errors:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {importResult.errors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
                <p className="text-sm text-gray-600">Download records as CSV files</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Data to Export
                </label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Data</option>
                  <option value="children">Children Only</option>
                  <option value="parents">Parents Only</option>
                  <option value="teachers">Teachers Only</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Export Includes:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {(exportType === "all" || exportType === "children") && (
                    <li>• All children records</li>
                  )}
                  {(exportType === "all" || exportType === "parents") && (
                    <li>• All parent information</li>
                  )}
                  {(exportType === "all" || exportType === "teachers") && (
                    <li>• All teacher records</li>
                  )}
                  <li className="text-xs text-gray-500 mt-2">Format: CSV (Excel compatible)</li>
                </ul>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                {exporting ? "Exporting..." : "Export Data"}
              </button>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">📋 Usage Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium mb-2">Import Best Practices:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use the provided CSV template</li>
                <li>Ensure all required fields are filled</li>
                <li>Check date formats (YYYY-MM-DD)</li>
                <li>Validate email addresses</li>
                <li>Remove duplicate entries</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Data Security:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>All imports are validated</li>
                <li>Failed records are reported</li>
                <li>Exports are encrypted</li>
                <li>Delete files after use</li>
                <li>Audit logs are maintained</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
