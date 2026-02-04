"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface Subscription {
  id: number;
  subscription_type: string;
  status: string;
  start_date: string;
  end_date?: string;
  monthly_amount: number;
  created_at: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
  paid_date?: string;
  created_at: string;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subscriptionRes, invoicesRes] = await Promise.all([
        fetch("/api/secondary-principal/subscription"),
        fetch("/api/secondary-principal/invoices"),
      ]);

      if (subscriptionRes.ok) {
        const data = await subscriptionRes.json();
        setSubscription(data.subscription);
      }

      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "danger" | "info"> = {
      active: "success",
      pending: "warning",
      cancelled: "danger",
      paid: "success",
      unpaid: "warning",
      overdue: "danger",
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Billing & Subscription</h1>
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "unpaid" || inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const overdueCount = invoices.filter((inv) => inv.status === "overdue").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2">Manage your school's subscription and invoices</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Monthly Subscription</h3>
            <p className="text-3xl font-bold text-gray-900">
              {subscription ? formatCurrency(subscription.monthly_amount) : "-"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Amount</h3>
            <p className="text-3xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Overdue Invoices</h3>
            <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
          {subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Plan Type</p>
                <p className="text-lg font-medium text-gray-900">
                  {subscription.subscription_type.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                {getStatusBadge(subscription.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Start Date</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(subscription.start_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">End Date</p>
                <p className="text-lg font-medium text-gray-900">
                  {subscription.end_date ? formatDate(subscription.end_date) : "Ongoing"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No active subscription found.</p>
          )}
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Invoice History</h2>
          </div>
          <div className="overflow-x-auto">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No invoices found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Invoice Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Paid Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.paid_date ? formatDate(invoice.paid_date) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
