
import SupportPageHeader from "@/components/support/SupportPageHeader";
import QuickHelpCard from "@/components/support/QuickHelpCard";
import SupportFAQ from "@/components/support/SupportFAQ";
import SupportCTA from "@/components/support/SupportCTA";
import { KeyRound, UserCog, Mail, ShieldCheck, Lock, Fingerprint } from "lucide-react";

const quickHelp = [
  { icon: KeyRound, title: "Reset Password", description: "Reset your password via email link from the login page." },
  { icon: UserCog, title: "Update Profile", description: "Change your name, avatar, and bio from your profile settings." },
  { icon: Mail, title: "Change Email", description: "Update your email address and verify the new one." },
  { icon: ShieldCheck, title: "Account Security", description: "Review login activity and manage your security settings." },
];

const faqs = [
  { question: "I forgot my password. How do I reset it?", answer: "Click 'Forgot Password' on the login page, enter your email, and follow the reset link sent to your inbox." },
  { question: "How do I update my email address?", answer: "Go to Dashboard → Profile Settings → Email. Enter your new email and verify it through the confirmation link." },
  { question: "How do I delete my account?", answer: "Contact our support team through the ticket form. Account deletion is permanent and will remove all your data." },
  { question: "How can I secure my account?", answer: "Use a strong, unique password. Enable two-factor authentication if available, and never share your login credentials." },
];

const securityTips = [
  { icon: Lock, title: "Strong Passwords", description: "Use at least 12 characters with a mix of letters, numbers, and symbols." },
  { icon: Fingerprint, title: "Two-Factor Authentication", description: "Add an extra layer of security by enabling 2FA on your account." },
];

const SupportAccount = () => (
  <div className="min-h-screen bg-background">
 
    <SupportPageHeader title="Account & Profile" description="Manage your profile, security settings, and account preferences." />

    <div className="container py-12 space-y-12">
      <div>
        <h2 className="text-xl font-bold text-foreground">Quick Help</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickHelp.map((item, i) => (
            <QuickHelpCard key={item.title} {...item} index={i} />
          ))}
        </div>
      </div>

      <SupportFAQ faqs={faqs} />

      <div>
        <h2 className="text-xl font-bold text-foreground">Security Tips</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {securityTips.map((a, i) => (
            <QuickHelpCard key={a.title} {...a} index={i} />
          ))}
        </div>
      </div>

      <SupportCTA />
    </div>

  </div>
);

export default SupportAccount;
