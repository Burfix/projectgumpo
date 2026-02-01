import Link from "next/link";
import { protectRoute } from "@/lib/auth/middleware";
import { getSubscriptionBySchoolId, getAddOnsBySubscriptionId } from "@/lib/schools";

export default async function BillingImpersonated({
  params,
}: {
  params: { schoolId: string };
}) {
  await protectRoute(["SUPER_ADMIN"]);

  const schoolId = parseInt(params.schoolId);
  const subscription = await getSubscriptionBySchoolId(schoolId);
  const addOns = subscription ? await getAddOnsBySubscriptionId(subscription.id) : [];

  const addOnNames: Record<string, string> = {
    photo_packs: "Photo Packs",
    sms_alerts: "SMS Alerts",
    analytics: "Advanced Analytics",
    api_access: "API Access",
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Impersonation Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-amber-900">
              Viewing as Super Admin — School #{params.schoolId}
            </p>
          </div>
          <Link
            href={`/dashboard/super-admin/impersonate/${params.schoolId}`}
            className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700"
          >
            Back to School Overview
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href={`/dashboard/super-admin/impersonate/${params.schoolId}`}
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-4 inline-block"
        >
          ← Back
        </Link>
        <h1 className="text-4xl font-bold text-stone-900 mb-2">
          Billing & Add-ons
        </h1>
        <p className="text-stone-600 mb-8">
          View subscription and add-on details for this school
        </p>

        {subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-stone-900 mb-4">
                Current Subscription
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-stone-600">Subscription Tier</p>
                  <p className="text-2xl font-bold text-stone-900">
                    {subscription.tier}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">Monthly Price</p>
                  <p className="text-xl font-bold text-emerald-600">
                    R {subscription.monthly_price_zar.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">Billing Status</p>
                  <p
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.billing_status === "Active"
                        ? "bg-green-200 text-green-800"
                        : subscription.billing_status === "Trial"
                        ? "bg-amber-200 text-amber-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {subscription.billing_status}
                  </p>
                </div>
                {subscription.trial_end_date && (
                  <div>
                    <p className="text-sm text-stone-600">Trial Ends</p>
                    <p className="text-stone-900">
                      {new Date(subscription.trial_end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Add-ons Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-stone-900 mb-4">
                Active Add-ons
              </h3>
              {addOns.length > 0 ? (
                <div className="space-y-3">
                  {addOns.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                    >
                      <span className="font-medium text-stone-900">
                        {addOnNames[addon.add_on_name]}
                      </span>
                      <span className="text-emerald-600 font-semibold">
                        R {addon.monthly_price_zar.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-stone-200 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">Add-ons Total</span>
                      <span className="text-emerald-600 font-bold text-lg">
                        R{" "}
                        {addOns
                          .reduce((sum, addon) => sum + addon.monthly_price_zar, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-stone-600">No add-ons currently enabled</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-stone-600">No subscription found for this school</p>
          </div>
        )}

        <div className="mt-8 bg-stone-100 rounded-lg p-4">
          <p className="text-sm text-stone-700">
            <strong>Payment Processing:</strong> TODO: Integrate with payment gateway
            (Stripe/PayFast) for billing management.
          </p>
        </div>
      </div>
    </div>
  );
}
