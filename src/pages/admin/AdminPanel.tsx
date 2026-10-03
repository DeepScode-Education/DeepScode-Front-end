import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { BookOpen, Users, Image, Video } from "lucide-react";

interface Stats {
  courses: number;
  lessons: number;
  students: number;
  media: number;
}

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    courses: 0,
    lessons: 0,
    students: 0,
    media: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const [courses, students] = await Promise.all([
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        courses: courses.count ?? 0,
        lessons: 0,
        students: students.count ?? 0,
        media: 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Courses",
      value: stats.courses,
      icon: BookOpen,
      color: "bg-blue-500",
      link: "/admin/courses",
    },
    {
      label: "Total Lessons",
      value: stats.lessons,
      icon: Video,
      color: "bg-purple-500",
      link: "/admin/courses",
    },
    {
      label: "Total Students",
      value: stats.students,
      icon: Users,
      color: "bg-green-500",
      link: "/admin/students",
    },
    {
      label: "Media Files",
      value: stats.media,
      icon: Image,
      color: "bg-orange-500",
      link: "/admin/media",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6">
        <div className="mb-4 lg:hidden">
          <button
            className="px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white"
            onClick={() => setSidebarOpen(true)}
          >
            Open Menu
          </button>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here's what's happening.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.link)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div
                className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-4`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-sm text-gray-500 mt-1">{card.label}</div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Add Course", path: "/admin/courses", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { label: "Upload Media", path: "/admin/media", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
              { label: "View Students", path: "/admin/students", color: "bg-green-50 text-green-700 hover:bg-green-100" },
              { label: "Edit Pages", path: "/admin/pages", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
