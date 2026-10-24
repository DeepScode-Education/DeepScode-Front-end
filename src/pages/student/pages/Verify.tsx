import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck, ShieldOff, Award, Loader2 } from "lucide-react";
import { publicCertificateApi, PublicCertificateVerification } from "@/integrations/client";

const VerifyCertificate = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [result, setResult] = useState<PublicCertificateVerification | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certificateId) return;
    (async () => {
      try {
        const res = await publicCertificateApi.verify(certificateId);
        setResult(res.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#0037FF]" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
            <Award className="text-indigo-600" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Certificate Verification</h1>
            <p className="text-sm text-gray-500">deepScode Education</p>
          </div>
        </div>

        {notFound || !result ? (
          <div className="rounded-2xl bg-red-50 p-5 text-center">
            <ShieldOff className="mx-auto mb-2 text-red-500" size={28} />
            <p className="font-semibold text-red-600">Certificate Not Found</p>
            <p className="mt-1 text-sm text-red-500">
              We couldn't find a certificate with this ID. Please check and try again.
            </p>
          </div>
        ) : (
          <>
            <div className={`mb-6 flex items-center gap-2 rounded-2xl p-4 ${result.valid ? "bg-emerald-50" : "bg-red-50"}`}>
              {result.valid ? <ShieldCheck className="text-emerald-600" size={22} /> : <ShieldOff className="text-red-500" size={22} />}
              <p className={`font-semibold ${result.valid ? "text-emerald-700" : "text-red-600"}`}>
                {result.valid ? "Certificate is Valid" : "Certificate has been Revoked"}
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-400">Certificate ID</p>
                <p className="font-mono font-semibold">{result.certificateId}</p>
              </div>
              <div>
                <p className="text-gray-400">Student Name</p>
                <p className="font-semibold">{result.studentName}</p>
              </div>
              <div>
                <p className="text-gray-400">Course</p>
                <p className="font-semibold">{result.courseName}</p>
              </div>
              <div>
                <p className="text-gray-400">Issue Date</p>
                <p className="font-semibold">
                  {new Date(result.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;