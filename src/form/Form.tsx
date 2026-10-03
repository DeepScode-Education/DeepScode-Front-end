
import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormData {
  fullName: string;
  mobileNumber: string;
  email: string;
  course: string;
}

interface CourseOption {
  _id: string;
  title: string;
}

interface FormProps {
  onClose?: () => void;
  onSuccess?: () => void; // 👈 submit success par fire hota hai (PDF download trigger)
  /** True while the parent's download hook is fetching/saving the file post-submit. */
  isSubmitting?: boolean;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    // ── MSG91 Custom UI widget globals ──────────────────────────────────────
    initSendOTP?: (config: Record<string, any>) => void;
    sendOtp?: (
      identifier: string,
      success: (data: any) => void,
      failure: (error: any) => void
    ) => void;
    verifyOtp?: (
      otp: string,
      success: (data: any) => void,
      failure: (error: any) => void
    ) => void;
    retryOtp?: (
      channel: string,
      success: (data: any) => void,
      failure: (error: any) => void
    ) => void;
  }
}

const MSG91_WIDGET_SCRIPT_SRC = "https://verify.msg91.com/otp-provider.js";
const MSG91_WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID as string;
const MSG91_TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN as string;

// Module-level singleton so the MSG91 script is only ever injected/loaded
// once, even if the form mounts/unmounts multiple times (e.g. modal reopen).
let msg91ScriptPromise: Promise<void> | null = null;

const loadMsg91Script = (): Promise<void> => {
  if (msg91ScriptPromise) return msg91ScriptPromise;

  msg91ScriptPromise = new Promise((resolve, reject) => {
    if (window.initSendOTP) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${MSG91_WIDGET_SCRIPT_SRC}"]`
    );

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load phone verification script"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = MSG91_WIDGET_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load phone verification script"));
    document.body.appendChild(script);
  });

  return msg91ScriptPromise;
};

// ── FIX: module-level singleton for widget initialization ───────────────────
// React StrictMode (dev only) mounts every component twice, which was
// calling window.initSendOTP(...) a second time after the script had
// already resolved. Re-initializing the MSG91 widget mid-session
// invalidates whatever session the first init created, so an OTP sent
// under the first session would then fail verification with
// "AuthenticationFailure" — even with the correct code — because the
// widget's internal state had been reset out from under it.
// Guarding init behind its own singleton (same pattern as the script
// loader above) ensures initSendOTP is called exactly once for the whole
// page lifetime, regardless of how many times this component mounts.
let msg91InitPromise: Promise<void> | null = null;

const initMsg91Widget = (): Promise<void> => {
  if (msg91InitPromise) return msg91InitPromise;

  msg91InitPromise = loadMsg91Script().then(() => {
    window.initSendOTP?.({
      widgetId: MSG91_WIDGET_ID,
      tokenAuth: MSG91_TOKEN_AUTH,
      exposeMethods: true,
      success: () => {
        // No-op — with exposeMethods:true, each call to sendOtp/verifyOtp
        // below receives its own success/failure callback directly, so
        // this top-level one is not part of our flow.
      },
      failure: () => {
        // No-op, same reason as above.
      },
    });
  });

  return msg91InitPromise;
};

// Keep validation and the MSG91 identifier based on one canonical value.
// This permits pasted/formatted input such as "808-324-7869" while requiring
// exactly ten digits after normalization.
const normalizeIndianMobile = (value: string) => value.trim().replace(/\D/g, "");
const isValidIndianMobile = (value: string) => /^\d{10}$/.test(value);

const OTP_LENGTH = 4;
const EMPTY_OTP = Array<string>(OTP_LENGTH).fill("");

// The three screens the modal can show. The form data itself lives in
// `formData` regardless of which screen is visible, so moving between
// screens never loses what the person already typed.
type ViewMode = "form" | "otp" | "verified";

