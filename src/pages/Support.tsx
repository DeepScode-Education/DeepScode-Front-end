import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Search,
  CreditCard,
  BookOpen,
  User,
  Wrench,
  ChevronDown,
  MessageCircle,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const helpCategories = [
  { icon: CreditCard, title: "Payments", desc: "Billing, refunds & invoices", path: "/support/payments" },
  { icon: BookOpen, title: "Courses", desc: "Access, content & certificates", path: "/support/courses" },
  { icon: User, title: "Account", desc: "Profile, settings & login", path: "/support/account" },
  { icon: Wrench, title: "Technical", desc: "Bugs, errors & compatibility", path: "/support/technical" },
];

const faqs = [
  { q: "How do I get a refund?", a: "No Refund" },
  { q: "Can I access courses on mobile?", a: "Yes, fully mobile responsive." },
  { q: "Do I get a certificate?", a: "Yes after completion." },
  { q: "How do I contact mentor?", a: "Through dashboard messaging." },
];

const Support = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [issueType, setIssueType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const navigate = useNavigate();

  /* ---------------- FAKE SUBMIT (UI ONLY) ---------------- */
  

  return (
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container text-center">
          <h1 className="text-3xl font-bold lg:text-4xl text-gray-900">
            How can we help you?
          </h1>

          <div className="mx-auto mt-6 max-w-lg relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-12 w-full rounded-xl border pl-12 pr-4 text-sm"
              placeholder="Search help..."
            />
          </div>
        </div>
      </section>

      <div className="container py-16 space-y-16">

        {/* CATEGORIES */}
        <div>
          <h2 className="text-2xl font-bold">Help Categories</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {helpCategories.map((cat, i) => (
              <motion.div
                key={cat.title}
                whileHover={{ scale: 1.03 }}
                onClick={() => navigate(cat.path)}
                className="cursor-pointer rounded-xl border bg-white p-6 shadow"
              >
                <cat.icon className="h-6 w-6 text-blue-600" />
                <h3 className="mt-3 font-semibold">{cat.title}</h3>
                <p className="text-sm text-gray-500">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold ">FAQs</h2>

          <div className="mt-6 space-y-3 max-w-2xl ">
            {faqs.map((faq, i) => (
              <div key={i} className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full justify-between p-5 text-left"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`transition ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-500">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Support;