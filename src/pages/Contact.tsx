import React from 'react'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Mail,
  MessageCircle,
  Phone,
  Search,
  MapPin,
  Loader2,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// If your project already has an auth/user context (e.g. useAuth() from
// "@/context/AuthContext"), you can prefill fields for logged-in users by
// uncommenting the two lines below and wiring `authUser` into the
// initial state of fullName / email / phone / studentId further down.
// This component works standalone (guest submissions) either way.
//
// import { useAuth } from "@/context/AuthContext";
// const { user: authUser } = useAuth();

type Props = {}

const ISSUE_TYPES = ["Payment", "Course", "Account", "Technical", "Live Class", "Other"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Matches backend rule: 10 digits, starting 6-9 (Indian mobile numbers)
const PHONE_REGEX = /^[6-9]\d{9}$/;

type FieldErrors = Partial<{
  issueType: string;
  subject: string;
  description: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
}>;

const Contact = (props: Props) => {

  const [issueType, setIssueType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const resetForm = () => {
    setIssueType("");
    setSubject("");
    setDescription("");
    setFullName("");
    setEmail("");
    setPhone("");
    setStudentId("");
  };

  const validate = (): { valid: boolean; errors: FieldErrors; trimmed: Record<string, string> } => {
    const trimmed = {
      issueType: issueType.trim(),
      subject: subject.trim(),
      description: description.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      studentId: studentId.trim(),
    };

    const errors: FieldErrors = {};

    if (!trimmed.issueType) errors.issueType = "Please select an issue type";
    if (!trimmed.subject) errors.subject = "Subject is required";
    if (!trimmed.description) errors.description = "Description is required";
    if (!trimmed.fullName) errors.fullName = "Full name is required";

    if (!trimmed.email) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(trimmed.email)) {
      errors.email = "Enter a valid email address";
    }

   if (!trimmed.phone) {
  errors.phone = "Phone number is required";
} else if (!PHONE_REGEX.test(trimmed.phone)) {
  errors.phone = "Enter a valid 10-digit mobile number";
}

    return { valid: Object.keys(errors).length === 0, errors, trimmed };
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    const { valid, errors, trimmed } = validate();
    setFieldErrors(errors);

    if (!valid) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/support-tickets`,
        {
          issueType: trimmed.issueType,
          subject: trimmed.subject,
          description: trimmed.description,
          fullName: trimmed.fullName,
          email: trimmed.email,
          phone: trimmed.phone,
          studentId: trimmed.studentId,
        },
        { withCredentials: true }
      );

      const body = response.data;

      if (!body?.success) {
        // Defensive: backend returned 2xx but success:false
        toast.error(body?.message || "Could not submit ticket. Please try again.");
        return;
      }

      const returnedTicketNumber = body?.data?.ticketNumber || "";

      setTicketNumber(returnedTicketNumber);
      setSubmitSuccess(true);
      setFieldErrors({});
      resetForm();

      toast.success(body.message || "Support ticket submitted successfully");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;

        // Field-level validation errors from express-validator
        if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
          const nextFieldErrors: FieldErrors = {};
          responseData.errors.forEach((fieldError: { field: string; message: string }) => {
            if (fieldError?.field) {
              (nextFieldErrors as Record<string, string>)[fieldError.field] = fieldError.message;
            }
          });
          setFieldErrors(nextFieldErrors);
        }

        const message =
          responseData?.message ||
          (err.request && !err.response
            ? "Could not reach the server. Please check your connection and try again."
            : "Something went wrong. Please try again.");

        toast.error(message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      // Do not reset the form on failure — user shouldn't lose their input.
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* CONTACT */}
     
<div>
  <h2 className="text-2xl font-bold mt-16 text-center">Contact</h2>

  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-4 md:px-8 lg:px-16">
    
    {/* WhatsApp Chat Support */}
    <div className="border rounded-xl p-6 text-center">
      <MessageCircle className="mx-auto h-6 w-6 text-blue-600" />
      <h3 className="mt-2 font-semibold">Chat Support</h3>
      <a
        href="https://wa.me/918700460998"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="sm" className="mt-3">
          Open
        </Button>
      </a>
    </div>

    {/* Email */}
    <div className="border rounded-xl p-6 text-center">
      <Mail className="mx-auto h-6 w-6 text-blue-600" />
      <h3 className="mt-2 font-semibold">Email</h3>
      <p className="text-sm text-gray-500 mt-1">info@slate-academy.com</p>
      <a href="mailto:info@slate-academy.com">
        <Button variant="outline" size="sm" className="mt-3">
          Send Mail
        </Button>
      </a>
    </div>

    {/* Phone — mobile pe call, desktop pe number show */}
    <div className="border rounded-xl p-6 text-center">
      <Phone className="mx-auto h-6 w-6 text-blue-600" />
      <h3 className="mt-2 font-semibold">Phone</h3>
      <p className="text-sm text-gray-500 mt-1">+91 8700460998</p>

      {/* Mobile: direct call link */}
      <a href="tel:+918700460998" className="block sm:hidden mt-3">
        <Button variant="outline" size="sm">
          Call Now
        </Button>
      </a>

      {/* Desktop: number copy hint */}
      <p className="hidden sm:block text-xs text-gray-400 mt-3">
        📞 Call us at <span className="font-medium text-gray-600 select-all">+91 8700460998</span>
      </p>
    </div>

{/* Address */}
<div className="border rounded-xl p-6 text-center">
  <MapPin className="mx-auto h-6 w-6 text-blue-600" />

  <h3 className="mt-2 font-semibold">Address</h3>

  <p className="text-sm text-gray-500 mt-2 leading-6">
    deepScode Education, Fourth Floor, B-104,
    <br />
    behind Triveni Complex,
    <br />
    Panchsheel Vihar, Sheikh Sarai Village,
    <br />
    Malviya Nagar, New Delhi,
    <br />
    Delhi 110017
  </p>

  <a
    href="https://www.google.com/maps/search/?api=1&query=Slate+Academy,+Fourth+Floor,+B-104,+behind+Triveni+Complex,+Panchsheel+Vihar,+Sheikh+Sarai+Village,+Malviya+Nagar,+New+Delhi,+Delhi+110017"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Button variant="outline" size="sm" className="mt-3">
      Open in Maps
    </Button>
  </a>
</div>
  </div>
</div>

        {/* SUPPORT TICKET FORM */}
        <div className="mt-16 mb-16">
          <h2 className="text-2xl font-bold text-center">Submit a Support Ticket</h2>
          <p className="text-sm text-gray-500 text-center mt-2">
            We'll get back to you by email. No account needed.
          </p>

          <div className="mt-6 max-w-lg mx-auto border rounded-xl p-6 bg-white">

            {submitSuccess ? (
              <div className="flex flex-col items-center text-center gap-3 py-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <p className="font-semibold text-lg text-gray-900">
                  Support ticket submitted successfully!
                </p>
                <p className="text-sm text-gray-600">
                  Ticket Number:{" "}
                  <span className="font-mono font-semibold text-gray-900">
                    {ticketNumber}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  You will receive a confirmation email shortly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSubmitSuccess(false)}
                >
                  Submit another ticket
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4" noValidate>

                {/* Issue Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className={`w-full border rounded-lg p-2 ${
                      fieldErrors.issueType ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select an issue type</option>
                    {ISSUE_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.issueType && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.issueType}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your issue"
                    className={`w-full border rounded-lg p-2 ${
                      fieldErrors.subject ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.subject && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.subject}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your issue in detail"
                    className={`w-full border rounded-lg p-2 ${
                      fieldErrors.description ? "border-red-500" : ""
                    }`}
                    rows={4}
                  />
                  {fieldErrors.description && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.description}</p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className={`w-full border rounded-lg p-2 ${
                      fieldErrors.fullName ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full border rounded-lg p-2 ${
                      fieldErrors.email ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    required
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="1234567890"
                    className={`w-full border rounded-lg p-2 ${
                      fieldErrors.phone ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Student ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="If you're an enrolled student"
                    className={`w-full border rounded-lg p-2 ${
                      fieldErrors.studentId ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.studentId && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.studentId}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full text-white flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

    </div>
  )
}

export default Contact;