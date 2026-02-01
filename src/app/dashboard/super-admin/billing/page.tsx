"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface BillingReport {
  school_id: number;
  school_name: string;
  subscription_tier: string;
  monthly_price_zar: number;
  add_on_revenue: number;
  total_monthly_revenue: number;
  billing_status: string;
  trial_end_date: string | null;
}

export default function BillingAndRevenue() {
  const [report, setReport] = useState<BillingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [tierFilter, setTierFilter] = useState("");

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/report");
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Error loading billing report:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReport = report.filter((item) => {
    if (tierFilter && item.subscription_tier !== tierFilter) return false;
    return true;
  });

  // Calculate summary metrics
  const totalMRR = filteredReport.reduce((sum, item) => sum + item.monthly_price_zar, 0);
  const totalAddOnRevenue = filteredReport.reduce(
    (sum, item) => sum + item.add_on_revenue,
    0
  );
  const totalRevenue = filteredReport.reduce(
    (sum, item) => sum + item.total_monthly_revenue,
    0
  );
  const payingSchools = filteredReport.filter(
    (item) => item.billing_status !== "Trial"
  ).length;
  const trialSchools = filteredReport.filter(
    (item) => item.billing_status === "Trial"
  ).length;

  const exportToCSV = () => {
    const headers = [
      "School Name",
      "Tier",
      "Base Price (ZAR)",
      "Add-ons Revenue (ZAR)",
      "Total Monthly Revenue (ZAR)",
      "Billing Status",
      "Trial End Date",
    ];

    const rows = filteredReport.map((item) => [
      item.school_name,
      item.subscription_tier,
      item.monthly_price_zar.toFixed(2),
      item.add_on_revenue.toFixed(2),
      item.total_monthly_revenue.toFixed(2),
      item.billing_status,
      item.trial_end_date ? new Date(item.trial_end_date).toLocaleDateString() : "N/A",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/super-admin"
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-stone-900 mb-2">
            Billing & Financial Reporting
          </h1>
          <p className="text-stone-600">
            Comprehensive revenue and subscription management
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Total MRR */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-stone-600 text-sm font-medium mb-1">
              Monthly Recurring Revenue
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              R {totalMRR.toFixed(2)}
            </div>
          </div>

          {/* Add-on Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-stone-600 text-sm font-medium mb-1">
              Add-on Revenue
            </div>
            <div className="text-3xl font-bold text-blue-600">
              R {totalAddOnRevenue.toFixed(2)}
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-stone-600 text-sm font-medium mb-1">
              Total Monthly Revenue
            </div>
            <div className="text-3xl font-bold text-purple-600">
              R {totalRevenue.toFixed(2)}
            </div>
          </div>

          {/* Paying Schools */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-stone-600 text-sm font-medium mb-1">
              Paying Schools
            </div>
            <div className="text-3xl font-bold text-green-600">{payingSchools}</div>
          </div>

          {/* Trial Schools */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-stone-600 text-sm font-medium mb-1">
              Trial Schools
            </div>
            <div className="text-3xl font-bold text-amber-600">{trialSchools}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Filter by Month
              </label>
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Tier Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Filter by Tier
              </label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Tiers</option>
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Professional">Professional</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            {/* Export Button */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                &nbsp;
              </label>
              <button
                onClick={exportToCSV}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Export to CSV
              </button>
            </div>
          </div>
        </div>

        {/* Billing Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-stone-600">Loading billing data...</div>
          ) : filteredReport.length === 0 ? (
            <div className="p-12 text-center text-stone-600">No billing data found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-100 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-900">
                      School Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-900">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-stone-900">
                      Base Price (ZAR)
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-stone-900">
                      Add-ons (ZAR)
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-stone-900">
                      Total (ZAR)
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-900">
                      Billing Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-900">
                      Trial End
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredReport.map((item) => (
                    <tr key={item.school_id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-stone-900">
                        {item.school_name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.subscription_tier === "Starter"
                              ? "bg-stone-200 text-stone-800"
                              : item.subscription_tier === "Growth"
                              ? "bg-emerald-200 text-emerald-800"
                              : item.subscription_tier === "Professional"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-purple-200 text-purple-800"
                          }`}
                        >
                          {item.subscription_tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-stone-900 font-mono">
                        R {item.monthly_price_zar.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-stone-900 font-mono">
                        R {item.add_on_revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-stone-900 font-mono font-bold">
                        R {item.total_monthly_revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.billing_status === "Active"
                              ? "bg-green-200 text-green-800"
                              : item.billing_status === "Trial"
                              ? "bg-amber-200 text-amber-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {item.billing_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        {item.trial_end_date
                          ? new Date(item.trial_end_date).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Total Footer */}
        {filteredReport.length > 0 && (
          <div className="mt-4 bg-stone-100 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-stone-900">TOTAL REVENUE:</span>
              <span className="text-2xl font-bold text-emerald-600">
                R {totalRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
