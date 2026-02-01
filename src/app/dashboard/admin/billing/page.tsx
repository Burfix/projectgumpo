"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Subscription {
  id: number;
  tier: string;
  monthly_price_zar: number;
  trial_end_date: string | null;
  billing_status: string;
}

interface AddOn {
  id: number;
  add_on_name: string;
  monthly_price_zar: number;
}

interface Invoice {
  id: number;
  amount_zar: number;
  invoice_date: string;
  status: string;
}

export default function AdminBilling() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // TODO: Get actual school ID from auth context
      const schoolId = 1; // Placeholder
      const response = await fetch(`/api/schools/${schoolId}/billing`);
      const data = await response.json();
      setSubscription(data.subscription);
      setAddOns(data.addOns || []);
      // TODO: Load invoices from API
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addOnNames: Record<string, string> = {
    photo_packs: "Photo Packs",
    sms_alerts: "SMS Alerts",
    analytics: "Advanced Analytics",
    api_access: "API Access",
  };

  const tierColors: Record<string, string> = {
    Starter: "bg-stone-200 text-stone-800",
    Growth: "bg-emerald-200 text-emerald-800",
    Professional: "bg-blue-200 text-blue-800",
    Enterprise: "bg-purple-200 text-purple-800",
  };

  const getTotalMonthly = () => {
    const basePrice = subscription?.monthly_price_zar || 0;
    const addOnsTotal = addOns.reduce((sum, addon) => sum + addon.monthly_price_zar, 0);
    return basePrice + addOnsTotal;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Loading billing information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/dashboard/admin"
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-stone-900 mb-2">Billing & Subscription</h1>
        <p className="text-stone-600 mb-8">
          Manage your school's subscription, add-ons, and billing details
        </p>

        {subscription ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Plan */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-emerald-600">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-1">
                      Current Plan
                    </h2>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        tierColors[subscription.tier as keyof typeof tierColors]
                      }`}
                    >
                      {subscription.tier}
                    </span>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                    Upgrade Plan
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-200">
                  <div>
                    <p className="text-sm text-stone-600 mb-1">Monthly Price</p>
                    <p className="text-3xl font-bold text-stone-900">
                      R {subscription.monthly_price_zar.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600 mb-1">Billing Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        subscription.billing_status === "Active"
                          ? "bg-green-200 text-green-800"
                          : subscription.billing_status === "Trial"
                          ? "bg-amber-200 text-amber-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {subscription.billing_status}
                    </span>
                  </div>
                </div>

                {subscription.trial_end_date && subscription.billing_status === "Trial" && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-900">
                      <strong>Trial Period:</strong> Your trial ends on{" "}
                      {new Date(subscription.trial_end_date).toLocaleDateString()}. Subscribe
                      to continue enjoying all features.
                    </p>
                  </div>
                )}
              </div>

              {/* Add-ons */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-stone-900">Active Add-ons</h2>
                  <button className="px-4 py-2 border border-emerald-600 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-colors">
                    Browse Add-ons
                  </button>
                </div>

                {addOns.length > 0 ? (
                  <div className="space-y-3">
                    {addOns.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-stone-900">
                            {addOnNames[addon.add_on_name as keyof typeof addOnNames]}
                          </p>
                          <p className="text-sm text-stone-600">Active</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600">
                            R {addon.monthly_price_zar.toFixed(2)}/mo
                          </p>
                          <button className="text-xs text-red-600 hover:underline">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-600">
                    No add-ons enabled. Browse available add-ons to enhance your
                    experience.
                  </p>
                )}
              </div>

              {/* Payment History */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-stone-900 mb-4">Payment History</h2>
                {invoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-stone-200">
                        <tr>
                          <th className="text-left py-2 text-sm font-semibold text-stone-900">
                            Date
                          </th>
                          <th className="text-left py-2 text-sm font-semibold text-stone-900">
                            Amount
                          </th>
                          <th className="text-left py-2 text-sm font-semibold text-stone-900">
                            Status
                          </th>
                          <th className="text-right py-2 text-sm font-semibold text-stone-900">
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="py-3 text-sm text-stone-900">
                              {new Date(invoice.invoice_date).toLocaleDateString()}
                            </td>
                            <td className="py-3 text-sm font-medium text-stone-900">
                              R {invoice.amount_zar.toFixed(2)}
                            </td>
                            <td className="py-3">
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  invoice.status === "Paid"
                                    ? "bg-green-200 text-green-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {invoice.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button className="text-sm text-emerald-600 hover:underline">
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-stone-600">No payment history available yet.</p>
                )}
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              {/* Monthly Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">
                  Monthly Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-600">Subscription</span>
                    <span className="font-medium text-stone-900">
                      R {subscription.monthly_price_zar.toFixed(2)}
                    </span>
                  </div>
                  {addOns.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">
                        {addOnNames[addon.add_on_name as keyof typeof addOnNames]}
                      </span>
                      <span className="font-medium text-stone-900">
                        R {addon.monthly_price_zar.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                    <span className="font-semibold text-stone-900">Total</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      R {getTotalMonthly().toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">Billed monthly</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">
                  Payment Method
                </h3>
                <div className="p-4 bg-stone-50 rounded-lg mb-4">
                  <p className="text-sm text-stone-600 mb-1">Credit Card</p>
                  <p className="font-medium text-stone-900">•••• •••• •••• 4242</p>
                  <p className="text-xs text-stone-500 mt-1">Expires 12/2027</p>
                </div>
                <button className="w-full px-4 py-2 border border-stone-300 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors">
                  Update Payment Method
                </button>
              </div>

              {/* Support */}
              <div className="bg-emerald-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-emerald-800 mb-4">
                  Contact our billing support team for assistance with your subscription.
                </p>
                <button className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-stone-600 mb-4">No subscription found for your school.</p>
            <button className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
              Start Free Trial
            </button>
          </div>
        )}

        {/* Info Note */}
        <div className="mt-8 bg-stone-100 rounded-lg p-4">
          <p className="text-sm text-stone-700">
            <strong>Note:</strong> Payment processing integration with Stripe/PayFast will be
            available soon. Contact support for manual billing arrangements.
          </p>
        </div>
      </div>
    </div>
  );
}
