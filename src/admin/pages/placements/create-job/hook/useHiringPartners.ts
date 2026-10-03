import { useCallback, useEffect, useState } from "react";
// Adjust this import to wherever hiringPartnersApi actually lives.
// It should call GET /api/admin/hiring-partners using the same
// authenticated client instance opportunitiesApi already uses.
import { hiringPartnersApi } from "@/integrations/client";
import { HiringPartnerOption } from "../types";

const unwrap = (res: any) => (res?.data !== undefined && res?.success === undefined ? res.data : res);

export function useHiringPartners() {
  const [hiringPartners, setHiringPartners] = useState<HiringPartnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHiringPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the full list (active + inactive) so inactive partners can
      // still be *displayed* (e.g. on an existing opportunity) while being
      // disabled from new selection in the dropdown.
      const res = unwrap(await hiringPartnersApi.getAll({ limit: 100 }));
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      if (res && res.success === false) throw new Error(res.message || "Failed to load hiring partners");

      const partners: HiringPartnerOption[] = list.map((p: any) => ({
        _id: p._id,
        companyName: p.companyName,
        isActive: p.isActive !== false,
      }));
      setHiringPartners(partners);
    } catch (err: any) {
      setError(err?.message || "Failed to load hiring partners");
      setHiringPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHiringPartners();
  }, [fetchHiringPartners]);

  return {
    hiringPartners,
    hiringPartnersLoading: loading,
    hiringPartnersError: error,
    refetchHiringPartners: fetchHiringPartners,
  };
}