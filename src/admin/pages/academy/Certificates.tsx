
import { useEffect, useState } from "react";
import { Plus, Award, ShieldCheck, ShieldOff, Download, ExternalLink } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminCertificateApi, CertificateRecord } from "@/integrations/client";
import IssueCertificateModal from "./IssueCertificateModal";

const Certificates = () => {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      const res = await adminCertificateApi.getAll({ limit: 100 });
      setCertificates(res.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load certificates");
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleIssued = () => {
    setModalOpen(false);
    toast.success("Certificate issued successfully");
    fetchCertificates();
  };

  const handleRevoke = async (cert: CertificateRecord) => {
    if (!confirm(`Revoke certificate ${cert.certificateId}?`)) return;
    try {
      setRevokingId(cert._id);
      await adminCertificateApi.revoke(cert._id, "Revoked by admin");
      toast.success("Certificate revoked");
      fetchCertificates();
    } catch (e: any) {
      toast.error(e.message || "Failed to revoke certificate");
    } finally {
      setRevokingId(null);
    }
  };

  const studentName = (r: CertificateRecord) =>
    typeof r.student === "object" && r.student ? r.student.fullName : r.studentName;
  const courseName = (r: CertificateRecord) =>
    typeof r.course === "object" && r.course ? r.course.title : r.courseName;

  return (
    <AdminLayout
      title="Certificates"
      subtitle="Issue, verify, and manage student certificates."
      actions={
        <Button size="sm" className="text-white" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Issue Certificate
        </Button>
      }
    >
      <DataTable
        rows={certificates}
        columns={[
          {
            key: "id",
            label: "Certificate ID",
            render: (r: CertificateRecord) => (
              <div className="flex items-center gap-2">
                <Award size={14} className="text-[#0037FF]" />
                <span className="font-mono text-xs">{r.certificateId}</span>
              </div>
            ),
          },
          { key: "student", label: "Student", render: (r: CertificateRecord) => <span className="font-medium">{studentName(r)}</span> },
          { key: "course", label: "Course", render: (r: CertificateRecord) => courseName(r) },
          {
            key: "issued",
            label: "Issued",
            render: (r: CertificateRecord) =>
              new Date(r.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          },
          {
            key: "status",
            label: "Status",
            render: (r: CertificateRecord) =>
              r.status === "issued" ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-red-500">
                  <ShieldOff size={12} />
                  Revoked
                </span>
              ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (r: CertificateRecord) => (
              <div className="flex items-center gap-2">
                {r.pdfUrl && (
                  <a href={r.pdfUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">
                      <Download size={14} />
                    </Button>
                  </a>
                )}
                <a href={r.verificationUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    <ExternalLink size={14} />
                  </Button>
                </a>
                {r.status === "issued" && (
                  <Button size="sm" variant="outline" disabled={revokingId === r._id} onClick={() => handleRevoke(r)}>
                    <ShieldOff size={14} className="text-red-500" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      {modalOpen && <IssueCertificateModal onClose={() => setModalOpen(false)} onIssued={handleIssued} />}
    </AdminLayout>
  );
};

export default Certificates;