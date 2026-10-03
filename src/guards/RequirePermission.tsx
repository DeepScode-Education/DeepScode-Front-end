import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

type Props = {
  permission: string;
  children: ReactNode;
  fallback?: string;
};

/**
 * Frontend route guard for the staff permission system.
 * Backend permission middleware remains the real security boundary.
 */
export default function RequirePermission({ permission, children, fallback = "/admin" }: Props) {
  const location = useLocation();
  const { can, role } = usePermissions();

  if (role === "super_admin" || can(permission)) {
    return <>{children}</>;
  }

  return <Navigate to={fallback} replace state={{ from: location.pathname, deniedPermission: permission }} />;
}
