import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Mail,
  FileText,
  Lock,
  Users,
  Cookie,
  Globe2,
  AlertCircle,
} from "lucide-react";

const sections = [
  { id: "definitions", label: "1. Definitions" },
  { id: "information-we-collect", label: "2. Information We Collect" },
  { id: "legal-basis", label: "3. Legal Basis for Processing" },
  { id: "how-we-use", label: "4. How We Use Your Information" },
  { id: "cookies", label: "5. Cookies & Tracking" },
  { id: "sharing", label: "6. How We Share Your Information" },
  { id: "storage", label: "7. Data Storage and Transfers" },
  { id: "security", label: "8. Data Security" },
  { id: "your-rights", label: "9. Your Rights" },
  { id: "retention", label: "10. Data Retention" },
  { id: "children", label: "11. Children's Privacy" },
  { id: "third-party", label: "12. Third-Party Services" },
  { id: "grievance", label: "13. Grievance Officer" },
  { id: "updates", label: "14. Changes to This Policy" },
  { id: "contact", label: "15. Contact Us" },
];

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Privacy Policy – Slate Academy | EdTech Privacy India</title>
        <meta
          name="description"
          content="This Privacy Policy explains how Slate Academy collects, uses, and protects your personal data while using our online learning platform. Compliant with India IT Act, DPDP Act 2023, and global standards."
        />
        <meta
          name="keywords"
          content="EdTech privacy policy India, online course data protection, student data security India, DPDP Act compliance"
        />
        <link rel="canonical" href="https://slate-academy.com/privacy" />
      </Helmet>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-accent/30 to-background">
          <div className="container max-w-5xl py-16 md:py-20">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-foreground">Privacy Policy</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary">
                <Shield className="h-6 w-6 text-[#0037FF]-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                  Privacy Policy – Slate Academy
                </h1>
                <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-3xl">
                  How we collect, use, store, and protect your personal data on
                  our online learning platform.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>
                    <strong className="text-foreground">Effective Date:</strong>{" "}
                    1 January 2026
                  </span>
                  <span className="hidden md:inline">•</span>
                  <span>
                    <strong className="text-foreground">Last Updated:</strong>{" "}
                    18 April 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content + TOC */}
        <section className="container max-w-6xl py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
            {/* Sticky TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <Card className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" /> On this page
                  </p>
                  <nav className="flex flex-col gap-1.5 text-sm">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(s.id);
                          if (el)
                            el.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }}
                        className="text-left text-muted-foreground hover:text-[#0037FF] transition-colors py-1"
                      >
                        {s.label}
                      </button>
                    ))}
                  </nav>
                </Card>
              </div>
            </aside>

            {/* Article */}
            <article className="max-w-3xl space-y-10">
              {/* Intro */}
              <div className="prose-block">
                <p className="text-base leading-relaxed text-muted-foreground">
                  At <strong className="text-foreground">Slate Academy</strong>,
                  your privacy matters. We are committed to protecting your
                  personal information and being transparent about how we
                  collect, use, and safeguard your data. This Privacy Policy is
                  designed to comply with the{" "}
                  <strong className="text-foreground">
                    Information Technology Act, 2000
                  </strong>
                  , the{" "}
                  <strong className="text-foreground">SPDI Rules, 2011</strong>,
                  the{" "}
                  <strong className="text-foreground">
                    Digital Personal Data Protection Act, 2023 (DPDP)
                  </strong>
                  , and global best practices including GDPR-style transparency.
                </p>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  By accessing or using our platform, you{" "}
                  <strong className="text-foreground">consent</strong> to the
                  data practices described in this policy. If you do not agree,
                  please discontinue use of the platform.
                </p>
              </div>

              <Separator />

              {/* 1. Definitions */}
              <section id="definitions">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  1. Definitions
                </h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Personal Data:</strong>{" "}
                    Any information that identifies you, directly or indirectly.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Sensitive Personal Data:
                    </strong>{" "}
                    Includes financial information, passwords, biometric data,
                    and health information.
                  </li>
                  <li>
                    <strong className="text-foreground">User:</strong> Any
                    individual accessing or using Slate Academy's services.
                  </li>
                  <li>
                    <strong className="text-foreground">Platform:</strong> The
                    Slate Academy website, mobile experience, and related
                    services.
                  </li>
                  <li>
                    <strong className="text-foreground">Services:</strong>{" "}
                    Online courses, learning tools, certificates, and support
                    offered by Slate Academy.
                  </li>
                </ul>
              </section>

              {/* 2. Information We Collect */}
              <section id="information-we-collect">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  2. Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Personal Information
                    </h3>
                    <p className="text-muted-foreground">
                      Name, email address, and phone number.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Account Information
                    </h3>
                    <p className="text-muted-foreground">
                      Login credentials (encrypted) and profile data.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Payment Information
                    </h3>
                    <p className="text-muted-foreground">
                      UPI/card details processed by secure third-party gateways
                      such as Razorpay or Stripe.{" "}
                      <strong className="text-foreground">
                        We do not store full payment details on our servers.
                      </strong>
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Learning Data
                    </h3>
                    <p className="text-muted-foreground">
                      Courses enrolled, progress, quiz scores, and performance
                      metrics.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Device & Technical Data
                    </h3>
                    <p className="text-muted-foreground">
                      IP address, browser type, operating system, and device
                      information.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Cookies & Tracking Data
                    </h3>
                    <p className="text-muted-foreground">
                      Session tracking and analytics behavior to improve
                      experience.
                    </p>
                  </div>
                </div>
              </section>

              {/* 3. Legal Basis */}
              <section id="legal-basis">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  3. Legal Basis for Processing
                </h2>
                <p className="text-muted-foreground mb-3">
                  In accordance with the DPDP Act, 2023, we process your data
                  based on:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                  <li>
                    <strong className="text-foreground">Your consent</strong>{" "}
                    when you sign up or interact with our services.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Contractual necessity
                    </strong>{" "}
                    to deliver the courses you enroll in.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Legal obligations
                    </strong>{" "}
                    under applicable Indian laws.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Legitimate interests
                    </strong>{" "}
                    such as improving the platform and preventing fraud.
                  </li>
                </ul>
              </section>

              {/* 4. How We Use */}
              <section id="how-we-use">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  4. How We Use Your Information
                </h2>
                <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                  <li>
                    To provide courses, certificates, and related services.
                  </li>
                  <li>
                    To personalize your learning experience and recommendations.
                  </li>
                  <li>
                    To process payments securely through trusted gateways.
                  </li>
                  <li>
                    To send important account, course, and policy updates.
                  </li>
                  <li>
                    To improve platform performance, content, and user
                    experience.
                  </li>
                  <li>
                    To detect, prevent, and address fraud or security issues.
                  </li>
                </ul>
              </section>

              {/* 5. Cookies */}
              <section id="cookies">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-[#0037FF]" /> 5. Cookies and
                  Tracking Technologies
                </h2>
                <p className="text-muted-foreground mb-3">
                  We use cookies and similar technologies for:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                  <li>Session management and login persistence.</li>
                  <li>
                    Analytics tools such as Google Analytics to understand
                    platform usage.
                  </li>
                  <li>Performance optimization.</li>
                </ul>
                <p className="mt-3 text-muted-foreground">
                  You can disable cookies through your browser settings. Please
                  note that some features may not function correctly without
                  them. Third-party tracking tools may also be used in
                  compliance with applicable laws.
                </p>
              </section>

              {/* 6. Sharing */}
              <section id="sharing">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  6. How We Share Your Information
                </h2>
                <p className="text-muted-foreground mb-3">
                  We may share limited data with:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                  <li>
                    <strong className="text-foreground">
                      Payment gateways
                    </strong>{" "}
                    (Razorpay, Stripe, etc.) to process transactions.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Hosting and infrastructure providers
                    </strong>{" "}
                    that power our platform.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Analytics providers
                    </strong>{" "}
                    to measure usage and performance.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Legal authorities
                    </strong>{" "}
                    when required by law or court order.
                  </li>
                </ul>
                <Card className="mt-4 p-4 border-primary/30 bg-[#0037FF]/5">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-[#0037FF]" /> We do not
                    sell your personal data to anyone.
                  </p>
                </Card>
              </section>

              {/* 7. Storage */}
              <section id="storage">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-[#0037FF]" /> 7. Data Storage
                  and Transfers
                </h2>
                <p className="text-muted-foreground">
                  Your data may be stored on secure servers located in India or
                  globally. Where data is transferred across borders, we ensure
                  adequate safeguards in accordance with applicable Indian and
                  international data protection laws.
                </p>
              </section>

              {/* 8. Security */}
              <section id="security">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#0037FF]" /> 8. Data Security
                </h2>
                <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                  <li>
                    Industry-standard encryption (HTTPS/TLS) for data in
                    transit.
                  </li>
                  <li>Secure servers with regular security patches.</li>
                  <li>Restricted internal access on a need-to-know basis.</li>
                  <li>
                    Continuous monitoring for vulnerabilities and threats.
                  </li>
                </ul>
                <p className="mt-3 text-muted-foreground">
                  While we take reasonable precautions, no method of
                  transmission or storage is 100% secure. We encourage strong,
                  unique passwords and safe browsing practices.
                </p>
              </section>

              {/* 9. Your Rights */}
              <section id="your-rights">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0037FF]" /> 9. Your Rights
                </h2>
                <p className="text-muted-foreground mb-3">
                  Under the DPDP Act and applicable laws, you have the right to:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                  <li>
                    <strong className="text-foreground">Access</strong> the
                    personal data we hold about you.
                  </li>
                  <li>
                    <strong className="text-foreground">Correct</strong>{" "}
                    inaccurate or outdated information.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Request deletion
                    </strong>{" "}
                    of your personal data.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Withdraw consent
                    </strong>{" "}
                    at any time.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      File a grievance
                    </strong>{" "}
                    with our Grievance Officer (see Section 13).
                  </li>
                </ul>
              </section>

              {/* 10. Retention */}
              <section id="retention">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  10. Data Retention
                </h2>
                <p className="text-muted-foreground">
                  We retain your data only as long as necessary to provide
                  course access, comply with legal obligations, resolve
                  disputes, and enforce our agreements. You may request deletion
                  of your account and associated data at any time, subject to
                  legal retention requirements.
                </p>
              </section>

              {/* 11. Children */}
              <section id="children">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  11. Children's Privacy
                </h2>
                <p className="text-muted-foreground">
                  Slate Academy is intended for users{" "}
                  <strong className="text-foreground">
                    18 years of age and above
                  </strong>
                  . We do not knowingly collect personal data from minors. If we
                  discover that a minor has provided personal data without
                  verifiable parental consent, we will delete it promptly.
                </p>
              </section>

              {/* 12. Third-party */}
              <section id="third-party">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  12. Third-Party Services
                </h2>
                <p className="text-muted-foreground">
                  Our platform may contain links to third-party websites, tools,
                  or resources. We are not responsible for the privacy practices
                  or content of these external services. We recommend reviewing
                  their privacy policies before sharing any personal
                  information.
                </p>
              </section>

              {/* 13. Grievance Officer */}
              <section id="grievance">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  13. Grievance Officer
                </h2>
                <p className="text-muted-foreground mb-4">
                  In compliance with the Information Technology Act, 2000, and
                  the DPDP Act, 2023, you may contact our Grievance Officer for
                  any concerns regarding your personal data:
                </p>
                <Card className="p-5 bg-accent/30">
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong className="text-foreground">Name:</strong>{" "}
                      <span className="text-muted-foreground">
                        Grievance Officer, Slate Academy
                      </span>
                    </p>
                    <p>
                      <strong className="text-foreground">Email:</strong>{" "}
                      <a
                        href="mailto:grievance@slate-academy.com"
                        className="text-[#0037FF] hover:underline"
                      >
                        grievance@slate-academy.com
                      </a>
                    </p>
                    <p>
                      <strong className="text-foreground">
                        Response Timeline:
                      </strong>{" "}
                      <span className="text-muted-foreground">
                        Within 30 days, as per Indian law.
                      </span>
                    </p>
                  </div>
                </Card>
              </section>

              {/* 14. Updates */}
              <section id="updates">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  14. Changes to This Privacy Policy
                </h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices, services, or legal requirements. The
                  "Last Updated" date at the top of this page reflects the most
                  recent revision. Significant changes will be notified through
                  the platform or by email.
                </p>
              </section>

              {/* 15. Contact */}
              <section id="contact">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#0037FF]" /> 15. Contact Us
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy or how
                  your data is handled, reach out to us:
                </p>
                <Card className="p-5 bg-accent/30">
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong className="text-foreground">Email:</strong>{" "}
                      <a
                        href="mailto:support@slate-academy.com"
                        className="text-[#0037FF] hover:underline"
                      >
                        info@slate-academy.com
                      </a>
                    </p>
                    <p>
                      <strong className="text-foreground">Support:</strong>{" "}
                      <Link
                        to="/support"
                        className="text-[#0037FF] hover:underline"
                      >
                        Visit our Support Page
                      </Link>
                    </p>
                  </div>
                </Card>
              </section>

              <Separator />

              <p className="text-xs text-muted-foreground text-center">
                © {new Date().getFullYear()} Slate Academy. All rights reserved.
                This Privacy Policy is governed by the laws of India.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Privacy;
