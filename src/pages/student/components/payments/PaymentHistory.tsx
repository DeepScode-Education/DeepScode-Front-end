import { FileText } from "lucide-react";
import type { PaymentRecord } from "@/integrations/client";
import ReceiptCard from "./ReceiptCard";

const PaymentHistory = ({ payments }: { payments: PaymentRecord[] }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <FileText className="w-4 h-4 text-[#0037FF]" /> Payment History
    </h3>
    {payments.length === 0 ? (
      <p className="text-sm text-gray-500">No payments recorded yet.</p>
    ) : (
      <div className="space-y-3">
        {payments.map((p) => (
          <ReceiptCard key={p._id} payment={p} />
        ))}
      </div>
    )}
  </div>
);

export default PaymentHistory;