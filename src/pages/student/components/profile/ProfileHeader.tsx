import { GraduationCap, ShieldCheck, User as UserIcon } from "lucide-react";

interface ProfileHeaderProps {
  fullName: string;
  studentId: string | null;
  courseTitle?: string | null;
  mentorName?: string | null;
  batchStatus?: string | null;
}

const ProfileHeader = ({ fullName, studentId, courseTitle, mentorName, batchStatus }: ProfileHeaderProps) => {
  const initials = (fullName || "S")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative bg-[#0037FF] rounded-2xl p-8 text-white overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{fullName || "Student"}</h1>
          <p className="text-blue-100 text-sm mb-3">
            Student ID: <span className="font-semibold">{studentId || "—"}</span>
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-blue-100">
              <GraduationCap className="w-4 h-4" /> {courseTitle || "No course assigned"}
            </span>
            <span className="flex items-center gap-1.5 text-blue-100">
              <UserIcon className="w-4 h-4" /> {mentorName || "No mentor assigned"}
            </span>
            {batchStatus && (
              <span className="flex items-center gap-1.5 text-emerald-200">
                <ShieldCheck className="w-4 h-4" /> {batchStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;