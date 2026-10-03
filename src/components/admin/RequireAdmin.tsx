import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const STAFF_ROLES = [
  "admin",
  "super_admin",
  "counsellor",
  "mentor",
  "accountant",
  "coordinator",
  "hr",
  "receptionist",
] as const;

/**
 * Shared staff workspace guard. Students keep their separate dashboard.
 * Actual module/API access is still enforced by permissions on the route/backend.
 */
const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "student") return <Navigate to="/" replace />;

  if (!STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number])) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
