import {
  LifeBuoy,
  MessageCircle,
  Phone,
  Mail,
  type LucideIcon,
} from "lucide-react";

export interface SupportCardItem {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  href: string;
  color: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export const supportCards: SupportCardItem[] = [
  {
    id: 1,
    title: "Raise Ticket",
    description:
      "Need help with your course, payments, or technical issues? Create a support ticket and our team will get back to you as soon as possible.",
    icon: LifeBuoy,
    buttonText: "Raise Ticket",
    href: "/support",
    color: "#2563EB",
  },
  {
    id: 2,
    title: "WhatsApp Support",
    description:
      "Chat directly with our support team on WhatsApp for quick assistance during support hours.",
    icon: MessageCircle,
    buttonText: "Chat Now",
    href: "https://wa.me/918700460998",
    color: "#22C55E",
  },
  {
    id: 3,
    title: "Call Support",
    description:
      "Speak with our student support executives for immediate help with admissions or technical concerns.",
    icon: Phone,
    buttonText: "Call Now",
    href: "tel:+918700460998",
    color: "#F59E0B",
  },
  {
    id: 4,
    title: "Email Support",
    description:
      "Send us your queries anytime and we'll respond with the appropriate solution.",
    icon: Mail,
    buttonText: "Send Email",
    href: "info@slate-academy.com",
    color: "#EF4444",
  },
];

export const faqData: FAQItem[] = [
  {
    id: 1,
    question: "How do I submit an assignment?",
    answer:
      "Open your enrolled course, navigate to the Assignments section, upload your work, and click Submit before the deadline.",
  },
  {
    id: 2,
    question: "What is the minimum attendance required?",
    answer:
      "Students are expected to maintain at least 75% attendance to remain eligible for assessments and certification.",
  },
  {
    id: 3,
    question: "When will I receive my certificate?",
    answer:
      "Certificates are issued after you successfully complete the course, submit all assignments, and clear the final evaluation.",
  },
  {
    id: 4,
    question: "How do EMI payments work?",
    answer:
      "EMI payments are collected according to your selected installment plan. You can view upcoming dues from the Fees section.",
  },
  {
    id: 5,
    question: "How does the placement process work?",
    answer:
      "Eligible students receive placement opportunities after course completion, portfolio review, mock interviews, and profile verification.",
  },
  {
    id: 6,
    question: "Can I change my batch?",
    answer:
      "Yes. You can request a batch change from the support team, subject to seat availability and approval.",
  },
];