import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  IdCard,
  Lock,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";
import { authApi, ApiError } from "@/integrations/client";
import { useAuthActions } from "@/contexts/AuthContext";

// ── Role → route mapping ───────────────────────────────────────────────────────
const getRoleRedirect = (role: string): string => {
  switch (role) {
    case "super_admin":
      return "/admin";

    case "admin":
      return "/admin";

    case "mentor":
      return "/mentor/dashboard";

    case "counsellor":
      return "/counsellor";

    case "accountant":
      return "/accountant";

    case "coordinator":
      return "/coordinator";

    case "hr":
      return "/hr";

    case "receptionist":
      return "/receptionist";

    case "student":
      return "/student";

    default:
      return "/login";
  }
};

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuthActions();
  const [identifier,    setIdentifier]    = useState(""); 
  const [password,      setPassword]      = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Please enter your email or Student ID.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(identifier, password);
      // signIn stores the token and fetches the full user profile
      await signIn(res.token);

      // Redirect based on role from the API response
      navigate(getRoleRedirect(res.user.role), { replace: true });
    } catch (err: any) {
      // ── Fee-pending redirect ────────────────────────────────────────────────
      // Login was blocked server-side (402 / FEE_PENDING) before any token was
      // issued. There's no authenticated session to protect, so send the
      // student to the payments support page with the fee details attached
      // via router state instead of showing a plain "invalid credentials" error.
      if (err instanceof ApiError && err.errorCode === "FEE_PENDING") {
  setError(
    "Your fee payment is pending. Please complete your fee payment to continue accessing your account."
  );
  return;
}

      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f1f2f4]">
      {/* Left – Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative  items-center justify-center p-12 bg-[#0037FF]">
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-5 mb-8 ml-4">
              <span className="text-2xl font-bold text-white foreground tracking-tight  ">
                deepScode Education
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-100 leading-tight mb-4">
              Continue your
              <br />
              learning journey
            </h2>
            <p className="text-gray-100 text-lg leading-relaxed">
              Pick up where you left off. Your progress, courses, and
              achievements are waiting.
            </p>
            <div className="mt-10 flex gap-6">
              {[
                { value: "5K+", label: "Students" },
                { value: "50+", label: "Courses" },
                { value: "95%", label: "Completion" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-gray-100">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-100">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Right – Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile header */}
          <div className="flex items-center justify-between gap-2 mb-10 lg:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground tracking-tight">
                deepScode Education
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
              aria-label="Back to Home"
            >
              <Home className="h-4 w-4" /> Home
            </Button>
          </div>

          {/* Desktop back button */}
          <div className="hidden lg:flex justify-end mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
              aria-label="Back to Home"
            >
              <Home className="h-4 w-4" /> Back to Home
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back 👋
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="identifier"
                className="text-sm font-medium text-foreground"
              >
                Email or Student ID
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@example.com or 4-digit Student ID"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-11 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#0037FF] hover:text-[#0037FF]/80 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 rounded-xl text-base font-semibold text-gray-100"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Login <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-secondary hover:text-secondary/80 transition-colors"
              >
                Create one
              </Link>
            </p>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;