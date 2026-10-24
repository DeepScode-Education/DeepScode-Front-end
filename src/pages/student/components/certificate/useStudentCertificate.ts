import { useCallback, useEffect, useState } from "react";
import { studentCertificateApi, CertificateRecord, CertificateEligibility } from "@/integrations/client";

const toIssueDateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

export const useStudentCertificate = () => {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [certRes, eligRes] = await Promise.all([
        studentCertificateApi.getMine(),
        studentCertificateApi.getEligibility(),
      ]);
      setCertificates(certRes.data || []);
      setEligibility(eligRes.data || null);
    } catch {
      // empty state handled by UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeCertificates = certificates.filter((c) => c.status === "issued");
  const currentCertificate = activeCertificates[0] || null;
  const previousCertificates = activeCertificates.slice(1);

  // `certificate` now carries the real, backend-generated PDF URL so the
  // dashboard can render the actual certificate instead of a mock design.
  const certificate = currentCertificate
    ? {
        certificateId: currentCertificate.certificateId,
        studentName: currentCertificate.studentName,
        courseName:
          typeof currentCertificate.course === "object" && currentCertificate.course
            ? currentCertificate.course.title
            : currentCertificate.courseName,
        issueDate: toIssueDateLabel(currentCertificate.issueDate),
        mentor:
          typeof currentCertificate.mentor === "object" && currentCertificate.mentor
            ? currentCertificate.mentor.fullName
            : currentCertificate.mentorName || "Not assigned",
        certificateIdRaw: currentCertificate._id,
        pdfUrl: currentCertificate.pdfUrl || "",
        status: currentCertificate.status,
      }
    : {
        certificateId: "",
        studentName: "",
        courseName: eligibility?.course?.title || "—",
        issueDate: "",
        mentor: eligibility?.mentor?.fullName || "Not assigned",
        certificateIdRaw: "",
        pdfUrl: "",
        status: undefined as CertificateRecord["status"] | undefined,
      };

  const requirements = eligibility?.requirements || [];
  const progress = eligibility?.overallProgress ?? 0;
  const unlocked = !!currentCertificate;

  const downloadCertificate = async () => {
    if (!currentCertificate) throw new Error("Certificate is locked until all requirements are completed.");
    const res = await studentCertificateApi.getDownloadUrl(currentCertificate._id);
    window.open(res.data.url, "_blank");
  };

  const downloadPreviousCertificate = async (certificateMongoId: string) => {
    const cert = certificates.find((c) => c._id === certificateMongoId);
    if (!cert) return;
    const res = await studentCertificateApi.getDownloadUrl(cert._id);
    window.open(res.data.url, "_blank");
  };

  const copyVerificationLink = async () => {
    if (!currentCertificate) return;
    await navigator.clipboard.writeText(currentCertificate.verificationUrl);
  };

  const shareWhatsApp = () => {
    if (!currentCertificate) return;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`Verify my certificate: ${currentCertificate.verificationUrl}`)}`,
      "_blank"
    );
  };

  const shareCertificate = async () => {
    if (!currentCertificate || !navigator.share) return;
    try {
      await navigator.share({
        title: "deepScode Education Certificate",
        text: "Check out my certificate.",
        url: currentCertificate.verificationUrl,
      });
    } catch {
      //
    }
  };

  const openLinkedIn = () => window.open("https://www.linkedin.com/profile/add", "_blank");

  return {
    certificate,
    requirements,
    previousCertificates: previousCertificates.map((c) => ({
      id: c._id,
      title: typeof c.course === "object" && c.course ? c.course.title : c.courseName,
      issueDate: new Date(c.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      certificateId: c.certificateId,
      verified: c.status === "issued",
      pdfUrl: c.pdfUrl || "",
    })),
    progress,
    unlocked,
    loading,
    downloadCertificate,
    downloadPreviousCertificate,
    shareCertificate,
    copyVerificationLink,
    shareWhatsApp,
    openLinkedIn,
    refresh: load,
  };
};

export default useStudentCertificate;