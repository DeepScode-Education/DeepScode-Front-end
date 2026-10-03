// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Mail, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
// import { motion } from "framer-motion";
// import { authApi } from "@/integrations/client";

// const ForgotPassword = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//  const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setError("");

//   if (!email.trim()) {
//     setError("Please enter your email address.");
//     return;
//   }

//   setLoading(true);
//   try {
//     const res = await authApi.forgotPassword(email.trim());
//     setSubmitted(true);
//   } catch (err: any) {
//     // Ab yahan "No account found with this email address." jaisa specific
//     // message dikhega jab email DB me na ho.
//     setError(err.message || "Something went wrong. Please try again.");
//   } finally {
//     setLoading(false);
//   }
// };
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#f1f2f4] px-6 py-12">
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-border/60 p-8"
//       >
//         <Link
//           to="/login"
//           className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
//         >
//           <ArrowLeft className="h-4 w-4" /> Back to Login
//         </Link>

//         {submitted ? (
//           <div className="text-center py-4">
//             <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
//               <CheckCircle2 className="h-7 w-7 text-emerald-600" />
//             </div>
//             <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
//             <p className="text-muted-foreground text-sm leading-relaxed">
//               If an account exists for <span className="font-medium text-foreground">{email}</span>, we've sent a
//               password reset link. It will expire in 30 minutes.
//             </p>
//             <Button
//               variant="outline"
//               className="w-full h-11 rounded-xl mt-6"
//               onClick={() => navigate("/login")}
//             >
//               Back to Login
//             </Button>
//           </div>
//         ) : (
//           <>
//             <div className="mb-8">
//               <h1 className="text-2xl font-bold text-foreground mb-2">Forgot password?</h1>
//               <p className="text-muted-foreground text-sm">
//                 Enter your email and we'll send you a link to reset your password.
//               </p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-5">
//               {error && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="flex items-center gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive"
//                 >
//                   <AlertCircle className="h-4 w-4 shrink-0" />
//                   {error}
//                 </motion.div>
//               )}

//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-sm font-medium text-foreground">
//                   Email address
//                 </Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="you@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="pl-11 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
//                   />
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 size="lg"
//                 className="w-full h-12 rounded-xl text-base font-semibold text-gray-100"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <span className="flex items-center gap-2">
//                     <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
//                     Sending...
//                   </span>
//                 ) : (
//                   <span className="flex items-center gap-2">
//                     Send Reset Link <ArrowRight className="h-4 w-4" />
//                   </span>
//                 )}
//               </Button>
//             </form>
//           </>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default ForgotPassword;



import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { authApi } from "@/integrations/client";

type Step = "email" | "otp" | "password" | "success";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // ── Step 1: send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP (from step 2) ──────────────────────────────────────────────
  const handleResendOtp = async () => {
    setError("");
    setResending(true);
    try {
      await authApi.forgotPassword(email.trim());
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const res: any = await authApi.verifyResetOtp(email.trim(), otp.trim());
      if (res.valid) {
        setStep("password");
      } else {
        setError(res.message || "Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: set new password ──────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim() || password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(email.trim(), otp.trim(), password.trim());
      setStep("success");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f2f4] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-border/60 p-8"
      >
        {step !== "success" && (
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-5"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* ── Step 1: Email ─────────────────────────────────────────────── */}
        {step === "email" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Forgot password?</h1>
              <p className="text-muted-foreground text-sm">
                Enter your email and we'll send you a 6-digit OTP to reset your password.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  />
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
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send OTP <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </>
        )}

        {/* ── Step 2: OTP ───────────────────────────────────────────────── */}
        {step === "otp" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Enter OTP</h1>
              <p className="text-muted-foreground text-sm">
                We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
                It expires in 10 minutes.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-foreground">
                  6-digit OTP
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="pl-11 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors tracking-[6px] font-semibold"
                  />
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
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Verify OTP <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="w-full text-center text-sm font-medium text-[#0037FF] hover:text-[#0037FF]/80 transition-colors disabled:opacity-50"
              >
                {resending ? "Resending..." : "Didn't get the code? Resend OTP"}
              </button>
            </form>
          </>
        )}

        {/* ── Step 3: New Password ──────────────────────────────────────── */}
        {step === "password" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Set a new password</h1>
              <p className="text-muted-foreground text-sm">
                Choose a strong password with at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  New Password
                </Label>
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
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  />
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
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Update Password <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </>
        )}

        {/* ── Step 4: Success ───────────────────────────────────────────── */}
        {step === "success" && (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Password updated!</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your password has been changed successfully. Redirecting you to login...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;