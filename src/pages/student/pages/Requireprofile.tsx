import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wrap any student-only route that should be blocked until the profile
 * completion form has been submitted.
 *
 * Usage in App.tsx:
 *   <Route
 *     path="/dashboard"
 *     element={
 *       <RequireProfile>
 *         <Dashboard />
 *       </RequireProfile>
 *     }
 *   />
 *
 * NOTE: assumes useAuth() exposes { user, loading } where `user.profileCompleted`
 * and `user.role` exist (see AuthUser interface in integrations/supabase/client.ts).
 * Adjust the hook usage below if your AuthContext shape differs.
 */

// TEMP: set to true only while debugging/testing the dashboard.
// While true, the profile-completion gate below is skipped entirely.
// Flip back to false once you've confirmed the backend actually sends
// `profileCompleted: true` for students who've filled the form —
// otherwise every student gets bounced to /complete-profile forever.
const BYPASS_PROFILE_CHECK = true;

const RequireProfile = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // swap for a spinner if you have a shared Loader

  if (!user) return <Navigate to="/login" replace />;

  if (!BYPASS_PROFILE_CHECK && user.role === "student" && user.profileCompleted === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};

export default RequireProfile;