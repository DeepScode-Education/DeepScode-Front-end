import { Loader2 } from "lucide-react";
import useStudentFee from "@/hooks/useStudentFee";
import StudentLayout from "../components/StudentLayout";
import FeeOverview from "../components/payments/FeeOverview";
import PaymentHistory from "../components/payments/PaymentHistory";

const Payments = () => {
  const { fee, payments, loading } = useStudentFee();

  if (loading && !fee) {
    return (
      <StudentLayout title="Payments">
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0037FF]" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Payments" subtitle="Track your fees and payment history">
      <div className="space-y-6">
        <FeeOverview fee={fee} />
        <PaymentHistory payments={payments} />
      </div>
    </StudentLayout>
  );
};

export default Payments;