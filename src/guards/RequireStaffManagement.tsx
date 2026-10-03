import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

export default function RequireStaffManagement({children}:{children:ReactNode}) {
  const {user,loading:authLoading}=useAuth();
  const {permissions,loading}=usePermissions();
  if(authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if(!user) return <Navigate to="/login" replace/>;
  if(!permissions.has("employees.view")) return <Navigate to="/" replace/>;
  return <>{children}</>;
}
