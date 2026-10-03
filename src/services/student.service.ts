


import {
  assignmentApi,
  coursesApi,
  studentProfileApi,
  studentDashboardApi,
  feeApi,
  paymentApi,
  type Course,
  type StudentAssignment,
  type StudentProfile,
  type StudentDashboardData,
  type Fee,
  type PaymentRecord,
} from "@/integrations/client";

export const studentProfileService = {
  getMyProfile: studentProfileApi.getMine,
  createProfile: studentProfileApi.create,
  updateProfile: studentProfileApi.update,
};

export const studentCoursesService = {
  getCourses: coursesApi.getAll,
};

export const studentAssignmentService = {
  getMyAssignment: assignmentApi.getMine,
};

// ── NEW ──
export const studentDashboardService = {
  getDashboard: studentDashboardApi.getMine,
};

export const studentFeeService = {
  getFee: feeApi.getMine,
  getPayments: paymentApi.getMine,
};





export type {
  Course,
  StudentAssignment,
  StudentProfile,
  StudentDashboardData,
  Fee,
  PaymentRecord,
};