import { useState } from "react";
import StudentLayout from "../components/StudentLayout";
import useStudentCertificate from "../components/certificate/useStudentCertificate";

import {
  Award,
  Lock,
  Download,
  Share2,
  Copy,
  BadgeCheck,
  Linkedin,
  MessageCircle,
  FileWarning,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const DownloadCertificate = () => {
  const {
    certificate,
    requirements,
    previousCertificates,
    progress,
    unlocked,
    loading: certificateLoading,
    downloadCertificate,
    downloadPreviousCertificate,
    copyVerificationLink,
    shareWhatsApp,
    openLinkedIn,
  } = useStudentCertificate();

  const [loading, setLoading] = useState(false);

  if (certificateLoading) {
    return (
      <StudentLayout
        title="Download Certificate"
        subtitle="Loading..."
      >
        <div className="flex h-64 items-center justify-center text-gray-400">
          Loading certificate data...
        </div>
      </StudentLayout>
    );
  }

  const handleDownload = async () => {
    try {
      setLoading(true);

      await downloadCertificate();

      toast.success("Certificate Downloaded");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout
      title="Download Certificate"
      subtitle="View, download and share your course completion certificates."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* LEFT SIDE */}

        <div className="xl:col-span-2 space-y-6">

          {/* Certificate Card — now renders the actual backend-generated PDF */}

          <div className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">

            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50" />

            <div className="relative p-8">

              <div className="mb-6 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">

                    <Award
                      className="text-indigo-600"
                      size={28}
                    />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold">

                      Course Completion Certificate

                    </h2>

                    <p className="text-sm font-medium text-gray-500">

                      Slate Academy

                    </p>

                  </div>

                </div>

                {!unlocked && (

                  <div className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">

                    Locked

                  </div>

                )}

              </div>

              <div
                className={`relative overflow-hidden rounded-2xl border bg-white transition ${
                  !unlocked ? "blur-[2px]" : ""
                }`}
              >

              {unlocked && certificate.pdfUrl ? (
  // PDF preview isn't reliably embeddable (Cloudinary raw PDFs don't
  // render well inside an iframe), so show a clickable placeholder
  // that opens the certificate in a new tab instead.
  <a
    href={certificate.pdfUrl}
    target="_blank"
    rel="noreferrer"
    className="group relative flex aspect-[297/210] w-full flex-col items-center justify-center gap-3 bg-gray-50 text-center transition hover:bg-gray-100"
  >
    <FileWarning size={40} className="text-gray-300 group-hover:text-indigo-400 transition" />
    <div className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm group-hover:shadow transition">
      Open full size <ExternalLink size={14} />
    </div>
    <p className="max-w-xs text-xs text-gray-400">
      Preview isn't available — click to view or download your certificate PDF.
    </p>
  </a>
) : unlocked && !certificate.pdfUrl ? (
  <div className="flex aspect-[297/210] w-full flex-col items-center justify-center gap-2 bg-gray-50 text-center text-sm text-gray-500">
    <FileWarning size={28} className="text-amber-500" />
    <p>Certificate PDF isn't available yet. Please try refreshing shortly.</p>
  </div>
) : (
  <div className="flex aspect-[297/210] w-full items-center justify-center bg-gray-50 text-sm text-gray-400">
    Your certificate preview will appear here once unlocked.
  </div>
)}

              </div>

              {unlocked && certificate.pdfUrl && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Certificate ID: <span className="font-mono font-medium text-gray-700">{certificate.certificateId}</span>
                  </span>
                  {/* <a
                    href={certificate.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
                  >
                    Open full size <ExternalLink size={14} />
                  </a> */}
                </div>
              )}

              {!unlocked && (

                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="rounded-3xl bg-white/95 px-8 py-6 shadow-xl">

                    <div className="flex flex-col items-center">

                      <Lock
                        size={42}
                        className="text-red-500"
                      />

                      <h3 className="mt-3 text-xl font-bold">

                        Certificate Locked

                      </h3>

                      <p className="mt-2 text-center text-sm text-gray-500">

                        Complete all required tasks to unlock your certificate.

                      </p>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>
	           {/* Unlock Requirements */}

        <div className="rounded-3xl border bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <Award className="text-indigo-600" size={22} />

            <div>

              <h3 className="font-bold text-lg">
                Unlock Requirements
              </h3>

              <p className="text-sm text-gray-500">
                Complete every requirement below.
              </p>

            </div>

          </div>

          <div className="space-y-5">

            {requirements.map((item) => (

              <div key={item.id}>

                <div className="mb-2 flex justify-between">

                  <span className="text-sm font-medium">

                    {item.title}

                  </span>

                  <span className="text-sm font-semibold text-indigo-600">

                    {item.progress}%

                  </span>

                </div>

                <Progress value={item.progress} />

              </div>

            ))}

          </div>

        </div>

        {/* Previous Certificates */}

        <div className="rounded-3xl border bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold">

                Previously Earned Certificates

              </h2>

              <p className="text-sm text-gray-500">

                Your completed certifications.

              </p>

            </div>

          </div>

          <div className="space-y-4">

            {previousCertificates.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">
                You don't have any other certificates yet.
              </p>
            )}

            {previousCertificates.map((item) => (

              <div
                key={item.id}
                className="rounded-2xl border p-5 transition hover:border-indigo-300"
              >

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                    <h3 className="font-semibold text-base">

                      {item.title}

                    </h3>

                    <p className="mt-1 text-sm text-gray-500">

                      Issued : {item.issueDate}

                    </p>

                    <p className="text-sm text-gray-500">

                      ID : {item.certificateId}

                    </p>

                  </div>

                  <div className="flex flex-wrap items-center gap-3">

                    {item.verified && (

                      <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-600">

                        <BadgeCheck size={16} />

                        Verified

                      </div>

                    )}

                    <Button
                      variant="outline"
                      disabled={!item.pdfUrl}
                      onClick={() =>
                        downloadPreviousCertificate(
                          item.id
                        ).catch((e: any) => toast.error(e.message || "Failed to download certificate"))
                      }
                    >

                      <Download
                        size={16}
                        className="mr-2"
                      />

                      Download

                    </Button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="space-y-6">

        <div className="rounded-3xl border bg-white p-6 shadow-sm">

          <h3 className="text-lg font-bold">

            Certificate Status

          </h3>

          <p className="mt-1 text-sm text-gray-500">

            Overall completion progress

          </p>

          <div className="mt-6">

            <Progress value={progress} />

            <div className="mt-2 text-right text-lg font-bold text-indigo-600">

              {progress}%

            </div>

          </div>

          <Button
            className="mt-6 w-full text-white"
            disabled={!unlocked || loading || !certificate.pdfUrl}
            onClick={handleDownload}
          >

            <Download
              size={18}
              className="mr-2"
            />

            {loading
              ? "Downloading..."
              : unlocked
              ? "Download Certificate"
              : "Certificate Locked"}

          </Button>

        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">

          <h3 className="text-lg font-bold">

            Share Achievement

          </h3>

          <p className="mt-1 text-sm text-gray-500">

            Share your success with others.

          </p>

          <div className="mt-6 space-y-3">

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={openLinkedIn}
            >

              <Linkedin
                size={18}
                className="mr-2"
              />

              Add To LinkedIn

            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                copyVerificationLink()
                  .then(() => toast.success("Verification link copied"))
                  .catch(() => toast.error("Failed to copy link"))
              }
            >

              <Copy
                size={18}
                className="mr-2"
              />

              Copy Verification Link

            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={shareWhatsApp}
            >

              <MessageCircle
                size={18}
                className="mr-2"
              />

              Share On WhatsApp

            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
            >

              <Share2
                size={18}
                className="mr-2"
              />

              Share Certificate

            </Button>

          </div>

        </div>

      </div>

    </div>

    </StudentLayout>
  );
};

export default DownloadCertificate;