import { useNavigate } from "react-router-dom";

import StudentLayout from "../components/StudentLayout";

import useAssignments from "../components/assisgnment/useStudentAssignments";

import { Upload, Eye, CalendarDays, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

const Assignments = () => {
  const navigate = useNavigate();

  const { projects } = useAssignments();

  const statusStyle = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";

      case "Under Review":
        return "bg-yellow-100 text-yellow-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <StudentLayout
      title="Assignments"
      subtitle="Upload and manage your project submissions."
    >
      {/* Header */}

      <div
        className="
      mb-5
      flex
      flex-col
      gap-3
      sm:flex-row
      sm:items-center
      sm:justify-between
      "
      >
        <div>
          <h2
            className="
          text-base
          font-semibold
          "
          >
            Your Projects
          </h2>

          <p
            className="
          text-xs
          text-gray-500
          "
          >
            Track your submitted assignments.
          </p>
        </div>

        <Button
          size="sm"

          onClick={() => navigate("/student/upload-assignment")}

          className="
          h-9
          bg-[#0037FF]
          text-xs
          text-white
          hover:bg-[#002ed6]
          "
        >
          <Upload size={14} className="mr-2" />
          Upload Assignment
        </Button>
      </div>

      {/* Cards */}

      <div
        className="
      grid
      grid-cols-2
      gap-3
      lg:grid-cols-3
      "
      >
        {projects.map((project) => (
          <div
            key={project._id}

            className="
            overflow-hidden
            rounded-lg
            border
            bg-white
            transition-shadow
            hover:shadow-sm
            "
          >
            {/* Image */}

            <div
              className="
              h-48
              w-full
              overflow-hidden
              bg-gray-100
              "
            >
              <img
                src={project.thumbnail}

                alt={project.title}

                className="
                h-full
                w-full
                object-cover
                "
              />
            </div>

            <div className="p-3">
              <div
                className="
              flex
              items-start
              justify-between
              gap-2
              "
              >
                <div className="min-w-0">
                  <h3
                    className="
                    truncate
                    text-sm
                    font-semibold
                    "
                  >
                    {project.title}
                  </h3>

                  <p
                    className="
                  mt-0.5
                  text-xs
                  text-gray-500
                  "
                  >
                    {project.category}
                  </p>
                </div>

                <span
                  className={`
                  shrink-0
                  rounded-full
                  px-2
                  py-0.5
                  text-[10px]
                  font-semibold
                  ${statusStyle(project.status)}
                  `}
                >
                  {project.status}
                </span>
              </div>

              <p
                className="
                mt-2
                line-clamp-2
                text-xs
                leading-4
                text-gray-600
                "
              >
                {project.description}
              </p>

              <div
                className="
              mt-3
              hidden
              grid-cols-2
              gap-2
              sm:grid
              "
              >
                <div>
                  <p
                    className="
                  text-[10px]
                  text-gray-400
                  "
                  >
                    Submitted
                  </p>

                  <div
                    className="
                  mt-0.5
                  flex
                  items-center
                  gap-1
                  text-xs
                  font-medium
                  "
                  >
                    <CalendarDays size={11} />

                    {project.submittedDate}
                  </div>
                </div>

                <div>
                  <p
                    className="
                  text-[10px]
                  text-gray-400
                  "
                  >
                    Grade
                  </p>

                  <p
                    className="
                  mt-0.5
                  text-xs
                  font-medium
                  "
                  >
                    {project.grade}
                  </p>
                </div>
              </div>

              <div
                className="
              mt-3
              hidden
              rounded-md
              bg-gray-50
              p-2
              sm:block
              "
              >
                <p
                  className="
                text-[10px]
                text-gray-400
                "
                >
                  Feedback
                </p>

                <p
                  className="
                mt-0.5
                line-clamp-2
                text-xs
                text-gray-700
                "
                >
                  {project.feedback}
                </p>
              </div>

              <Button
                variant="outline"

                size="sm"

                className="
                mt-3
                h-8
                w-full
                text-xs
                "

                onClick={() => navigate(`/student/assignment/${project._id}`)}
              >
                <Eye size={13} className="mr-1.5" />
                View Project
              </Button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div
            className="
              col-span-full
              flex
              h-48
              flex-col
              items-center
              justify-center
              rounded-lg
              border
              border-dashed
              "
          >
            <FileText size={28} className="text-gray-400" />

            <p
              className="
              mt-2
              text-xs
              text-gray-500
              "
            >
              No projects uploaded yet.
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default Assignments;