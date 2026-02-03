'use client';

import React, { useState } from 'react';

interface BulkInviteData {
  email: string;
  name?: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
  schoolName?: string;
}

type UploadFormat = 'csv' | 'manual';

export default function BulkInviteForm() {
  const [format, setFormat] = useState<UploadFormat>('manual');
  const [csvContent, setCsvContent] = useState('');
  const [invites, setInvites] = useState<BulkInviteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const parseCSV = (content: string): BulkInviteData[] => {
    const lines = content.trim().split('\n');
    const header = lines[0]?.toLowerCase().split(',').map(h => h.trim());
    
    if (!header || !header.includes('email')) {
      throw new Error('CSV must include "email" column');
    }

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const data: BulkInviteData = {
        email: values[header.indexOf('email')] || '',
        name: values[header.indexOf('name')] || undefined,
        role: (values[header.indexOf('role')] || 'PARENT').toUpperCase() as any,
        schoolName: values[header.indexOf('school')] || undefined,
      };
      return data;
    }).filter(d => d.email);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setCsvContent(content);
    try {
      if (content.trim()) {
        setInvites(parseCSV(content));
      }
    } catch (error) {
      console.error('CSV parse error:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setCsvContent(text);
    try {
      setInvites(parseCSV(text));
    } catch (error) {
      console.error('File parse error:', error);
    }
  };

  const handleSendInvites = async () => {
    if (invites.length === 0) {
      alert('No invites to send');
      return;
    }

    setLoading(true);
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const invite of invites) {
      try {
        const res = await fetch('/api/admin/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: invite.email,
            role: invite.role,
            name: invite.name,
          }),
        });

        if (res.ok) {
          success++;
        } else {
          const data = await res.json();
          failed++;
          errors.push(`${invite.email}: ${data.error || 'Failed'}`);
        }
      } catch (error) {
        failed++;
        errors.push(`${invite.email}: ${error instanceof Error ? error.message : 'Error'}`);
      }
    }

    setResults({ success, failed, errors });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Method</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setFormat('manual')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              format === 'manual'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium text-gray-900">Paste CSV</div>
            <div className="text-xs text-gray-600 mt-1">Paste data directly</div>
          </button>
          <button
            onClick={() => setFormat('csv')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              format === 'csv'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📄</div>
            <div className="font-medium text-gray-900">Upload File</div>
            <div className="text-xs text-gray-600 mt-1">CSV file upload</div>
          </button>
        </div>
      </div>

      {/* CSV Format Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">CSV Format (Required columns):</h4>
        <code className="text-sm text-blue-800 block bg-white p-2 rounded border border-blue-100 font-mono">
          email,role,name,school
        </code>
        <p className="text-xs text-blue-700 mt-2">
          Role must be: ADMIN, TEACHER, or PARENT. Name and school are optional.
        </p>
      </div>

      {/* Input Area */}
      {format === 'manual' ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">Paste CSV Data</label>
          <textarea
            value={csvContent}
            onChange={handleCSVUpload}
            placeholder="email,role,name,school&#10;john@school.com,TEACHER,John Smith,Sunshine School&#10;jane@school.com,PARENT,Jane Doe,Sunshine School"
            className="w-full h-40 border border-gray-300 rounded-lg p-3 font-mono text-sm"
          />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">Upload CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="w-full border border-gray-300 rounded-lg p-3"
          />
        </div>
      )}

      {/* Preview */}
      {invites.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Preview ({invites.length} invites)</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">School</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invites.slice(0, 10).map((invite, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900">{invite.email}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        invite.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        invite.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {invite.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{invite.name || '-'}</td>
                    <td className="px-6 py-3 text-gray-600">{invite.schoolName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invites.length > 10 && (
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
              ... and {invites.length - 10} more
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Results</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{results.success}</div>
              <div className="text-sm text-green-700">Successfully sent</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{results.failed}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
          </div>
          {results.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-medium text-red-900 mb-2">Errors:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {results.errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSendInvites}
        disabled={loading || invites.length === 0}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {loading ? 'Sending invites...' : `Send ${invites.length} Invites`}
      </button>
    </div>
  );
}
