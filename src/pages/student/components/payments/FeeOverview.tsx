import { Wallet } from "lucide-react";
import type { Fee } from "@/integrations/client";

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-gray-900 mt-0.5">{value}</p>
  </div>
);

const FeeOverview = ({ fee }: { fee: Fee | null }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Wallet className="w-4 h-4 text-[#0037FF]" /> Fee Overview
    </h3>
    {fee ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Stat label="Total Fees" value={`₹${fee.totalFees?.toLocaleString() ?? 0}`} />
        <Stat label="Paid Amount" value={`₹${fee.totalPaid?.toLocaleString() ?? 0}`} />
        <Stat label="Remaining" value={`₹${fee.remainingAmount?.toLocaleString() ?? 0}`} />
        <Stat
          label="Payment Plan"
          value={fee.paymentMode === "emi" ? `EMI (${fee.emiMonths} mo)` : "Full Payment"}
        />
        <Stat label="Next Due Date" value={formatDate(fee.nextDueDate)} />
        {fee.paymentMode === "emi" && (
          <Stat label="Monthly EMI" value={`₹${fee.monthlyEmiAmount?.toLocaleString() ?? 0}`} />
        )}
      </div>
    ) : (
      <p className="text-sm text-gray-500">No fee plan set up yet. Please contact the accounts office.</p>
    )}
  </div>
);

export default FeeOverview;