const Form: React.FC<FormProps> = ({ onClose, onSuccess, isSubmitting = false }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobileNumber: "",
    email: "",
    course: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<ViewMode>("form");

  // ── Phone OTP state (MSG91-backed, unchanged) — the ONLY verification
  // step left in this form. Email OTP (send + verify + Resend API) has
  // been removed entirely; email is now just a plain field that goes
  // straight into formData/handleSubmit. ─────────────────────────────────
  const [phoneWidgetReady, setPhoneWidgetReady] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_OTP);
  const [otpError, setOtpError] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneSendLoading, setPhoneSendLoading] = useState(false);
  const [phoneVerifyLoading, setPhoneVerifyLoading] = useState(false);
  const [phoneResendLoading, setPhoneResendLoading] = useState(false);
  const [phoneResendCooldown, setPhoneResendCooldown] = useState(0);
  const verifiedMobileRef = useRef<string>("");
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // isLoading = this form's own POST to /api/inquiries is in flight.
  // isSubmitting = the parent's download hook is still fetching the file
  // after that POST succeeded. Both should lock the form the same way.
  const busy = isLoading || isSubmitting;

  // ── Courses — fetched from the existing courses API instead of hardcoded ──
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/courses?limit=100`
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load courses");

        const list: CourseOption[] = (data.data || []).map((c: any) => ({
          _id: c._id,
          title: c.title,
        }));

        setCourses(list);
      } catch (err: any) {
        toast.error(err.message || "Could not load courses");
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // MSG91 must not load on the initial page render. The widget is only
  // required when a user actually tries to send an OTP, so we defer the
  // network + init costs until the first send attempt.

  // ── Resend cooldown ticker (prevents OTP-spam clicking) ──────────────────
  useEffect(() => {
    if (phoneResendCooldown <= 0) return;
    const timer = setInterval(() => {
      setPhoneResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneResendCooldown]);

  // Focus the first OTP box whenever the OTP screen becomes visible.
  useEffect(() => {
    if (view === "otp") {
      otpInputRefs.current[0]?.focus();
    }
  }, [view]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const nextValue = name === "mobileNumber" ? normalizeIndianMobile(value) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    // If the mobile number is edited after being verified, the old
    // verification no longer applies to whatever is now typed in — reset it
    // so a stale "verified" state can never be submitted for a new number.
    if (name === "mobileNumber" && phoneVerified && nextValue !== verifiedMobileRef.current) {
      setPhoneVerified(false);
      setPhoneOtpSent(false);
      setOtpDigits(EMPTY_OTP);
      setView("form");
    }
  };

  const resetOtpBoxes = () => {
    setOtpDigits(EMPTY_OTP);
    setOtpError("");
    otpInputRefs.current[0]?.focus();
  };

  // ── OTP box handlers — 4 individual inputs, auto-focus forward on entry,
  // backspace-to-previous when the current box is already empty. ──────────
  const handleOtpDigitChange = (index: number, rawValue: string) => {
    setOtpError("");
    const digit = rawValue.replace(/\D/g, "").slice(-1);

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key !== "Backspace") return;

    if (otpDigits[index]) {
      // Let the default change handler clear this box; nothing extra to do.
      return;
    }

    // Current box is already empty — move back a box and clear it too, so
    // repeated backspaces walk left the way people expect.
    if (index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
    }
  };

  // ── Phone OTP handlers (MSG91 Custom UI — send/resend/verify unchanged) ──
  const ensureMsg91WidgetReady = async () => {
    if (!MSG91_WIDGET_ID || !MSG91_TOKEN_AUTH) {
      const message =
        "MSG91 widget is not configured — VITE_MSG91_WIDGET_ID / VITE_MSG91_TOKEN missing.";
      console.error(message);
      throw new Error(message);
    }

    if (window.sendOtp && window.verifyOtp && window.retryOtp) {
      setPhoneWidgetReady(true);
      return;
    }

    await initMsg91Widget();
    setPhoneWidgetReady(true);
  };

  const sendPhoneOtp = async () => {
    // Clear any stale error/success toast from a previous attempt before
    // starting a fresh send — otherwise an old "AuthenticationFailure"
    // toast can sit on screen and look like it belongs to this new attempt.
    toast.dismiss();

    const normalizedMobileNumber = normalizeIndianMobile(formData.mobileNumber);
    const isValidMobileNumber = isValidIndianMobile(normalizedMobileNumber);

    if (!isValidMobileNumber) {
      toast.error("Enter a valid 10-digit mobile number first");
      return;
    }

    try {
      setPhoneWidgetReady(false);
      await ensureMsg91WidgetReady();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message ||
          "Could not load phone verification service. Please refresh and try again."
      );
      return;
    }

    if (!window.sendOtp) {
      toast.error("Phone verification is still loading. Please wait a moment and try again.");
      return;
    }

    setPhoneSendLoading(true);
    // MSG91 expects the identifier with country code, no "+" — India = 91.
    const identifier = `91${normalizedMobileNumber}`;

    // MSG91's SDK can fail in ways that never reach our failure callback —
    // e.g. an internal network-error thrown straight from otp-provider.js
    // (seen when the calling domain isn't whitelisted for this widget yet).
    // Without a safeguard, the button gets stuck on "Sending..." forever.
    // This timeout guarantees the UI recovers even if MSG91's SDK misbehaves.
    let settled = false;
    const stuckTimeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      setPhoneSendLoading(false);
      toast.error(
        "Could not send OTP — the phone verification service didn't respond. Please try again."
      );
    }, 15000);

    try {
      window.sendOtp(
        identifier,
        () => {
          if (settled) return;
          settled = true;
          clearTimeout(stuckTimeout);
          setPhoneSendLoading(false);
          setPhoneOtpSent(true);
          setPhoneResendCooldown(30);
          resetOtpBoxes();
          setView("otp");
          toast.success("OTP sent to your mobile number");
        },
        (error: any) => {
          if (settled) return;
          settled = true;
          clearTimeout(stuckTimeout);
          setPhoneSendLoading(false);
          toast.error(error?.message || "Failed to send OTP. Please try again.");
        }
      );
    } catch (err: any) {
      // Covers a synchronous throw from the SDK itself (as opposed to an
      // async failure callback) — same class of bug as the network-error
      // seen when the widget's domain isn't whitelisted.
      if (!settled) {
        settled = true;
        clearTimeout(stuckTimeout);
        setPhoneSendLoading(false);
        toast.error(
          "Failed to send OTP. If this keeps happening, the phone verification service may not be configured for this domain yet."
        );
      }
      console.error("[phoneOtp] sendOtp threw synchronously:", err);
    }
  };

  const resendPhoneOtp = () => {
    if (!window.retryOtp || phoneResendCooldown > 0) return;

    toast.dismiss();
    setPhoneResendLoading(true);
    // channel "11" = SMS text retry, per MSG91 widget convention.
    window.retryOtp(
      "11",
      () => {
        setPhoneResendLoading(false);
        setPhoneResendCooldown(30);
        resetOtpBoxes();
        toast.success("OTP resent to your mobile number");
      },
      (error: any) => {
        setPhoneResendLoading(false);
        toast.error(error?.message || "Failed to resend OTP. Please try again.");
      }
    );
  };

  // ── verifyPhoneOtp — payload shape, normalization, backend verification
  // unchanged; now reads the 4 individual boxes instead of one text field,
  // and drives the otp/verified screen switch on success/failure. ─────────
  const verifyPhoneOtp = () => {
    toast.dismiss();
    setOtpError("");

    const enteredOtp = otpDigits.join("");

    if (enteredOtp.length < OTP_LENGTH) {
      setOtpError("Enter the full 4-digit OTP");
      return;
    }
    if (!window.verifyOtp) {
      toast.error("Phone verification is not ready. Please try again.");
      return;
    }

    setPhoneVerifyLoading(true);

    window.verifyOtp(
      enteredOtp,
      async (data: any) => {
        try {
          // MSG91's Custom UI success callback returns { type, message },
          // where `message` is the access-token that must be re-checked
          // server-side (never trust it purely because the browser says so).
          const accessToken = data?.message;
          if (!accessToken) {
            throw new Error("Verification failed — no access token received");
          }

          // Always use the same normalized 10-digit number that was used
          // to send the OTP — never the raw formData.mobileNumber value.
          const normalizedMobileNumber = normalizeIndianMobile(formData.mobileNumber);

          if (!isValidIndianMobile(normalizedMobileNumber)) {
            // Defensive guard only — should be unreachable in practice
            // since sendPhoneOtp already validated this number, and the
            // input is disabled once phoneOtpSent is true.
            toast.error("Enter a valid 10-digit mobile number first");
            return;
          }

          const res = await fetch(
            `${import.meta.env.VITE_API_BASE}/api/phone-otp/verify-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                mobileNumber: normalizedMobileNumber,
                accessToken,
              }),
            }
          );

          const result = await res.json();
          if (!res.ok) throw new Error(result.message || "Phone verification failed");

          verifiedMobileRef.current = formData.mobileNumber;
          setPhoneVerified(true);
          setView("verified");
          toast.success("Mobile number verified successfully");
        } catch (err: any) {
          setOtpError(err.message || "Phone verification failed. Please try again.");
          toast.error(err.message || "Phone verification failed. Please try again.");
        } finally {
          setPhoneVerifyLoading(false);
        }
      },
      (error: any) => {
        setPhoneVerifyLoading(false);
        // Full error object logged for diagnosis — MSG91 failure payloads
        // often carry more detail (type/code) than just `.message`.
        console.error("[phoneOtp] verifyOtp failure — full error:", error);
        const message = error?.message || "Incorrect OTP. Please try again.";
        setOtpError(message);
        toast.error(message);
        // Let the person retry: clear the boxes and refocus the first one.
        resetOtpBoxes();
      }
    );
  };

  // ── doSubmit — the actual POST to /api/inquiries. Split out from the
  // "Apply Now" click handler so it can be called without a form event
  // (the confirmation screen's button isn't inside a <form> submit). ──────
  const doSubmit = async () => {
    if (!phoneVerified) {
      toast.error("Please verify your mobile number before submitting");
      return;
    }

    setIsLoading(true); // ✅ disable button + show loader

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/inquiries`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // ✅ Google Ads Conversion
      window.gtag?.("event", "conversion", {
        send_to: "AW-18216072059/9XjcCODKmb4cEPvmjO5D",
      });

      toast.success(data.message || "Form submitted successfully! 🎉", {
        position: "top-right",
        autoClose: 4000,
      }); // ✅ success toast

      setFormData({ fullName: "", mobileNumber: "", email: "", course: "" });

      setOtpDigits(EMPTY_OTP);
      setPhoneOtpSent(false);
      setPhoneVerified(false);
      verifiedMobileRef.current = "";
      setView("form");

      // 👇 yahi PDF download trigger karega (parent's useDownload hook me).
      onSuccess?.();

      onClose?.();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      }); // ✅ error toast
    } finally {
      setIsLoading(false); // ✅ re-enable button
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || phoneSendLoading) return;
    void sendPhoneOtp();
  };

  const handleOtpFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneVerifyLoading) return;
    verifyPhoneOtp();
  };

  return (
    <>
      {/* ✅ ToastContainer — page mein ek baar hi chahiye */}
      <ToastContainer />

      <div className="w-full bg-white rounded-3xl shadow-xl p-6 md:p-10">
        {view === "form" && (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Apply Now</h2>
            <p className="text-gray-500 mb-8">
              Get a free counselling session &amp; curriculum guide.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={busy}
                className="w-full h-14 px-5 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <input
                type="tel"
                name="mobileNumber"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                disabled={busy}
                className="w-full h-14 px-5 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={busy}
                className="w-full h-14 px-5 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                disabled={busy || coursesLoading}
                className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {coursesLoading ? "Loading courses..." : "Course Interested In"}
                </option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={busy || phoneSendLoading || !phoneWidgetReady}
                className="w-full h-14 rounded-xl bg-[#0037FF] hover:bg-[#4a6ff7] text-white text-lg font-semibold hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
              >
                {phoneSendLoading ? (
                  <>
                    <Spinner />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          </>
        )}

        {view === "otp" && (
          <>
            <button
              type="button"
              onClick={() => setView("form")}
              disabled={phoneVerifyLoading}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4 disabled:opacity-50"
            >
              ← Back
            </button>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify your number</h2>
            <p className="text-gray-500 mb-8">
              Enter the 4-digit code sent to{" "}
              <span className="font-medium text-gray-700">
                {formData.mobileNumber}
              </span>
              .
            </p>

            <form onSubmit={handleOtpFormSubmit} className="space-y-6">
              <div className="flex justify-center gap-3">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={phoneVerifyLoading}
                    className="w-14 h-16 text-center text-2xl font-semibold rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:opacity-50"
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-sm text-red-500 text-center">{otpError}</p>
              )}

              <div className="flex items-center justify-center gap-6 text-sm">
                <button
                  type="button"
                  onClick={resetOtpBoxes}
                  disabled={phoneVerifyLoading}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Clear OTP
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={resendPhoneOtp}
                  disabled={phoneResendLoading || phoneResendCooldown > 0}
                  className="text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
                >
                  {phoneResendLoading
                    ? "Resending..."
                    : phoneResendCooldown > 0
                    ? `Resend OTP in ${phoneResendCooldown}s`
                    : "Resend OTP"}
                </button>
              </div>

              <button
                type="submit"
                disabled={phoneVerifyLoading || otpDigits.join("").length < OTP_LENGTH}
                className="w-full h-14 rounded-xl bg-[#0037FF] hover:bg-[#4a6ff7] text-white text-lg font-semibold hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
              >
                {phoneVerifyLoading ? (
                  <>
                    <Spinner />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>
          </>
        )}

        {view === "verified" && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Mobile Number Verified
            </h2>
            <p className="text-gray-500 mb-8">
              {formData.mobileNumber} is confirmed. You're ready to apply.
            </p>

            <button
              type="button"
              onClick={doSubmit}
              disabled={busy}
              className="w-full h-14 rounded-xl bg-[#0037FF] hover:bg-[#4a6ff7] text-white text-lg font-semibold hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Spinner />
                  {isLoading ? "Submitting..." : "Preparing your download..."}
                </>
              ) : (
                "Apply Now"
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Small shared spinner used on both the "Send OTP" and "Apply Now" buttons.
const Spinner: React.FC = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8z"
    />
  </svg>
);

export default Form;