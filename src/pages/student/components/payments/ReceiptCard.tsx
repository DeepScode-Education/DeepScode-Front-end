import { Download, FileText } from "lucide-react";
import type { PaymentRecord } from "@/integrations/client";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const statusColor: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

const ReceiptCard = ({ payment }: { payment: PaymentRecord }) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0037FF]">
        <FileText className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">Payment #{payment.paymentNumber}</p>
        <p className="text-xs text-gray-500">{formatDate(payment.paidAt)} · {payment.paymentMethod}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[payment.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
        {payment.paymentStatus}
      </span>
      {payment.paymentStatus === "success" && (
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Download receipt (coming soon)">
          <Download className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

export default ReceiptCard;