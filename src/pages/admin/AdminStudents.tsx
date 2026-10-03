import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
    Search,
    Users,
    BookOpen,
    TrendingUp,
    Mail,
    Calendar,
    ChevronDown,
    ChevronUp,
    Loader2,
    X,
    Shield,
    ShieldOff,
    Eye,
} from "lucide-react";

interface Student {
    id: string;
    user_id: string;
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string;
    enrollments?: Enrollment[];
}

interface Enrollment {
    id: string;
    course_id: string;
    progress: number;
    completed_modules: number;
    enrolled_at: string;
    course_title?: string;
    course_category?: string;
}

interface Stats {
    totalStudents: number;
    totalEnrollments: number;
    avgProgress: number;
    activeThisWeek: number;
}

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const getInitials = (name: string | null, email: string | null): string => {
    if (name) return name.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "??";
};

const avatarColor = (str: string) => {
    const colors = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-green-500",
        "bg-orange-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-teal-500",
        "bg-red-500",
    ];
    const index =
        str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        colors.length;
    return colors[index];
};

// ── Student Row ───────────────────────────────────────────────
const StudentRow = ({
    student,
    onViewDetails,
    onToggleRole,
}: {
    student: Student;
    onViewDetails: (student: Student) => void;
    onToggleRole: (student: Student) => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const avgProgress =
        student.enrollments && student.enrollments.length > 0
            ? Math.round(
                student.enrollments.reduce((sum, e) => sum + e.progress, 0) /
                student.enrollments.length
            )
            : 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Main Row */}
            <div className="flex items-center gap-4 p-4">
                {/* Avatar */}
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${avatarColor(
                        student.user_id
                    )}`}
                >
                    {student.avatar_url ? (
                        <img
                            src={student.avatar_url}
                            alt={student.display_name || ""}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        getInitials(student.display_name, student.email)
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm truncate">
                            {student.display_name || "Unnamed User"}
                        </p>
                        {student.role === "admin" && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                Admin
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{student.email}</p>
                </div>

                {/* Enrollments */}
                <div className="hidden sm:flex flex-col items-center px-4">
                    <span className="text-lg font-bold text-gray-900">
                        {student.enrollments?.length || 0}
                    </span>
                    <span className="text-xs text-gray-400">courses</span>
                </div>

                {/* Avg Progress */}
                <div className="hidden md:flex flex-col items-center px-4 min-w-[100px]">
                    <div className="flex items-center gap-2 w-full">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${avgProgress}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{avgProgress}%</span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">avg progress</span>
                </div>

                {/* Joined */}
                <div className="hidden lg:block text-xs text-gray-400 px-4">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {formatDate(student.created_at)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => onViewDetails(student)}
                        className="p-1.5 text-gray-400 hover:text-[#0037FF] hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onToggleRole(student)}
                        className={`p-1.5 rounded-lg transition-colors ${student.role === "admin"
                                ? "text-purple-500 hover:bg-purple-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                        title={
                            student.role === "admin" ? "Remove Admin" : "Make Admin"
                        }
                    >
                        {student.role === "admin" ? (
                            <ShieldOff className="w-4 h-4" />
                        ) : (
                            <Shield className="w-4 h-4" />
                        )}
                    </button>
                    {(student.enrollments?.length || 0) > 0 && (
                        <button
                            onClick={() => setExpanded((p) => !p)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {expanded ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded Enrollments */}
            {expanded && student.enrollments && student.enrollments.length > 0 && (
                <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Enrolled Courses
                    </p>
                    {student.enrollments.map((enrollment) => (
                        <div
                            key={enrollment.id}
                            className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                    {enrollment.course_title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400">
                                        {enrollment.course_category}
                                    </span>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-xs text-gray-400">
                                        Enrolled {formatDate(enrollment.enrolled_at)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${enrollment.progress === 100
                                                ? "bg-green-500"
                                                : "bg-blue-500"
                                            }`}
                                        style={{ width: `${enrollment.progress}%` }}
                                    />
                                </div>
                                <span
                                    className={`text-xs font-medium w-8 ${enrollment.progress === 100
                                            ? "text-green-600"
                                            : "text-gray-600"
                                        }`}
                                >
                                    {enrollment.progress}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────
const AdminStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">(
        "all"
    );
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [stats, setStats] = useState<Stats>({
        totalStudents: 0,
        totalEnrollments: 0,
        avgProgress: 0,
        activeThisWeek: 0,
    });
    const [confirmRole, setConfirmRole] = useState<Student | null>(null);
    const [togglingRole, setTogglingRole] = useState(false);

    // ── Fetch Students ───────────────────────────────────────────
    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch all profiles
            const { data: profiles, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (profileError) throw profileError;

            // Fetch all enrollments with course info
            const { data: enrollments, error: enrollError } = await supabase
                .from("enrollments")
                .select(`
          id,
          user_id,
          course_id,
          progress,
          completed_modules,
          enrolled_at,
          courses (
            title,
            category
          )
        `);

            if (enrollError) throw enrollError;

            // Map enrollments to students
            const studentsWithEnrollments: Student[] = (profiles || []).map(
                (profile) => {
                    const userEnrollments = (enrollments || [])
                        .filter((e: any) => e.user_id === profile.user_id)
                        .map((e: any) => ({
                            id: e.id,
                            course_id: e.course_id,
                            progress: e.progress || 0,
                            completed_modules: e.completed_modules || 0,
                            enrolled_at: e.enrolled_at,
                            course_title: e.courses?.title || "Unknown Course",
                            course_category: e.courses?.category || "",
                        }));

                    return {
                        ...profile,
                        enrollments: userEnrollments,
                    };
                }
            );

            setStudents(studentsWithEnrollments);

            // Calculate stats
            const totalEnrollments = enrollments?.length || 0;
            const allProgress = enrollments?.map((e: any) => e.progress || 0) || [];
            const avgProgress =
                allProgress.length > 0
                    ? Math.round(
                        allProgress.reduce((a: number, b: number) => a + b, 0) /
                        allProgress.length
                    )
                    : 0;

            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const activeThisWeek = (profiles || []).filter(
                (p) => new Date(p.created_at) > oneWeekAgo
            ).length;

            setStats({
                totalStudents: profiles?.length || 0,
                totalEnrollments,
                avgProgress,
                activeThisWeek,
            });
        } catch (err) {
            console.error("Fetch students error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // ── Toggle Role ──────────────────────────────────────────────
    const handleToggleRole = async (student: Student) => {
        setTogglingRole(true);
        const newRole = student.role === "admin" ? "user" : "admin";
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole })
                .eq("user_id", student.user_id);

            if (error) throw error;

            setStudents((prev) =>
                prev.map((s) =>
                    s.user_id === student.user_id ? { ...s, role: newRole } : s
                )
            );

            if (selectedStudent?.user_id === student.user_id) {
                setSelectedStudent((p) => (p ? { ...p, role: newRole } : null));
            }
        } catch (err: any) {
            console.error("Role toggle error:", err);
            alert("Failed to update role: " + err.message);
        } finally {
            setTogglingRole(false);
            setConfirmRole(null);
        }
    };

    // ── Filter ───────────────────────────────────────────────────
    const filtered = students.filter((s) => {
        const matchesSearch =
            (s.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (s.email || "").toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || s.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage all registered users
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        {
                            icon: Users,
                            label: "Total Students",
                            value: stats.totalStudents,
                            color: "bg-blue-50 text-[#0037FF]",
                        },
                        {
                            icon: BookOpen,
                            label: "Total Enrollments",
                            value: stats.totalEnrollments,
                            color: "bg-purple-50 text-purple-600",
                        },
                        {
                            icon: TrendingUp,
                            label: "Avg Progress",
                            value: `${stats.avgProgress}%`,
                            color: "bg-green-50 text-green-600",
                        },
                        {
                            icon: Calendar,
                            label: "New This Week",
                            value: stats.activeThisWeek,
                            color: "bg-orange-50 text-orange-600",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                        >
                            <div
                                className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center mb-3`}
                            >
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {stat.value}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                        {(["all", "user", "admin"] as const).map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${roleFilter === role
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-500 hover:bg-gray-100"
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Students List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No students found</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {search ? `No results for "${search}"` : "No users registered yet"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-400">
                            Showing {filtered.length} of {students.length} students
                        </p>
                        {filtered.map((student) => (
                            <StudentRow
                                key={student.user_id}
                                student={student}
                                onViewDetails={setSelectedStudent}
                                onToggleRole={setConfirmRole}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* ── Student Detail Modal ── */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
                    <div className="bg-white h-full w-full max-w-md shadow-2xl overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                Student Details
                            </h2>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Profile */}
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold ${avatarColor(
                                        selectedStudent.user_id
                                    )}`}
                                >
                                    {selectedStudent.avatar_url ? (
                                        <img
                                            src={selectedStudent.avatar_url}
                                            alt=""
                                            className="w-full h-full rounded-2xl object-cover"
                                        />
                                    ) : (
                                        getInitials(
                                            selectedStudent.display_name,
                                            selectedStudent.email
                                        )
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {selectedStudent.display_name || "Unnamed User"}
                                    </h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        {selectedStudent.email}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedStudent.role === "admin"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {selectedStudent.role}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Joined {formatDate(selectedStudent.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    {
                                        label: "Enrolled",
                                        value: selectedStudent.enrollments?.length || 0,
                                    },
                                    {
                                        label: "Completed",
                                        value:
                                            selectedStudent.enrollments?.filter(
                                                (e) => e.progress === 100
                                            ).length || 0,
                                    },
                                    {
                                        label: "Avg Progress",
                                        value:
                                            selectedStudent.enrollments &&
                                                selectedStudent.enrollments.length > 0
                                                ? `${Math.round(
                                                    selectedStudent.enrollments.reduce(
                                                        (s, e) => s + e.progress,
                                                        0
                                                    ) / selectedStudent.enrollments.length
                                                )}%`
                                                : "0%",
                                    },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="bg-gray-50 rounded-xl p-3 text-center"
                                    >
                                        <div className="text-xl font-bold text-gray-900">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Enrolled Courses */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                    Enrolled Courses
                                </h4>
                                {selectedStudent.enrollments &&
                                    selectedStudent.enrollments.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedStudent.enrollments.map((enrollment) => (
                                            <div
                                                key={enrollment.id}
                                                className="p-3 bg-gray-50 rounded-xl"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {enrollment.course_title}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {enrollment.course_category} · Enrolled{" "}
                                                            {formatDate(enrollment.enrolled_at)}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`text-xs font-bold ${enrollment.progress === 100
                                                                ? "text-green-600"
                                                                : "text-[#0037FF]"
                                                            }`}
                                                    >
                                                        {enrollment.progress}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${enrollment.progress === 100
                                                                ? "bg-green-500"
                                                                : "bg-blue-500"
                                                            }`}
                                                        style={{ width: `${enrollment.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                                        <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400">
                                            Not enrolled in any course
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Role Management */}
                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                    Role Management
                                </h4>
                                <button
                                    onClick={() => setConfirmRole(selectedStudent)}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${selectedStudent.role === "admin"
                                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                                            : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                                        }`}
                                >
                                    {selectedStudent.role === "admin" ? (
                                        <>
                                            <ShieldOff className="w-4 h-4" />
                                            Remove Admin Access
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4" />
                                            Grant Admin Access
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Role Confirm Modal ── */}
            {confirmRole && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmRole.role === "admin" ? "bg-red-100" : "bg-purple-100"
                                }`}
                        >
                            {confirmRole.role === "admin" ? (
                                <ShieldOff className="w-6 h-6 text-red-500" />
                            ) : (
                                <Shield className="w-6 h-6 text-purple-500" />
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
                            {confirmRole.role === "admin"
                                ? "Remove Admin Access?"
                                : "Grant Admin Access?"}
                        </h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            {confirmRole.role === "admin"
                                ? `${confirmRole.display_name || confirmRole.email} will lose all admin privileges.`
                                : `${confirmRole.display_name || confirmRole.email} will gain full admin access to the panel.`}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmRole(null)}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleToggleRole(confirmRole)}
                                disabled={togglingRole}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${confirmRole.role === "admin"
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-purple-600 hover:bg-purple-700"
                                    }`}
                            >
                                {togglingRole && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudents;
