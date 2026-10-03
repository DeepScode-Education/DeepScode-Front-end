// // useAssignments.ts

// import { useState } from "react";
// import { toast } from "sonner";

// import { studentProjects, StudentProject } from "./assignmentData";

// const useAssignments = () => {
//   const [projects, setProjects] = useState<StudentProject[]>(studentProjects);

//   const [loading, setLoading] = useState(false);

//   const submitProject = async (project: StudentProject) => {
//     setLoading(true);

//     try {
//       const payload: StudentProject = {
//         ...project,

//         status: "Submitted",
//       };

//       console.log("===== PROJECT SUBMISSION =====");

//       console.log({
//         ...payload,
//         submittedAt: new Date().toISOString(),
//       });

//       setProjects((prev) => [payload, ...prev]);

//       toast.success("Project submitted successfully.");
//     } catch (error) {
//       console.log(error);

//       toast.error("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getProjectById = (id: number) => {
//     return projects.find((item) => item.id === id);
//   };

//   const updateProjectStatus = (
//     id: number,
//     status: StudentProject["status"],
//   ) => {
//     setProjects((prev) =>
//       prev.map((item) =>
//         item.id === id
//           ? {
//               ...item,
//               status,
//             }
//           : item,
//       ),
//     );
//   };

//   const deleteProject = (id: number) => {
//     setProjects((prev) => prev.filter((item) => item.id !== id));

//     toast.success("Project removed.");
//   };

//   return {
//     projects,

//     loading,

//     submitProject,

//     getProjectById,

//     updateProjectStatus,

//     deleteProject,
//   };
// };

// export default useAssignments;



// useAssignments.ts
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { assignmentSubmissionApi, AssignmentRecord, AssignmentCreatePayload } from "@/integrations/client";

const useAssignments = () => {
  const [projects, setProjects] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assignmentSubmissionApi.getMine();
      setProjects(res.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const submitProject = async (payload: AssignmentCreatePayload) => {
    setLoading(true);
    try {
      const res = await assignmentSubmissionApi.create(payload);
      setProjects((prev) => [res.data, ...prev]);
      toast.success("Project submitted successfully.");
      return res.data;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = (id: string) => projects.find((item) => item._id === id);

  const deleteProject = async (id: string) => {
    try {
      await assignmentSubmissionApi.remove(id);
      setProjects((prev) => prev.filter((item) => item._id !== id));
      toast.success("Project removed.");
    } catch (error: any) {
      toast.error(error.message || "Delete failed.");
    }
  };

  return { projects, loading, submitProject, getProjectById, deleteProject, refetch: fetchAssignments };
};

export default useAssignments;
