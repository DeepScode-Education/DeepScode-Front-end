import { useParams, useNavigate } from "react-router-dom";

import StudentLayout from "../components/StudentLayout";

import useAssignments from "../components/assisgnment/useStudentAssignments";

import {
  ArrowLeft,
  FileText,
  ExternalLink,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const AssignmentDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { getProjectById } = useAssignments();

  const project = getProjectById((id));

  if (!project) {
    return (
      <StudentLayout title="Project Not Found">
        <div
          className="
        flex
        h-[40vh]
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        "
        >
          <p className="text-sm text-gray-500">Project does not exist.</p>
        </div>
      </StudentLayout>
    );
  }

  const statusStyle = () => {
    switch (project.status) {
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
      title="Project Details"

      subtitle="View your submitted project information."
    >
      <Button
        variant="outline"

        className="
        mb-5
        "

        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>

      <div
        className="
      grid
      grid-cols-1
      gap-6
      xl:grid-cols-3
      "
      >
        {/* LEFT */}

        <div
          className="
        space-y-5
        xl:col-span-2
        "
        >
          {/* Header Card */}

          <div
            className="
          overflow-hidden
          rounded-2xl
          border
          bg-white
          "
          >
            <img
              src={project.thumbnail}

              alt={project.title}

              className="
              h-60
              w-full
              object-cover
              "
            />

            <div className="p-5">
              <div
                className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-start
              sm:justify-between
              "
              >
                <div>
                  <h1
                    className="
                  text-xl
                  font-semibold
                  "
                  >
                    {project.title}
                  </h1>

                  <p
                    className="
                  mt-1
                  text-sm
                  text-gray-500
                  "
                  >
                    {project.category}
                  </p>
                </div>

                <span
                  className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  ${statusStyle()}
                  `}
                >
                  {project.status}
                </span>
              </div>

              <div
                className="
              mt-5
              flex
              items-center
              gap-2
              text-sm
              text-gray-500
              "
              >
                <CalendarDays size={15} />
                Submitted: {project.submittedDate}
              </div>
            </div>
          </div>

          {/* Description */}

          <div
            className="
          rounded-2xl
          border
          bg-white
          p-5
          "
          >
            <h3
              className="
            text-base
            font-semibold
            "
            >
              Project Description
            </h3>

            <p
              className="
            mt-3
            text-sm
            leading-6
            text-gray-600
            "
            >
              {project.description}
            </p>
          </div>

          {/* Files */}

          <div
            className="
          rounded-2xl
          border
          bg-white
          p-5
          "
          >
            <h3
              className="
            text-base
            font-semibold
            "
            >
              Uploaded Files
            </h3>

            <div
              className="
            mt-4
            space-y-3
            "
            >
              {project.files.map((file, index) => (
                <div
                  key={index}
                  className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  p-3
                  "
                >
                  <div
                    className="
                  flex
                  items-center
                  gap-3
                  "
                  >
                    <FileText size={20} className="text-blue-600" />

                    <div>
                      <p
                        className="
                      text-sm
                      font-medium
                      "
                      >
                        {file.name}
                      </p>

                      <p
                        className="
                      text-xs
                      text-gray-500
                      "
                      >
                        {file.size}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div
          className="
        space-y-5
        "
        >
          {/* Links */}

          <div
            className="
          rounded-2xl
          border
          bg-white
          p-5
          "
          >
            <h3
              className="
            text-base
            font-semibold
            "
            >
              Project Links
            </h3>

            <div
              className="
            mt-4
            space-y-3
            "
            >
              {project.figmaLink && (
                <a
                  href={project.figmaLink}
                  target="_blank"
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-blue-600
                    "
                >
                  <ExternalLink size={15} />
                  Figma
                </a>
              )}

              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-blue-600
                    "
                >
                  <ExternalLink size={15} />
                  Github
                </a>
              )}

              {project.liveLink && (
                <a
                  href={project.liveLink}
                  target="_blank"
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-blue-600
                    "
                >
                  <ExternalLink size={15} />
                  Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Review */}

          <div
            className="
          rounded-2xl
          border
          bg-white
          p-5
          "
          >
            <h3
              className="
            text-base
            font-semibold
            "
            >
              Mentor Review
            </h3>

            <div
              className="
            mt-4
            space-y-4
            "
            >
              <div>
                <p className="text-xs text-gray-400">Grade</p>

                <p className="mt-1 text-sm font-medium">{project.grade}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Feedback</p>

                <p
                  className="
                mt-1
                text-sm
                text-gray-600
                "
                >
                  {project.feedback}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}

          <div
            className="
          rounded-2xl
          border
          bg-white
          p-5
          "
          >
            <h3
              className="
            text-base
            font-semibold
            "
            >
              Status Timeline
            </h3>

            <div
              className="
            mt-4
            space-y-4
            "
            >
              {["Project Submitted", "Under Review", "Final Result"].map(
                (item, index) => (
                  <div
                    key={item}
                    className="
                    flex
                    items-center
                    gap-3
                    "
                  >
                    <CheckCircle2
                      size={18}
                      className={
                        index === 0 ? "text-green-600" : "text-gray-300"
                      }
                    />

                    <span
                      className="
                    text-sm
                    text-gray-600
                    "
                    >
                      {item}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default AssignmentDetails;
