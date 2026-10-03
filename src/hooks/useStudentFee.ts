import { useCallback, useEffect, useState } from "react";
import { studentFeeService } from "@/services/student.service";
import type { Fee, PaymentRecord } from "@/integrations/client";

const useStudentFee = () => {
  const [fee, setFee] = useState<Fee | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFee = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [feeRes, paymentsRes] = await Promise.all([
        studentFeeService.getFee(),
        studentFeeService.getPayments(),
      ]);
      setFee(feeRes.data ?? null);
      setPayments(paymentsRes.data ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load fee details.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFee();
  }, [fetchFee]);

  return { fee, payments, loading, error, refresh: fetchFee };
};

export default useStudentFee;