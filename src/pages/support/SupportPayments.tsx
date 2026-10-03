
import SupportPageHeader from "@/components/support/SupportPageHeader";
import QuickHelpCard from "@/components/support/QuickHelpCard";
import SupportFAQ from "@/components/support/SupportFAQ";
import SupportCTA from "@/components/support/SupportCTA";
import { RotateCcw, CreditCard, AlertTriangle, FileText, ShieldCheck, Clock } from "lucide-react";

const quickHelp = [
  { icon: RotateCcw, title: "Request a Refund", description: "Get a full refund within 30 days of purchase through your billing settings." },
  { icon: CreditCard, title: "Payment Methods", description: "We accept credit cards, debit cards, UPI, and net banking." },
  { icon: AlertTriangle, title: "Failed Transactions", description: "Troubleshoot declined payments and pending charges." },
  { icon: FileText, title: "Download Invoice", description: "Access and download invoices from your purchase history." },
];

const faqs = [
  { question: "How do I get a refund?", answer: "Navigate to Settings → Billing → Request Refund. Refunds are processed within 5-7 business days. You must request within 30 days of purchase." },
  { question: "What is the refund policy?", answer: "We offer a 30-day money-back guarantee on all course purchases. If you've completed more than 50% of a course, a partial refund may apply." },
  { question: "Why did my payment fail?", answer: "Common reasons include insufficient funds, expired card, or bank restrictions. Try a different payment method or contact your bank." },
  { question: "Can I get an invoice for my purchase?", answer: "Yes! Go to Dashboard → Purchase History and click the download icon next to any transaction to get a PDF invoice." },
];

const articles = [
  { icon: ShieldCheck, title: "Refund Policy Breakdown", description: "Detailed guide on eligibility, timelines, and how partial refunds work." },
  { icon: Clock, title: "Payment Troubleshooting", description: "Step-by-step guide to resolve failed payments, pending charges, and billing errors." },
];

const SupportPayments = () => (
  <div className="min-h-screen bg-background">

    <SupportPageHeader title="Payments & Billing" description="Everything about billing, refunds, invoices, and payment methods." />

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
        <h2 className="text-xl font-bold text-foreground">Detailed Articles</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {articles.map((a, i) => (
            <QuickHelpCard key={a.title} {...a} index={i} />
          ))}
        </div>
      </div>

      <SupportCTA />
    </div>
 
  </div>
);

export default SupportPayments;
