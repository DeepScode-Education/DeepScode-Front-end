import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

const MENTOR_ROLES = ["mentor", "admin", "super_admin"] as const;

const RequireMentor = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Admin/super_admin can peek into mentor views for support purposes,
  // but students, counsellors, and accountants are blocked — same
  // permission shape as RequireCounsellor.
  if (!MENTOR_ROLES.includes(user.role as (typeof MENTOR_ROLES)[number])) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireMentor;