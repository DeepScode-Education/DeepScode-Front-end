import { useEffect, useState } from "react";
import { staffApi } from "@/services/staff.service";

export function usePermissions() {
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    staffApi.myPermissions()
      .then((r) => {
        if (!alive) return;
        setPermissions(new Set(r.data.permissions || []));
        setRole(r.data.role || "");
      })
      .catch((e) => alive && setError(e?.message || "Unable to load permissions"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const can = (permission: string) => permissions.has(permission);
  const canAny = (...items: string[]) => items.some((item) => permissions.has(item));

  return { permissions, role, loading, error, can, canAny };
}
