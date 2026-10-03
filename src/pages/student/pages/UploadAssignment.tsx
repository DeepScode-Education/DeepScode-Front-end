import { useEffect, useRef, useState } from "react";

import StudentLayout from "../components/StudentLayout";

import useAssignments from "../components/assisgnment/useStudentAssignments";

import { assignmentApi, Course, Mentor } from "@/integrations/client";

import { UploadCloud, FileText, X, BookOpen, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const UploadAssignment = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { submitProject, loading } = useAssignments();

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [figmaLink, setFigmaLink] = useState("");

  const [githubLink, setGithubLink] = useState("");

  const [liveLink, setLiveLink] = useState("");

  const [notes, setNotes] = useState("");

  const [files, setFiles] = useState<File[]>([]);

  // ── Student's assigned course (auto-filled, read-only) ──
  const [assignedCourse, setAssignedCourse] = useState<Course | null>(null);

  const [assignedMentor, setAssignedMentor] = useState<Mentor | null>(null);

  const [courseLoading, setCourseLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      setCourseLoading(true);

      try {
        const res = await assignmentApi.getMine();

        const data = res.data;

        if (data?.course && typeof data.course === "object") {
          setAssignedCourse(data.course as Course);
        }

        if (data?.mentor && typeof data.mentor === "object") {
          setAssignedMentor(data.mentor as Mentor);
        }
      } catch (error) {
        console.error("Failed to fetch assigned course", error);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchAssignment();
  }, []);

  const category = assignedCourse?.category || "";

  const chooseFile = () => {
    inputRef.current?.click();
  };

  const handleFiles = (fileList: FileList) => {
    const selected = Array.from(fileList);

    setFiles((prev) => [...prev, ...selected]);

    console.log("Selected Files", selected);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFigmaLink("");
    setGithubLink("");
    setLiveLink("");
    setNotes("");
    setFiles([]);
  };

  const submitHandler = async () => {
    if (!title.trim()) {
      console.log("Title is required");
      return;
    }

    if (!description.trim()) {
      console.log("Description is required");
      return;
    }

    if (!assignedCourse) {
      console.log("No course assigned to this student yet");
      return;
    }

    const payload = {
      title,
      description,
      category,
      figmaLink,
      githubLink,
      liveLink,
      notes,
      files,
    };

    console.log("PROJECT PAYLOAD", payload);

    try {
      await submitProject(payload);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <StudentLayout
      title="Upload Assignment"

      subtitle="Submit your work for mentor review."
    >
      <input
        ref={inputRef}

        type="file"

        multiple

        className="hidden"

        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
          }
        }}
      />

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
        space-y-6
        xl:col-span-2
        "
        >
          {/* Project Details */}

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
              Project Details
            </h3>

            {/* Auto-filled course (read-only) */}
            <div
              className="
              mt-4
              flex
              items-center
              gap-3
              rounded-xl
              border
              bg-gray-50
              px-4
              py-3
              "
            >
              <BookOpen size={18} className="shrink-0 text-[#0037FF]" />

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400">Course</p>

                {courseLoading ? (
                  <p
                    className="
                    mt-0.5
                    flex
                    items-center
                    gap-1.5
                    text-sm
                    text-gray-500
                    "
                  >
                    <Loader2 size={13} className="animate-spin" />
                    Loading your course...
                  </p>
                ) : assignedCourse ? (
                  <p className="mt-0.5 truncate text-sm font-medium">
                    {assignedCourse.title}
                    {assignedCourse.category ? ` · ${assignedCourse.category}` : ""}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-red-500">
                    No course assigned yet. Contact admin.
                  </p>
                )}
              </div>
            </div>

            <input
              value={title}

              onChange={(e) => setTitle(e.target.value)}

              placeholder="Project title"

              className="
              mt-4
              w-full
              rounded-xl
              border
              px-4
              py-3
              text-sm
              outline-none
              "
            />

            <textarea
              value={description}

              onChange={(e) => setDescription(e.target.value)}

              rows={4}

              placeholder="Project description"

              className="
              mt-4
              w-full
              resize-none
              rounded-xl
              border
              px-4
              py-3
              text-sm
              outline-none
              "
            />
          </div>

          {/* Upload Files */}

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
              Upload Files
            </h3>

            <div
              onClick={chooseFile}

              className="
              mt-5
              cursor-pointer
              rounded-2xl
              border-2
              border-dashed
              border-blue-300
              bg-blue-50/40
              px-6
              py-10
              text-center
              transition
              hover:border-blue-500
              "
            >
              <UploadCloud
                size={40}

                className="
                mx-auto
                text-blue-600
                "
              />

              <h4
                className="
              mt-4
              text-sm
              font-semibold
              "
              >
                Drag & Drop or click to browse
              </h4>

              <p
                className="
              mt-1
              text-xs
              text-gray-500
              "
              >
                PDF, ZIP, PNG, JPG, FIG
              </p>

              <p
                className="
              text-[11px]
              text-gray-400
              "
              >
                Max 50 MB
              </p>
            </div>

            {files.length > 0 && (
              <div
                className="
              mt-5
              space-y-3
              "
              >
                {files.map((file, index) => (
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
                        text-[11px]
                        text-gray-500
                        "
                        >
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button onClick={() => removeFile(index)}>
                      <X size={17} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Links */}

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

            <input
              value={figmaLink}

              onChange={(e) => setFigmaLink(e.target.value)}

              placeholder="Figma / Behance Link"

              className="
              mt-4
              w-full
              rounded-xl
              border
              px-4
              py-3
              text-sm
              outline-none
              "
            />

            <input
              value={githubLink}

              onChange={(e) => setGithubLink(e.target.value)}

              placeholder="Github Repository Link"

              className="
              mt-3
              w-full
              rounded-xl
              border
              px-4
              py-3
              text-sm
              outline-none
              "
            />

            <input
              value={liveLink}

              onChange={(e) => setLiveLink(e.target.value)}

              placeholder="Live Demo Link"

              className="
              mt-3
              w-full
              rounded-xl
              border
              px-4
              py-3
              text-sm
              outline-none
              "
            />
          </div>

          {/* Notes */}

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
              Notes For Mentor
            </h3>

            <textarea
              rows={5}

              value={notes}

              onChange={(e) => setNotes(e.target.value)}

              placeholder="
              Anything you want your mentor to focus on...
              "

              className="
              mt-4
              w-full
              resize-none
              rounded-xl
              border
              px-4
              py-3
              text-sm
              outline-none
              "
            />
          </div>

          {/* Buttons */}

          <div
            className="
          flex
          flex-col
          gap-3
          sm:flex-row
          "
          >
            <Button
              variant="outline"

              className="
              h-10
              flex-1
              text-sm
              "
            >
              Save Draft
            </Button>

            <Button
              disabled={loading || !assignedCourse}

              onClick={submitHandler}

              className="
              h-10
              flex-1
              bg-[#0037FF]
              text-sm
              text-white
              hover:bg-[#002ed6]
              "
            >
              {loading ? "Submitting..." : "Submit Project"}
            </Button>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}

        <div
          className="
        space-y-6
        "
        >
          {/* Assigned mentor info */}

          {assignedMentor && (
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
                Your Mentor
              </h3>

              <div
                className="
              mt-4
              flex
              items-center
              gap-3
              "
              >
                {assignedMentor.photoUrl ? (
                  <img
                    src={assignedMentor.photoUrl}
                    alt={assignedMentor.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-100
                    text-sm
                    font-semibold
                    text-[#0037FF]
                    "
                  >
                    {assignedMentor.name?.charAt(0) || "M"}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{assignedMentor.name}</p>

                  {assignedMentor.specialization && (
                    <p className="truncate text-xs text-gray-500">
                      {assignedMentor.specialization}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Checklist */}

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
              Submission Checklist
            </h3>

            <div
              className="
            mt-5
            space-y-4
            "
            >
              {[
                "Files under 50 MB",
                "Cover screen included",
                "Project details added",
                "Links added properly",
              ].map((item) => (
                <div
                  key={item}
                  className="
                  flex
                  items-center
                  gap-3
                  "
                >
                  <span
                    className="
                  flex
                  h-4
                  w-4
                  items-center
                  justify-center
                  rounded-full
                  bg-green-100
                  text-[10px]
                  text-green-600
                  "
                  >
                    ✓
                  </span>

                  <span
                    className="
                  text-[13px]
                  text-gray-600
                  "
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}

          <div
            className="
          rounded-2xl
          border
          bg-blue-50
          p-5
          "
          >
            <h3
              className="
            text-sm
            font-semibold
            text-[#0037FF]
            "
            >
              Project Guidelines
            </h3>

            <ul
              className="
            mt-3
            space-y-2
            text-xs
            text-gray-600
            "
            >
              <li>• Upload latest project files.</li>

              <li>• Add source links if available.</li>

              <li>• Mention important review points.</li>
            </ul>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default UploadAssignment;