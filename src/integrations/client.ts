// const VITE_API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
// export const BASE_URL = VITE_API_BASE?.trim() || "https://slateserver1.onrender.com";

// if (!VITE_API_BASE) {
//   console.warn(
//     "VITE_API_BASE is not set in .env. Falling back to https://slateserver1.onrender.com."
//   );
// }

// // ---------- token helpers ----------
// export const getToken = (): string | null => localStorage.getItem("token");
// export const setToken = (t: string) => localStorage.setItem("token", t);
// export const removeToken = () => localStorage.removeItem("token");

// export const getAdminToken = (): string | null => localStorage.getItem("adminToken");
// export const setAdminToken = (t: string) => localStorage.setItem("adminToken", t);
// export const removeAdminToken = () => localStorage.removeItem("adminToken");



// // ---------- typed API error ----------
// export class ApiError extends Error {
//   errorCode?: string;
//   data?: any;
//   status?: number;

//   constructor(message: string, errorCode?: string, data?: any, status?: number) {
//     super(message);
//     this.name = "ApiError";
//     this.errorCode = errorCode;
//     this.data = data;
//     this.status = status;
//   }
// }

// // ---------- core fetch ----------
// // async function request<T>(
// //   path: string,
// //   options: RequestInit = {},
// //   token?: string | null
// // ): Promise<T> {
// //   const headers: Record<string, string> = {
// //     "Content-Type": "application/json",
// //     ...(options.headers as Record<string, string>),
// //   };
// //   const t = token !== undefined ? token : getToken();
// //   if (t) headers["Authorization"] = `Bearer ${t}`;

// //   const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

// //   if (!res.ok) {
// //     const err = await res.json().catch(() => ({ message: res.statusText }));
// //     throw new Error(err.message || "Request failed");
// //   }
// //   return res.json() as Promise<T>;
// // }


// // async function request<T>(
// //   path: string,
// //   options: RequestInit = {},
// //   token?: string | null
// // ): Promise<T> {
// //   const headers: Record<string, string> = {
// //     "Content-Type": "application/json",
// //     ...(options.headers as Record<string, string>),
// //   };
// //   const t = token !== undefined ? token : getToken();
// //   if (t) headers["Authorization"] = `Bearer ${t}`;

// //   const res = await fetch(`${BASE_URL}${path}`, {
// //     ...options,
// //     headers,
// //     cache: "no-store",   // 👈 add this
// //   });

// //   if (!res.ok) {
// //     const err = await res.json().catch(() => ({ message: res.statusText }));
// //     throw new Error(err.message || "Request failed");
// //   }
// //   return res.json() as Promise<T>;
// // }

// export async function request<T>(
//   path: string,
//   options: RequestInit = {},
//   token?: string | null
// ): Promise<T> {
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     ...(options.headers as Record<string, string>),
//   };
//   const t = token !== undefined ? token : getToken();
//   if (t) headers["Authorization"] = `Bearer ${t}`;

//   const res = await fetch(`${BASE_URL}${path}`, {
//     ...options,
//     headers,
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     const err = await res.json().catch(() => ({ message: res.statusText }));
//     // NEW: preserve errorCode + data (e.g. FEE_PENDING payload) on the thrown error
//     throw new ApiError(err.message || "Request failed", err.errorCode, err.data, res.status);
//   }
//   return res.json() as Promise<T>;
// }
// // Multipart helper (for profile photo/govt-id uploads)
// // async function requestMultipart<T>(
// //   path: string,
// //   formData: FormData,
// //   method: "POST" | "PUT" = "POST",
// //   token?: string | null
// // ): Promise<T> {
// //   const t = token !== undefined ? token : getToken();
// //   const headers: Record<string, string> = {};
// //   if (t) headers["Authorization"] = `Bearer ${t}`;

// //   const res = await fetch(`${BASE_URL}${path}`, {
// //     method,
// //     body: formData,
// //     headers,
// //   });

// //   if (!res.ok) {
// //     const err = await res.json().catch(() => ({ message: res.statusText }));
// //     throw new Error(err.message || "Request failed");
// //   }
// //   return res.json() as Promise<T>;
// // }

// async function requestMultipart<T>(
//   path: string,
//   formData: FormData,
//   method: "POST" | "PUT" = "POST",
//   token?: string | null
// ): Promise<T> {
//   const t = token !== undefined ? token : getToken();
//   const headers: Record<string, string> = {};
//   if (t) headers["Authorization"] = `Bearer ${t}`;

//   const res = await fetch(`${BASE_URL}${path}`, {
//     method,
//     body: formData,
//     headers,
//     cache: "no-store",   // 👈 add this
//   });

//   if (!res.ok) {
//     const err = await res.json().catch(() => ({ message: res.statusText }));
//     throw new Error(err.message || "Request failed");
//   }
//   return res.json() as Promise<T>;
// }
// // ─────────────────────────────────────────────────────────────
// //  AUTH  (student + staff)
// // ─────────────────────────────────────────────────────────────
// export interface AuthUser {
//   [x: string]: any;
//   id: string;
//   email: string;
//   name: string;
//   fullName: string;
//   displayName: string;
//   role: "student" | "admin" | "super_admin" | "counsellor" | "mentor" | "accountant";
//   studentId?: string | null;
//   status?: string;
//   profileCompleted?: boolean;
// }

// export interface AuthResponse {
//   success: boolean;
//   token: string;
//   user: RawAuthUser;
// }

// interface RawAuthUser {
//   _id?: string;
//   id?: string;
//   email: string;
//   name?: string;
//   fullName?: string;
//   displayName?: string;
//   role: "student" | "admin" | "super_admin" | "counsellor" | "mentor" | "accountant";
//   studentId?: string | null;
//   status?: string;
//   profileCompleted?: boolean;
// }

// interface RegisterResponse {
//   success: boolean;
//   message: string;
//   data: RawAuthUser;
// }

// interface ProfileResponse {
//   success: boolean;
//   data: RawAuthUser;
// }

// const normalizeAuthUser = (user: RawAuthUser): AuthUser => ({
//   id: (user._id || user.id) as string,
//   email: user.email,
//   name: user.name ?? user.fullName ?? "",
//   fullName: user.fullName ?? user.name ?? "",
//   displayName: user.fullName || user.name || user.displayName || "",
//   role: user.role,
//   studentId: user.studentId ?? null,
//   status: user.status,
//   profileCompleted: user.profileCompleted ?? false,
// });

// export const authApi = {
//   signup: (displayName: string, email: string, password: string) =>
//     request<RegisterResponse>("/api/auth/register", {
//       method: "POST",
//       body: JSON.stringify({
//         name: displayName,
//         fullName: displayName,
//         email,
//         password,
//       }),
//     }),

//   login: async (identifier: string, password: string) => {
//     const response = await request<AuthResponse>("/api/auth/login", {
//       method: "POST",
//       body: JSON.stringify({ identifier: identifier.trim(), password }),
//     });
//     return {
//       ...response,
//       user: normalizeAuthUser(response.user),
//     };
//   },

//   me: async (): Promise<AuthUser> => {
//     const response = await request<ProfileResponse>("/api/auth/profile");
//     return normalizeAuthUser(response.data);
//   },

//   adminLogin: async (email: string, password: string) => {
//     const response = await request<AuthResponse>("/api/auth/login", {
//       method: "POST",
//       body: JSON.stringify({ identifier: email.trim(), password }),
//     });
//     return {
//       ...response,
//       user: normalizeAuthUser(response.user),
//     };
//   },

//  forgotPassword: (email: string) =>
//   request<{ success: boolean; message: string }>("/api/auth/forgot-password", {
//     method: "POST",
//     body: JSON.stringify({ email }),
//   }),

// verifyResetOtp: (email: string, otp: string) =>
//   request<{ success: boolean; valid: boolean; message?: string }>("/api/auth/verify-reset-otp", {
//     method: "POST",
//     body: JSON.stringify({ email, otp }),
//   }),

// verifyResetToken: (token: string) =>
//   request<{ success: boolean; valid: boolean; message?: string }>("/api/auth/verify-reset-token", {
//     method: "POST",
//     body: JSON.stringify({ token }),
//   }),

// resetPassword: (...args: [string, string, string] | [string, string]) => {
//   if (args.length === 2) {
//     const [resetToken, password] = args;
//     return request<{ success: boolean; message: string }>("/api/auth/reset-password", {
//       method: "POST",
//       body: JSON.stringify({ token: resetToken, password }),
//     });
//   }

//   const [email, otp, password] = args;
//   return request<{ success: boolean; message: string }>("/api/auth/reset-password", {
//     method: "POST",
//     body: JSON.stringify({ email, otp, password }),
//   });
// },
// };

// export interface OtpResponse {
//   success: boolean;
//   message: string;
// }

// export const otpApi = {
//   sendOtp: (email: string) =>
//     request<OtpResponse>("/api/email-otp/send", {
//       method: "POST",
//       body: JSON.stringify({ email }),
//     }),

//   verifyOtp: (email: string, otp: string) =>
//     request<OtpResponse>("/api/email-otp/verify", {
//       method: "POST",
//       body: JSON.stringify({ email, otp }),
//     }),
// };

// // ─────────────────────────────────────────────────────────────
// //  COURSES
// // ─────────────────────────────────────────────────────────────
// export interface Course {
//   _id?: string;
//   id?: string;
//   title: string;
//   description?: string;
//   thumbnail?: string;
//   thumbnail_url?: string;
//   image_url?: string;
//   price?: number;
//   category?: string;
//   level?: string | null;
//   duration?: string | null;
//   total_modules?: number;
//   isPublished?: boolean;
//   is_published?: boolean;
//   createdBy?: string | { _id: string; name: string; email: string };
//   created_at?: string;
//   createdAt?: string;
// }

// interface CoursesListResponse {
//   success: boolean;
//   count: number;
//   data: Course[];
// }

// interface SingleCourseResponse {
//   success: boolean;
//   data: Course;
// }

// export const coursesApi = {
//   getAll: async (): Promise<Course[]> => {
//     const response = await request<CoursesListResponse>("/api/courses");
//     return response.data ?? [];
//   },

//   getById: async (id: string): Promise<Course> => {
//     const response = await request<SingleCourseResponse>(`/api/courses/${id}`);
//     return response.data;
//   },

//   create: (data: Partial<Course>) =>
//     request<SingleCourseResponse>(
//       "/api/courses/create",
//       { method: "POST", body: JSON.stringify(data) },
//       getAdminToken() ?? getToken()
//     ),

//   update: (id: string, data: Partial<Course>) =>
//     request<SingleCourseResponse>(
//       `/api/courses/${id}`,
//       { method: "PUT", body: JSON.stringify(data) },
//       getAdminToken() ?? getToken()
//     ),

//   delete: (id: string) =>
//     request<{ success: boolean }>(
//       `/api/courses/${id}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),
// };

// // ─────────────────────────────────────────────────────────────
// //  ENROLLMENTS
// // ─────────────────────────────────────────────────────────────
// export interface EnrolledCourse {
//   id: string;
//   _id?: string;
//   title: string;
//   category?: string;
//   level?: string | null;
//   duration?: string | null;
//   progress?: number;
//   total_modules?: number;
//   completed_modules?: number;
//   image_url?: string | null;
//   thumbnail_url?: string | null;
//   thumbnail?: string | null;
// }

// interface EnrollResponse {
//   success: boolean;
//   message: string;
//   enrollment: {
//     _id: string;
//     student: string;
//     course: string;
//     status: string;
//     enrolledAt: string;
//   };
//   payment: {
//     _id: string;
//     student: string;
//     course: string;
//     amount: number;
//     transactionId: string;
//     paymentStatus: string;
//   };
// }

// export const enrollmentsApi = {
//   enroll: (courseId: string) =>
//     request<EnrollResponse>(`/api/enrollments/${courseId}`, { method: "POST" }),

//   getMyEnrollments: () => request<EnrolledCourse[]>("/api/enrollments/me"),

//   updateProgress: (courseId: string, progress: number, completed_modules: number) =>
//     request<{ success: boolean }>(`/api/enrollments/${courseId}`, {
//       method: "PATCH",
//       body: JSON.stringify({ progress, completed_modules }),
//     }),

//   getAll: () =>
//     request<Array<EnrolledCourse & { userId: string; userEmail: string }>>(
//       "/api/enrollments",
//       {},
//       getAdminToken() ?? getToken()
//     ),
// };

// // ─────────────────────────────────────────────────────────────
// //  ADMIN – dashboard & users
// // ─────────────────────────────────────────────────────────────
// export interface AdminUser {
//   id: string;
//   email: string;
//   displayName: string;
//   role: string;
//   created_at: string;
//   enrollmentCount: number;
// }

// export interface AdminDashboardStats {
//   totalStudents?: number;
//   pendingApprovals?: number;
//   approvedStudents?: number;
//   rejectedStudents?: number;
//   totalCourses?: number;
//   totalMentors?: number;
//   totalEnrollments?: number;
//   totalAssignments?: number;
//   totalRevenue?: number;
//   pendingFees?: number;
//   completionRate?: number;
//   totalAdmins?: number;
//   recentLeads?: DashboardLead[];
//   pendingFollowUps?: DashboardFollowUp[];
//   leadSources?: LeadSourceStat[];
//   coursePerformance?: CoursePerformanceStat[];
// }

// interface AdminDashboardResponse {
//   success: boolean;
//   stats?: AdminDashboardStats;
//   data?: AdminDashboardStats;
// }

// export const adminApi = {
//   getDashboard: async () => {
//     const response = await request<AdminDashboardResponse>(
//       "/api/admin/dashboard",
//       {},
//       getAdminToken() ?? getToken()
//     );
//     const stats = response.stats ?? response.data ?? {};
//     return {
//       totalStudents: stats.totalStudents ?? 0,
//       totalAdmins: stats.totalAdmins ?? 0,
//       pendingApprovals: stats.pendingApprovals ?? 0,
//       approvedStudents: stats.approvedStudents ?? 0,
//       rejectedStudents: stats.rejectedStudents ?? 0,
//       totalCourses: stats.totalCourses ?? 0,
//       totalMentors: stats.totalMentors ?? 0,
//       totalEnrollments: stats.totalEnrollments ?? 0,
//       totalAssignments: stats.totalAssignments ?? 0,
//       totalRevenue: stats.totalRevenue ?? 0,
//       pendingFees: stats.pendingFees ?? 0,
//       completionRate: stats.completionRate ?? 0,
//     };
//   },

//   getUsers: () =>
//     request<AdminUser[]>("/api/admin/users", {}, getAdminToken() ?? getToken()),

//   deleteUser: (id: string) =>
//     request<{ success: boolean }>(
//       `/api/admin/users/${id}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),

//   getStats: () => adminApi.getDashboard(),
// };

// // ─────────────────────────────────────────────────────────────
// //  ADMIN – student approval workflow + add/edit/delete student
// // ─────────────────────────────────────────────────────────────
// export interface PendingStudent {
//   _id: string;
//   fullName: string;
//   email: string;
//   status: "pending" | "approved" | "rejected";
//   studentId?: string | null;
//   createdAt: string;
// }

// interface PendingStudentsResponse {
//   success: boolean;
//   count: number;
//   data: PendingStudent[];
// }

// interface ApproveStudentResponse {
//   success: boolean;
//   message: string;
//   data: {
//     id: string;
//     fullName: string;
//     email: string;
//     studentId: string;
//     status: string;
//   };
// }

// export interface AddStudentPayload {
//   fullName: string;
//   email: string;
//   password?: string;
//   sendEmail?: boolean;
//   branch?: string;
// }

// export interface AddStudentResponse {
//   success: boolean;
//   message: string;
//   data: {
//     id: string;
//     fullName: string;
//     email: string;
//     studentId: string;
//     status: string;
//     role: string;
//   };
//   credentials: {
//     studentId: string;
//     password: string;
//   };
//   emailSent: boolean;
//   emailError?: string | null;
// }

// export interface UpdateStudentProfilePayload {
//   fullName?: string;
//   mobileNumber?: string;
//   dob?: string;
//   fatherName?: string;
//   address?: string;
//   city?: string;
//   state?: string;
//   pincode?: string;
//   govtIdType?: string;
//   govtIdNumber?: string;
// }

// export const studentApprovalApi = {
//   getPending: () =>
//     request<PendingStudentsResponse>(
//       "/api/admin/students/pending",
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   approve: (id: string) =>
//     request<ApproveStudentResponse>(
//       `/api/admin/students/${id}/approve`,
//       { method: "PATCH" },
//       getAdminToken() ?? getToken()
//     ),

//   reject: (id: string) =>
//     request<{ success: boolean; message: string }>(
//       `/api/admin/students/${id}/reject`,
//       { method: "PATCH" },
//       getAdminToken() ?? getToken()
//     ),

//   addStudent: (payload: AddStudentPayload) =>
//     request<AddStudentResponse>(
//       "/api/admin/students",
//       { method: "POST", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   deleteStudent: (id: string) =>
//     request<{ success: boolean; message: string }>(
//       `/api/admin/students/${id}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),

//   updateStudentProfile: (id: string, payload: UpdateStudentProfilePayload) =>
//     request<{ success: boolean; message: string; data: StudentProfile }>(
//       `/api/admin/students/${id}/profile`,
//       { method: "PUT", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),
// };

// // ─────────────────────────────────────────────────────────────
// //  SITE CONTENT / STORAGE helpers
// // ─────────────────────────────────────────────────────────────
// export interface PageSection {
//   id: string;
//   page: string;
//   section: string;
//   type: string;
//   content: any;
//   order_index: number;
// }

// export const siteContentApi = {
//   getSectionsByPage: (page: string) =>
//     request<PageSection[]>(`/api/site-content?page=${encodeURIComponent(page)}`),

//   getSection: (page: string, section: string) =>
//     request<PageSection | null>(
//       `/api/site-content/${encodeURIComponent(page)}/${encodeURIComponent(section)}`
//     ),
// };

// export const storageApi = {
//   getPublicUrl: (bucket: string, file: string) =>
//     request<{ publicUrl: string }>(
//       `/api/storage/public?bucket=${encodeURIComponent(bucket)}&file=${encodeURIComponent(file)}`
//     ),

//   uploadFile: (formData: FormData, token?: string | null) =>
//     fetch(`${BASE_URL}/api/storage/upload`, {
//       method: "POST",
//       body: formData,
//       headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//     }).then(async (r) => {
//       if (!r.ok) {
//         const errBody = await r.json().catch(() => ({ message: r.statusText }));
//         throw new Error(errBody.message || "Upload failed");
//       }
//       return r.json();
//     }),
// };

// // ─────────────────────────────────────────────────────────────
// //  Legacy Supabase compat shim
// // ─────────────────────────────────────────────────────────────
// const unsupportedSupabase = () => {
//   throw new Error(
//     "Legacy Supabase compatibility layer: this page still uses Supabase APIs. Migrate it to the backend REST client."
//   );
// };

// const supabaseCompat: any = {
//   from: () => supabaseCompat,
//   select: unsupportedSupabase,
//   update: unsupportedSupabase,
//   insert: unsupportedSupabase,
//   delete: unsupportedSupabase,
//   order: () => supabaseCompat,
//   eq: () => supabaseCompat,
//   in: () => supabaseCompat,
//   or: () => supabaseCompat,
//   single: unsupportedSupabase,
//   maybeSingle: unsupportedSupabase,
//   upsert: unsupportedSupabase,
//   storage: {
//     from: () => ({
//       upload: unsupportedSupabase,
//       getPublicUrl: async () => ({
//         data: null,
//         error: new Error("Legacy Supabase storage is not supported."),
//       }),
//       remove: unsupportedSupabase,
//       createSignedUrl: async () => ({
//         data: null,
//         error: new Error("Legacy Supabase storage is not supported."),
//       }),
//     }),
//   },
//   auth: {
//     resetPasswordForEmail: unsupportedSupabase,
//     getUser: unsupportedSupabase,
//   },
// };

// // ── MENTORS ──
// export interface Mentor {
//   _id: string;
//   name: string;
//   email: string;
//   phone?: string;
//   specialization?: string;
//   bio?: string;
//   photoUrl?: string;
//   isActive?: boolean;
// }
// interface MentorsListResponse { success: boolean; count: number; data: Mentor[]; }
// interface MentorResponse { success: boolean; message?: string; data: Mentor; }

// export const mentorApi = {
//   getAll: async (): Promise<Mentor[]> => {
//     const res = await request<MentorsListResponse>(
//       "/api/mentors",
//       {},
//       getAdminToken() ?? getToken()
//     );
//     return res.data ?? [];
//   },
//   create: (data: Partial<Mentor>) =>
//     request<MentorResponse>(
//       "/api/mentors",
//       { method: "POST", body: JSON.stringify(data) },
//       getAdminToken() ?? getToken()
//     ),
//   update: (id: string, data: Partial<Mentor>) =>
//     request<MentorResponse>(
//       `/api/mentors/${id}`,
//       { method: "PUT", body: JSON.stringify(data) },
//       getAdminToken() ?? getToken()
//     ),
//   remove: (id: string) =>
//     request<{ success: boolean }>(
//       `/api/mentors/${id}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),
// };

// // ── COURSE/MENTOR ASSIGNMENT ──
// // export interface StudentAssignment {
// //   _id?: string;
// //   course: Course | string;
// //   mentor?: Mentor | string | null;
// //   status: "active" | "completed" | "dropped";
// //   assignedAt?: string;
// // }

// export interface StudentAssignment {
//   _id?: string;
//   course: Course | string;
//   mentor?: Mentor | string | null;
//   status: "active" | "completed" | "dropped";
//   assignedAt?: string;
//   batch?: {
//     days: "MTW" | "MWT" | "MTT" | "SS";
//    time: "10:00-12:00" | "12:00-2:00" | "2:30-4:30" | "4:30-6:30"
//   } | null;
// }

// interface AssignmentResponse { success: boolean; message?: string; data: StudentAssignment | null; }

// // export const assignmentApi = {
// //   assign: (studentId: string, course: string, mentor?: string) =>
// //     request<AssignmentResponse>(
// //       `/api/admin/students/${studentId}/assign`,
// //       { method: "PATCH", body: JSON.stringify({ course, mentor }) },
// //       getAdminToken() ?? getToken()
// //     ),
// //   getMine: () => request<AssignmentResponse>("/api/student/assignment"),
// // };


// export interface AssignBatchPayload {
//   days: "MTW" | "MWT" | "MTT" | "SS";
//  time: "10:00-12:00" | "12:00-2:00" | "2:30-4:30" | "4:30-6:30"; 
// }

// export const assignmentApi = {
//   assign: (studentId: string, course: string, mentor?: string, batch?: AssignBatchPayload) =>
//     request<AssignmentResponse>(
//       `/api/admin/students/${studentId}/assign`,
//       { method: "PATCH", body: JSON.stringify({ course, mentor, batch }) },
//       getAdminToken() ?? getToken()
//     ),
//   getMine: () => request<AssignmentResponse>("/api/student/assignment"),
// };

// // ─────────────────────────────────────────────────────────────
// //  STUDENT PROFILE
// // ─────────────────────────────────────────────────────────────
// export interface StudentProfile {
//   _id?: string;
//   student?: string;
//   fullName: string;
//   dob?: string;
//   fatherName?: string;
//     gender?: string;     
//   mobileNumber?: string;
//   address?: string;
//   city?: string;
//   state?: string;
//   pincode?: string;
//     qualification?: string;        
//   college?: string;                
//   degree?: string;               
//   passingYear?: string;           
//   govtIdType?: string;
//   govtIdNumber?: string;
//   govtIdImageUrl?: string;
//   govtIdImagePublicId?: string;
//   preferredCourse?: string | { _id: string; title: string; category?: string };
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface StudentProfileResponse {
//   success: boolean;
//   message?: string;
//   data: StudentProfile | null;
// }

// export const studentProfileApi = {
//   getMine: () => request<StudentProfileResponse>("/api/student/profile"),
//   create: (formData: FormData) =>
//     requestMultipart<StudentProfileResponse>("/api/student/profile", formData, "POST"),
//   update: (formData: FormData) =>
//     requestMultipart<StudentProfileResponse>("/api/student/profile", formData, "PUT"),
// };

// // ── ADMIN: full student details ──
// export interface AdminStudentDetails {
//   success: boolean;
//   student: AdminUser & {
//     fullName?: string;
//     firstName?: string;
//     lastName?: string;
//     studentId?: string;
//     status?: string;
//     approvedAt?: string;
//     createdAt?: string;
//   };
//   profile: StudentProfile | null;
//   assignment: StudentAssignment | null;
//   fee: Fee | null;
//   payments: PaymentRecord[];
// }

// // ── NEW: Fee Collection Counsellor assignment (student-level) ──────────────
// export interface AssignStudentFeeCollectionPayload {
//   feeCollectionCounsellorId: string | null;
//   reason?: string;
// }

// export interface AssignFeeCollectionResult {
//   success: boolean;
//   message: string;
//   data?: AdminStudentDetails["student"] & {
//     feeCollectionCounsellor?: { _id: string; fullName: string; email: string } | null;
//   };
// }

// export const adminStudentApi = {
//   getById: (id: string) =>
//     request<AdminStudentDetails>(
//       `/api/admin/students/${id}`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   // NEW
//   assignFeeCollection: (id: string, payload: AssignStudentFeeCollectionPayload) =>
//     request<AssignFeeCollectionResult>(
//       `/api/admin/students/${id}/assign-fee-collection`,
//       { method: "PATCH", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),
// };
// // ── FEES ──
// export interface Fee {
//   nextDueDate: string | null;
//   _id?: string;
//   totalFees: number;
//   paymentMode: "full" | "emi";
//   emiMonths?: number | null;
//   monthlyEmiAmount?: number | null;
//   totalPaid: number;
//   remainingAmount: number;
//   course?: string | { _id: string; title: string; price?: number } | null;
// }

// interface FeeResponse {
//   success: boolean;
//   message?: string;
//   data: Fee | null;
//   payments?: PaymentRecord[];
// }

// // interface FeeSetupPayload {
// //   totalFees: number;
// //   paymentMode: "full" | "emi";
// //   emiMonths?: number;
// //   nextDueDate?: string | null;
// //   course?: string;
// //   payments?: { amount: number; paymentMethod?: string; transactionId?: string }[];
// // }


// interface FeeSetupPayload {
//   totalFees: number;
//   paymentMode: "full" | "emi";
//   emiMonths?: number;
//   nextDueDate?: string | null;
//   course?: string;
//   payments?: { amount: number; paymentMethod?: string; transactionId?: string }[];
//   installments?: { installmentNumber: number; amount: number; dueDate: string }[];
//   registrationPayment?: {             
//     amount: number;
//     paymentMethod?: string;
//     transactionId?: string;
//     paidAt?: string;
//   };
// }
// export const feeApi = {
//   setup: (studentId: string, payload: FeeSetupPayload) =>
//     request<FeeResponse>(
//       `/api/admin/students/${studentId}/fee`,
//       { method: "POST", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   getByStudent: (studentId: string) =>
//     request<FeeResponse>(
//       `/api/admin/students/${studentId}/fee`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   getMine: () => request<FeeResponse>("/api/student/fee"),
// };

// // ─────────────────────────────────────────────────────────────
// //  PAYMENTS
// // ─────────────────────────────────────────────────────────────
// export interface PaymentRecord {
//   _id: string;
//   student?: string;
//   fee?: string;
//   course?: string | { _id: string; title: string };
//   paymentNumber: number;
//   amount: number;
//   paymentMethod: "Cash" | "UPI" | "Bank Transfer" | "Card" | "Cheque" | "Other" | string;
//   transactionId?: string | null;
//   paymentStatus: "pending" | "success" | "failed";
//   paidAt: string;
//   isRegistrationPayment?: boolean;
//   recordedBy?: string;
//   createdAt?: string;
// }

// interface PaymentsListResponse { success: boolean; data: PaymentRecord[]; }
// interface AddPaymentResponse {
//   success: boolean;
//   message: string;
//   data: PaymentRecord;
//   fee: Fee;
// }

// // export const paymentApi = {
// //   // FIX: correct endpoint is /payment (singular), not /payments
// //   getByStudent: (studentId: string) =>
// //     request<PaymentsListResponse>(
// //       `/api/admin/students/${studentId}/payment`,
// //       {},
// //       getAdminToken() ?? getToken()
// //     ),

// // add: (
// //   studentId: string,
// //   payload: {
// //     amount: number;
// //     paymentMethod?: string;
// //     transactionId?: string;
// //     paidAt?: string;
// //     installmentId?: string; 
// //   }
// // ) =>
// //   request<AddPaymentResponse>(
// //     `/api/admin/students/${studentId}/payment`,
// //     { method: "POST", body: JSON.stringify(payload) },
// //     getAdminToken() ?? getToken()
// //   ),

// //   getMine: () => request<PaymentsListResponse>("/api/student/payment"),
// // };

// // ─────────────────────────────────────────────────────────────
// //  STUDENT DASHBOARD
// // ─────────────────────────────────────────────────────────────
// // export interface StudentDashboardData {
// //   success: boolean;
// //   myCourses?: number;
// //   totalSpent?: number;
// //   courses?: EnrolledCourse[];
// //   payments?: PaymentRecord[];
// //   profile: StudentProfile | null;
// //   assignment: StudentAssignment | null;
// //   fee: Fee | null;
// //   feePayments: PaymentRecord[];
// // }

// export const paymentApi = {
//   getByStudent: (studentId: string) =>
//     request<PaymentsListResponse>(`/api/admin/students/${studentId}/payment`, {}, getAdminToken() ?? getToken()),

//   add: (studentId: string, payload: {
//     amount: number; paymentMethod?: string; transactionId?: string; paidAt?: string; installmentId?: string;
//   }) =>
//     request<AddPaymentResponse>(
//       `/api/admin/students/${studentId}/payment`,
//       { method: "POST", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   // NEW — Super Admin only; backend enforces the role, but hide the button client-side too
//   remove: (studentId: string, paymentId: string) =>
//     request<{ success: boolean; message: string; data?: any }>(
//       `/api/admin/students/${studentId}/payment/${paymentId}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),

//   getMine: () => request<PaymentsListResponse>("/api/student/payment"),
// };

// export interface StudentDashboardData {
//   success: boolean;
//   student?: { fullName: string; email: string; studentId: string | null; profileCompleted?: boolean } | null; // NEW
//   myCourses?: number;
//   totalSpent?: number;
//   courses?: EnrolledCourse[];
//   payments?: PaymentRecord[];
//   profile: StudentProfile | null;
//   assignment: StudentAssignment | null;
//   fee: Fee | null;
//   feePayments: PaymentRecord[];

//    statCards: StatCardData[];
//   snapshotStats: SnapshotStatData[];
//   streak: { days: boolean[]; currentStreak: number };
//   roadmap: RoadmapItemData[];
//   attendanceTrend: AttendanceTrendPoint[];
//   attendancePercent: number;
//   nextClass: NextClassData | null;
//   hasCourseAssigned: boolean;
// }



// export interface StatCardData {
//   label: string;
//   value: string;
//   note: string;
//   key: "course" | "attendance" | "portfolio" | "placement" | "fees" | "nextClass";
// }

// export interface SnapshotStatData {
//   label: string;
//   value: number;
//   color: string;
// }

// export interface RoadmapItemData {
//   id: string;
//   title: string;
//   status: "completed" | "in-progress" | "locked";
//   progress: number;
//   lastAccess: string | null;
//   feedback: string | null;
// }

// export interface AttendanceTrendPoint {
//   month: string;
//   attendance: number;
// }

// export interface NextClassData {
//   status: "upcoming" | "live" | "completed";
//   dateLabel: string;
//   timeLabel: string;
//   moduleTitle: string;
// }

// export const studentDashboardApi = {
//   getMine: () => request<StudentDashboardData>("/api/student/dashboard"),
// };

// // ─────────────────────────────────────────────────────────────
// //  DASHBOARD ANALYTICS
// // ─────────────────────────────────────────────────────────────
// export interface DashboardLead {
//   _id: string;
//   fullName: string;
//   course: string | { _id: string; title: string; slug?: string; category?: string };
//   source: string;
//   leadStatus: string;
//   createdAt: string;
// }

// export interface DashboardFollowUp {
//   _id: string;
//   fullName: string;
//   mobileNumber?: string;
//   course: string | { _id: string; title: string; slug?: string; category?: string };
//   nextFollowUpDate: string;
//   leadStatus: string;
//   assignedTo?: string | null;
//   isOverdue?: boolean;
// }

// export interface LeadSourceStat {
//   source: string;
//   value: number;
// }

// export interface CoursePerformanceStat {
//   course: string;
//   students: number;
//   completion: number;
//   rating: number;
// }

// export interface RevenueStat {
//   month: string;
//   revenue: number;
//   students: number;
// } 

// export interface RecentPaymentRecord {
//   _id: string;
//   amount: number;
//   status: string;
//   paidAt?: string;
//   student?: { fullName?: string; email?: string } | string | null;
//   course?: { title?: string } | string | null;
// }

// interface DashboardLeadsResponse {
//   success: boolean;
//   leads?: DashboardLead[];
//   data?: DashboardLead[];
//   pagination?: { total: number; totalPages: number };
// }

// interface DashboardFollowUpsResponse {
//   success: boolean;
//   data: DashboardFollowUp[];
// }

// interface LeadSourcesResponse {
//   success: boolean;
//   data: LeadSourceStat[];
// }

// interface CoursePerformanceResponse {
//   success: boolean;
//   data: CoursePerformanceStat[];
// }

// interface RevenueSeriesResponse {
//   success: boolean;
//   data: RevenueStat[];
// }

// interface RecentPaymentsResponse {
//   success: boolean;
//   data: RecentPaymentRecord[];
//   pagination?: { total: number; totalPages: number };
// } 
// // ── dashboardExtApi — full object (replaces the existing one) ─────────────────
 
// export const dashboardExtApi = {
//   getRecentLeads: async (): Promise<DashboardLead[]> => {
//     const res = await request<DashboardLeadsResponse>(
//       "/api/leads?page=1&limit=5",
//       {},
//       getAdminToken() ?? getToken()
//     );
//     return res.leads ?? res.data ?? [];
//   },
 
//   // getPendingFollowUps: async (): Promise<DashboardFollowUp[]> => {
//   //   const now = new Date();
//   //   const [todayRes, overdueRes] = await Promise.allSettled([
//   //     request<DashboardFollowUpsResponse>(
//   //       "/api/leads/followups/all?filter=today",
//   //       {},
//   //       getAdminToken() ?? getToken()
//   //     ),
//   //     request<DashboardFollowUpsResponse>(
//   //       "/api/leads/followups/all?filter=overdue",
//   //       {},
//   //       getAdminToken() ?? getToken()
//   //     ),
//   //   ]);
 
//   //   const todayItems   = todayRes.status   === "fulfilled" ? (todayRes.value.data   ?? []) : [];
//   //   const overdueItems = overdueRes.status === "fulfilled" ? (overdueRes.value.data ?? []) : [];
 
//   //   const seen   = new Set<string>();
//   //   const merged: DashboardFollowUp[] = [];
//   //   for (const item of [...overdueItems, ...todayItems]) {
//   //     if (seen.has(item._id)) continue;
//   //     seen.add(item._id);
//   //     merged.push({
//   //       ...item,
//   //       isOverdue: item.nextFollowUpDate
//   //         ? new Date(item.nextFollowUpDate) < now
//   //         : false,
//   //     });
//   //   }
//   //   return merged.slice(0, 5);
//   // },
 

//     getPendingFollowUps: async (): Promise<DashboardFollowUp[]> => {
//     const res = await request<DashboardFollowUpsResponse>(
//       "/api/leads/followups/dashboard-pending",
//       {},
//       getAdminToken() ?? getToken()
//     );
//     return res.data ?? [];
//   },

//   getLeadSources: async (): Promise<LeadSourceStat[]> => {
//     const res = await request<LeadSourcesResponse>(
//       "/api/admin/analytics/lead-sources",
//       {},
//       getAdminToken() ?? getToken()
//     );
//     return res.data ?? [];
//   },
 
//   getCoursePerformance: async (): Promise<CoursePerformanceStat[]> => {
//     const res = await request<CoursePerformanceResponse>(
//       "/api/admin/analytics/course-performance",
//       {},
//       getAdminToken() ?? getToken()
//     );
//     return res.data ?? [];
//   },
 
//   // ── NEW ────────────────────────────────────────────────────────────────────
 
//   /**
//    * Returns last 12 months of monthly revenue + new-student counts.
//    * Backed by GET /api/admin/analytics/revenue-series
//    */
//   getRevenueSeries: async (): Promise<RevenueStat[]> => {
//     const res = await request<RevenueSeriesResponse>(
//       "/api/admin/analytics/revenue-series",
//       {},
//       getAdminToken() ?? getToken()
//     );
//     return res.data ?? [];
//   },
 
//   /**
//    * Returns the most recent successful payments (global, not per-student).
//    * Backed by GET /api/fee-collection/recent-payments (already exists).
//    */
//   getRecentPayments: async (limit = 5): Promise<RecentPaymentRecord[]> => {
//     const res = await request<RecentPaymentsResponse>(
//       `/api/fee-collection/recent-payments?limit=${limit}&page=1`,
//       {},
//       getAdminToken() ?? getToken()
//     );
//     return res.data ?? [];
//   },
// }



// // ─────────────────────────────────────────────────────────────
// //  PORTFOLIO  (student + admin)
// //  Paste this block into client.ts — anywhere after the `request`
// //  and `requestMultipart` function definitions (e.g. right before
// //  `export const supabase = supabaseCompat;` at the end of the file).
// //  It reuses the same `request()` helper, `getToken()`/`getAdminToken()`
// //  pattern as every other section above, so no new dependencies.
// // ─────────────────────────────────────────────────────────────

// export interface PortfolioImage {
//   url: string;
//   publicId: string;
// }

// export type PortfolioCategory = "Design" | "Marketing" | "3D" | "Data" | "Tech";

// // export type PortfolioStatus =
// //   | "draft"
// //   | "pending"
// //   | "approved"
// //   | "rejected"
// //   | "needs_changes"
// //   | "published"
// //   | "archived";

// export type PortfolioStatus =
//   | "draft"
//   | "pending"
//   | "approved"
//   | "rejected"
//   | "published"
//   | "archived";
// // export interface Portfolio {
// //   _id: string;
// //   student: string | { _id: string; fullName: string; email: string };
// //   course: string | { _id: string; title: string; category: string };
// //   courseTitle: string;
// //   category: PortfolioCategory;
// //   title: string;
// //   slug: string;
// //   description: string;
// //   thumbnail?: PortfolioImage | null;
// //   gallery: PortfolioImage[];
// //   githubUrl: string;
// //   liveUrl: string;
// //   figmaUrl: string;
// //   behanceUrl: string;
// //   videoUrl: string;
// //   driveUrl: string;
// //   technologies: string[];
// //   tags: string[];
// //   status: PortfolioStatus;
// //   featured: boolean;
// //   adminRemarks: string;
// //   approvedBy?: { _id: string; fullName: string; email: string } | null;
// //   approvedAt?: string | null;
// //   publishedAt?: string | null;
// //   views: number;
// //   likes: number;
// //   createdAt: string;
// //   updatedAt: string;
// // }


// // UPDATE the Portfolio interface:
// export interface Portfolio {
//   _id: string;
//   student: string | { _id: string; fullName: string; email: string } | null;
//   externalStudent: boolean;
//   studentName?: string;
//   studentEmail?: string;
//   studentBatch?: string;
//     studentPhoto?: PortfolioImage | null;   
//   studentReview?: string;               
//   course: string | { _id: string; title: string; category: string };
//   courseTitle: string;
//   category: PortfolioCategory;
//   title: string;
//   slug: string;
//   description: string;
//   thumbnail?: PortfolioImage | null;
//   gallery: PortfolioImage[];
//   githubUrl: string;
//   liveUrl: string;
//   figmaUrl: string;
//   behanceUrl: string;
//   videoUrl: string;
//   driveUrl: string;
//   technologies: string[];
//   tags: string[];
//   status: PortfolioStatus;
//   featured: boolean;
//   adminRemarks: string;
//   approvedBy?: { _id: string; fullName: string; email: string } | null;
//   approvedAt?: string | null;
//   publishedAt?: string | null;
//   views: number;
//   likes: number;
//   createdAt: string;
//   updatedAt: string;
// }

// // ADD:
// export interface ExternalPortfolioPayload {
//   studentName: string;
//   studentEmail?: string;
//   studentBatch?: string;
//     studentPhoto?: PortfolioImage | null;   
//   studentReview?: string;                  
//   course: string;
//   title: string;
//   description: string;
//   thumbnail?: PortfolioImage | null;
//   gallery?: PortfolioImage[];
//   githubUrl?: string;
//   liveUrl?: string;
//   figmaUrl?: string;
//   behanceUrl?: string;
//   videoUrl?: string;
//   driveUrl?: string;
//   technologies?: string[];
//   tags?: string[];
//   featured?: boolean;
//   publish?: boolean;
// }

// export interface PortfolioFormPayload {
//   title: string;
//   description: string;
//   thumbnail?: PortfolioImage | null;
//   gallery?: PortfolioImage[];
//   githubUrl?: string;
//   liveUrl?: string;
//   figmaUrl?: string;
//   behanceUrl?: string;
//   videoUrl?: string;
//   driveUrl?: string;
//   technologies?: string[];
//   tags?: string[];
// }

// interface PortfolioListResponse {
//   success: boolean;
//   data: Portfolio[];
// }

// interface SinglePortfolioResponse {
//   success: boolean;
//   message?: string;
//   data: Portfolio;
// }

// // ── STUDENT ──────────────────────────────────────────────────────────────
// // Uses default token (getToken()) automatically, same as studentProfileApi.

// // export interface StudentPortfolioPayload {
// //   title: string;
// //   description: string;
// //   githubUrl?: string;
// //   liveUrl?: string;
// //   thumbnail?: PortfolioImage | null;
// //   gallery?: PortfolioImage[];
// // }

// // Student can send these — technologies/tags are optional suggestions,
// // admin can fully override them later.
// export interface StudentPortfolioPayload {
//   title: string;
//   description: string;
//   githubUrl?: string;
//   liveUrl?: string;
//   thumbnail?: PortfolioImage | null;
//   gallery?: PortfolioImage[];
//   technologies?: string[];
//   tags?: string[];
//   studentReview?: string; 
// }

// export interface PublicPortfolioListParams {
//   page?: number;
//   limit?: number;
//   category?: PortfolioCategory | "";
//   search?: string;
// }

// interface PublicPortfolioListResponse {
//   success: boolean;
//   portfolios: Portfolio[];
//   pagination: {
//     total: number;
//     page: number;
//     limit: number;
//     pages: number;
//   };
// }

// export const publicPortfolioApi = {
//   getAll: (params: PublicPortfolioListParams = {}) =>
//     request<PublicPortfolioListResponse>(`/api/portfolio${buildQuery(params)}`),
// };


// // export const portfolioApi = {
// //   create: (payload: PortfolioFormPayload) =>
// //     request<SinglePortfolioResponse>("/api/student/portfolio", {
// //       method: "POST",
// //       body: JSON.stringify(payload),
// //     }),

// //   getMine: () => request<PortfolioListResponse>("/api/student/portfolio"),

// //   update: (id: string, payload: Partial<PortfolioFormPayload>) =>
// //     request<SinglePortfolioResponse>(`/api/student/portfolio/${id}`, {
// //       method: "PUT",
// //       body: JSON.stringify(payload),
// //     }),

// //   remove: (id: string) =>
// //     request<{ success: boolean; message?: string }>(`/api/student/portfolio/${id}`, {
// //       method: "DELETE",
// //     }),

// //   submit: (id: string) =>
// //     request<SinglePortfolioResponse>(`/api/student/portfolio/${id}/submit`, {
// //       method: "PATCH",
// //     }),
// // };

// // ── ADMIN ────────────────────────────────────────────────────────────────
// // Passes getAdminToken() ?? getToken() explicitly, same as adminApi / feeApi.


// export const portfolioApi = {
//   create: (payload: StudentPortfolioPayload) =>
//     request<SinglePortfolioResponse>("/api/student/portfolio", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     }),

//   getMine: () => request<PortfolioListResponse>("/api/student/portfolio"),

//   update: (id: string, payload: Partial<StudentPortfolioPayload>) =>
//     request<SinglePortfolioResponse>(`/api/student/portfolio/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(payload),
//     }),

//   remove: (id: string) =>
//     request<{ success: boolean; message?: string }>(`/api/student/portfolio/${id}`, {
//       method: "DELETE",
//     }),

//   submit: (id: string) =>
//     request<SinglePortfolioResponse>(`/api/student/portfolio/${id}/submit`, {
//       method: "PATCH",
//     }),
// };
// export interface AdminPortfolioListParams {
//   page?: number;
//   limit?: number;
//   status?: PortfolioStatus | "";
//   category?: PortfolioCategory | "";
//   search?: string;
// }

// interface AdminPortfolioListResponse {
//   success: boolean;
//   portfolios: Portfolio[];
//   pagination: {
//     total: number;
//     page: number;
//     limit: number;
//     pages: number;
//   };
// }

// // const buildQuery = (params: Record<string, string | number | undefined>) => {
// //   const usp = new URLSearchParams();
// //   Object.entries(params).forEach(([k, v]) => {
// //     if (v !== undefined && v !== "") usp.set(k, String(v));
// //   });
// //   const qs = usp.toString();
// //   return qs ? `?${qs}` : "";
// // };

// const buildQuery = <T extends object>(params: T) => {
//   const usp = new URLSearchParams();

//   Object.entries(params).forEach(([k, v]) => {
//     if (v !== undefined && v !== "") {
//       usp.set(k, String(v));
//     }
//   });

//   const qs = usp.toString();
//   return qs ? `?${qs}` : "";
// };

// export const adminPortfolioApi = {
//   getAll: (params: AdminPortfolioListParams) =>
//     request<AdminPortfolioListResponse>(
//       `/api/admin/portfolio${buildQuery(params)}`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   getById: (id: string) =>
//     request<SinglePortfolioResponse>(
//       `/api/admin/portfolio/${id}`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//     uploadImage: (file: File) => {
//     const fd = new FormData();
//     fd.append("file", file);
//     return requestMultipart<{ success: boolean; data: PortfolioImage }>(
//       "/api/admin/portfolio/upload",
//       fd,
//       "POST",
//       getAdminToken() ?? getToken()
//     );
//   },

//   update: (id: string, payload: Partial<Portfolio>) =>
//     request<SinglePortfolioResponse>(
//       `/api/admin/portfolio/${id}`,
//       { method: "PUT", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   remove: (id: string) =>
//     request<{ success: boolean; message?: string }>(
//       `/api/admin/portfolio/${id}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),

//   approve: (id: string) =>
//     request<SinglePortfolioResponse>(
//       `/api/admin/portfolio/${id}/approve`,
//       { method: "PATCH" },
//       getAdminToken() ?? getToken()
//     ),

//   reject: (id: string, remark: string) =>
//     request<SinglePortfolioResponse>(
//       `/api/admin/portfolio/${id}/reject`,
//       { method: "PATCH", body: JSON.stringify({ remark }) },
//       getAdminToken() ?? getToken()
//     ),

//   requestChanges: (id: string, remark: string) =>
//     request<SinglePortfolioResponse>(
//       `/api/admin/portfolio/${id}/request-changes`,
//       { method: "PATCH", body: JSON.stringify({ remark }) },
//       getAdminToken() ?? getToken()
//     ),

//   publish: (id: string) =>
//     request<SinglePortfolioResponse>(
//       `/api/admin/portfolio/${id}/publish`,
//       { method: "PATCH" },
//       getAdminToken() ?? getToken()
//     ),

//   unpublish: (id: string) =>
//     request<SinglePortfolioResponse>(
//       `/api/admin/portfolio/${id}/unpublish`,
//       { method: "PATCH" },
//       getAdminToken() ?? getToken()
//     ),

//   toggleFeatured: (id: string) =>
//     request<SinglePortfolioResponse>(
//       `/api/admin/portfolio/${id}/feature`,
//       { method: "PATCH" },
//       getAdminToken() ?? getToken()
//     ),

//   createExternal: (payload: ExternalPortfolioPayload) =>
//     request<SinglePortfolioResponse>(
//       "/api/admin/portfolio/external",
//       { method: "POST", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),
// };



// // ─────────────────────────────────────────────────────────────
// //  STUDENT DOCUMENTS
// // ─────────────────────────────────────────────────────────────
// export type DocumentSlotKey =
//   | "aadhaar"
//   | "pan"
//   | "resume"
//   | "offer_letter"
//   | "passport_photo"
//   | "course_certificate";

// export interface StudentDocumentApiRecord {
//   id: DocumentSlotKey;
//   docId?: string | null;
//   status: "empty" | "under_review" | "verified" | "action_required";
//   fileType: "pdf" | "image" | "doc" | null;
//   fileSize: number | null;
//   uploadedAt: string | null;
//   fileUrl: string | null;
//   note: string | null;
//   reviewedBy?: string | null;
//   reviewedAt?: string | null;
// }

// interface DocumentsListResponse {
//   success: boolean;
//   data: StudentDocumentApiRecord[];
// }

// interface SingleDocumentResponse {
//   success: boolean;
//   message?: string;
//   data: StudentDocumentApiRecord;
// }

// export const studentDocumentApi = {
//   getMine: () => request<DocumentsListResponse>("/api/student/documents"),

//   upload: (type: DocumentSlotKey, file: File) => {
//     const fd = new FormData();
//     fd.append("file", file);
//     return requestMultipart<SingleDocumentResponse>(`/api/student/documents/${type}`, fd, "POST");
//   },

//   replace: (type: DocumentSlotKey, file: File) => {
//     // same endpoint — backend upserts on (student, type)
//     const fd = new FormData();
//     fd.append("file", file);
//     return requestMultipart<SingleDocumentResponse>(`/api/student/documents/${type}`, fd, "POST");
//   },

//   remove: (type: DocumentSlotKey) =>
//     request<{ success: boolean; message?: string }>(`/api/student/documents/${type}`, {
//       method: "DELETE",
//     }),
// };

// // ── ADMIN: student document review ──
// export const adminDocumentApi = {
//   getByStudent: (studentId: string) =>
//     request<DocumentsListResponse>(
//       `/api/admin/students/${studentId}/documents`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   verify: (studentId: string, type: DocumentSlotKey) =>
//     request<SingleDocumentResponse>(
//       `/api/admin/students/${studentId}/documents/${type}/verify`,
//       { method: "PATCH" },
//       getAdminToken() ?? getToken()
//     ),

//   requestAction: (studentId: string, type: DocumentSlotKey, note: string) =>
//     request<SingleDocumentResponse>(
//       `/api/admin/students/${studentId}/documents/${type}/request-action`,
//       { method: "PATCH", body: JSON.stringify({ note }) },
//       getAdminToken() ?? getToken()
//     ),
// };





// // ─────────────────────────────────────────────────────────────
// //  ASSIGNMENTS (submissions)
// // ─────────────────────────────────────────────────────────────
// export type AssignmentStatus = "Submitted" | "Under Review" | "Approved" | "Rejected";

// export interface AssignmentFile {
//   name: string;
//   url: string;
//   publicId: string;
//   fileType: "image" | "pdf" | "raw" | "video";
//   size: number;
// }

// export interface AssignmentRecord {
//   _id: string;
//   student: string | { _id: string; fullName: string; email: string; studentId?: string };
//   title: string;
//   description: string;
//   category?: string;
//   thumbnail?: string;
//   files: AssignmentFile[];
//   figmaLink?: string;
//   githubLink?: string;
//   liveLink?: string;
//   driveLink?: string;
//   notes?: string;
//   status: AssignmentStatus;
//   grade: string;
//   feedback: string;
//   reviewedBy?: string | { _id: string; fullName: string; role: string } | null;
//   reviewedAt?: string | null;
//   submittedDate: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface AssignmentListResponse {
//   success: boolean;
//   data: AssignmentRecord[];
//   pagination?: { total: number; page: number; limit: number; totalPages: number };
// }

// interface AssignmentSingleResponse {
//   success: boolean;
//   message?: string;
//   data: AssignmentRecord;
// }

// export interface AssignmentCreatePayload {
//   title: string;
//   description: string;
//   category?: string;
//   figmaLink?: string;
//   githubLink?: string;
//   liveLink?: string;
//   driveLink?: string;
//   notes?: string;
//   files?: File[];
// }

// const buildAssignmentFormData = (payload: AssignmentCreatePayload) => {
//   const fd = new FormData();
//   fd.append("title", payload.title);
//   fd.append("description", payload.description);
//   if (payload.category) fd.append("category", payload.category);
//   if (payload.figmaLink) fd.append("figmaLink", payload.figmaLink);
//   if (payload.githubLink) fd.append("githubLink", payload.githubLink);
//   if (payload.liveLink) fd.append("liveLink", payload.liveLink);
//   if (payload.driveLink) fd.append("driveLink", payload.driveLink);
//   if (payload.notes) fd.append("notes", payload.notes);
//   (payload.files || []).forEach((file) => fd.append("files", file));
//   return fd;
// };

// export const assignmentSubmissionApi = {
//   // Student
//   create: (payload: AssignmentCreatePayload) =>
//     requestMultipart<AssignmentSingleResponse>("/api/assignment-submissions", buildAssignmentFormData(payload), "POST"),

//   getMine: () => request<AssignmentListResponse>("/api/assignment-submissions/mine"),

//   update: (id: string, payload: Partial<AssignmentCreatePayload>) =>
//     requestMultipart<AssignmentSingleResponse>(
//       `/api/assignment-submissions/${id}`,
//       buildAssignmentFormData(payload as AssignmentCreatePayload),
//       "PUT"
//     ),

//   remove: (id: string) =>
//     request<{ success: boolean; message?: string }>(`/api/assignment-submissions/${id}`, { method: "DELETE" }),

//   getById: (id: string) => request<AssignmentSingleResponse>(`/api/assignment-submissions/${id}`),

//   // Mentor / Admin / Super Admin
//   getAll: (params: { page?: number; limit?: number; status?: string; search?: string; studentId?: string } = {}) =>
//     request<AssignmentListResponse>(
//       `/api/assignment-submissions${buildQuery(params)}`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   review: (id: string, payload: { status?: AssignmentStatus; grade?: string; feedback?: string }) =>
//     request<AssignmentSingleResponse>(
//       `/api/assignment-submissions/${id}/review`,
//       { method: "PATCH", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   adminDelete: (id: string) =>
//     request<{ success: boolean; message?: string }>(
//       `/api/assignment-submissions/admin/${id}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),
// };



// // ─────────────────────────────────────────────────────────────
// //  MENTOR PORTAL  (the logged-in mentor's own dashboard data)
// //  NOTE: distinct from `mentorApi` above, which is the admin-facing
// //  CRUD for managing mentor *profiles*. This is the mentor's own view
// //  of their assigned students/courses/assignments/classes.
// // ─────────────────────────────────────────────────────────────

// // export interface MentorDashboardStats {
// //   assignedStudents: number;
// //   pendingAssignments: number;
// //   completedReviews: number;
// //   activeCourses: number;
// // }


// export interface MentorDashboardStats {
//   assignedStudents: number;
//   totalStudents: number;
//   totalBatches: number;
//   activeCourses: number;
//   pendingAssignments: number;
//   completedReviews: number;
// }

// export interface MentorAssignmentRow {
//   _id: string;
//   studentName: string;
//   studentId?: string | null;
//   title: string;
//   course?: string;
//   status: "Submitted" | "Under Review" | "Approved" | "Rejected";
//   submittedDate: string;
// }

// export interface MentorStudentRow {
//   _id: string;
//   fullName: string;
//   email: string;
//   studentId?: string | null;
//   course?: string | null;
//   progress: number;
//   lastActivity?: string | null;
// }

// export interface MentorClassRow {
//   _id: string;
//   title: string;
//   course?: string;
//   date: string;
//   time: string;
// }

// export interface MentorCourseRow {
//   _id: string;
//   title: string;
//   category?: string;
//   studentsCount: number;
// }

// // interface MentorDashboardResponse {
// //   success: boolean;
// //   data: {
// //     stats: MentorDashboardStats;
// //     recentAssignments: MentorAssignmentRow[];
// //     students: MentorStudentRow[];
// //     upcomingClasses: MentorClassRow[];
// //   };
// // }

// interface MentorDashboardResponse {
//   success: boolean;
//   data: {
//     stats: MentorDashboardStats;
//     batches: MentorBatchRow[];
//     recentAssignments: MentorAssignmentRow[];
//     students: MentorStudentRow[];
//     upcomingClasses: MentorClassRow[];
//   };
// }

// interface MentorStudentsResponse {
//   success: boolean;
//   data: MentorStudentRow[];
// }

// interface MentorCoursesResponse {
//   success: boolean;
//   data: MentorCourseRow[];
// }

// interface MentorClassesResponse {
//   success: boolean;
//   data: MentorClassRow[];
// }

// // export const mentorDashboardApi = {
// //   getDashboard: () => request<MentorDashboardResponse>("/api/mentor/dashboard"),
// //   getStudents: () => request<MentorStudentsResponse>("/api/mentor/students"),
// //   getCourses: () => request<MentorCoursesResponse>("/api/mentor/courses"),
// //   getClasses: () => request<MentorClassesResponse>("/api/mentor/classes"),
// // };


// export interface MentorBatchRow {
//   id: string;
//   course: string;
//   courseId: string;
//   category?: string;
//   batchDays: string | null;
//   batchTime: string | null;
//   totalStudents: number;
// }

// export interface MentorBatchStudentRow {
//   name: string;
//   email: string;
//   studentId: string | null;
//   progress: number;
//   assignmentStatus: string;
// }

// export interface MentorBatchStudentsResponse {
//   success: boolean;
//   data: {
//     batch: { course: string; days: string | null; time: string | null };
//     students: MentorBatchStudentRow[];
//   };
// }

// interface MentorBatchesResponse {
//   success: boolean;
//   data: MentorBatchRow[];
// }

// export const mentorDashboardApi = {
//   getDashboard: () => request<MentorDashboardResponse>("/api/mentor/dashboard"),
//   getStudents: () => request<MentorStudentsResponse>("/api/mentor/students"),
//   getCourses: () => request<MentorCoursesResponse>("/api/mentor/courses"),
//   getClasses: () => request<MentorClassesResponse>("/api/mentor/classes"),
//   getBatches: () => request<MentorBatchesResponse>("/api/mentor/batches"),
//   getBatchStudents: (id: string) =>
//     request<MentorBatchStudentsResponse>(`/api/mentor/batches/${encodeURIComponent(id)}/students`),
// };



// // // ─────────────────────────────────────────────────────────────
// // //  LIVE CLASSROOM  (Zoom-backed real-time sessions)
// // // ─────────────────────────────────────────────────────────────
// // export type LiveClassStatus = "scheduled" | "live" | "ended" | "cancelled";
// // export type LiveBatchDays = "MTW" | "MWT" | "MTT" | "SS";
// // export type LiveBatchTime = "10:00-12:00" | "12:00-2:00" | "2:30-4:30" | "4:30-6:30";

// // export interface LiveClassRecord {
// //   _id: string;
// //   course: { _id: string; title: string } | string;
// //   mentor: { _id: string; fullName: string } | string;
// //   batch: { days: LiveBatchDays; time: LiveBatchTime };
// //   title: string;
// //   status: LiveClassStatus;
// //   provider: string;
// //   providerMeetingId?: string;
// //   scheduledAt: string | null;
// //   startedAt: string | null;
// //   endedAt: string | null;
// //   createdAt: string;
// // }

// // // export interface JoinLiveClassPayload {
// // //   signature: string;
// // //   providerMeetingId: string;
// // //   password: string; 
// // //   sdkKey: string;
// // //   liveClassId: string;
// // // }

// // export interface JoinLiveClassPayload {
// //   signature: string;
// //   providerMeetingId: string;
// //   password: string;
// //   sdkKey: string;
// //   liveClassId: string;
// //   zak?: string; // NEW — only present when the mentor (host) joins
// // }

// // interface LiveClassEnvelope<T> {
// //   success: boolean;
// //   message?: string;
// //   data: T;
// // }

// // export const liveClassApi = {
// //   startClass: (payload: { courseId: string; days: LiveBatchDays; time: LiveBatchTime; title?: string }) =>
// //     request<LiveClassEnvelope<LiveClassRecord>>(
// //       "/api/live/start",
// //       { method: "POST", body: JSON.stringify(payload) },
// //       getAdminToken() ?? getToken()
// //     ),

// //   endClass: (liveClassId: string) =>
// //     request<LiveClassEnvelope<LiveClassRecord>>(
// //       "/api/live/end",
// //       { method: "POST", body: JSON.stringify({ liveClassId }) },
// //       getAdminToken() ?? getToken()
// //     ),

// //   // works for both mentor (host) and student (attendee) — role decided by backend from JWT
// //   joinClass: (liveClassId: string) =>
// //     request<LiveClassEnvelope<JoinLiveClassPayload>>(
// //       "/api/live/join",
// //       { method: "POST", body: JSON.stringify({ liveClassId }) },
// //       getAdminToken() ?? getToken()
// //     ),

// //   getCurrent: () =>
// //     request<LiveClassEnvelope<LiveClassRecord | null>>(
// //       "/api/live/current",
// //       {},
// //       getAdminToken() ?? getToken()
// //     ),

// //   getUpcoming: () =>
// //     request<LiveClassEnvelope<LiveClassRecord[]>>(
// //       "/api/live/upcoming",
// //       {},
// //       getAdminToken() ?? getToken()
// //     ),

// //   attendanceHeartbeat: (liveClassId: string) =>
// //     request<LiveClassEnvelope<unknown>>(
// //       "/api/live/attendance/heartbeat",
// //       { method: "POST", body: JSON.stringify({ liveClassId }) },
// //       getToken()
// //     ),

// //   hostHeartbeat: (liveClassId: string) =>
// //     request<LiveClassEnvelope<unknown>>(
// //       "/api/live/host-heartbeat",
// //       { method: "POST", body: JSON.stringify({ liveClassId }) },
// //       getAdminToken() ?? getToken()
// //     ),
// // };



// /**
//  * PATCH for src/integrations/client.ts
//  * ─────────────────────────────────────
//  * Everything else in client.ts (auth, courses, enrollments, admin, fees,
//  * portfolio, documents, assignments, mentor dashboard, attendance,
//  * certificates, etc.) is UNCHANGED — only the "LIVE CLASSROOM" section's
//  * payload shape changes, because Video SDK auth (a signed JWT) is a
//  * different shape than Meeting SDK auth (signature + zak + password).
//  *
//  * Replace the existing `JoinLiveClassPayload` interface and the
//  * `liveClassApi` export in client.ts with the block below. Nothing in
//  * `liveClassApi`'s method names/signatures changes — only the shape of
//  * the data `joinClass` resolves to — so MentorLiveClassPage.tsx,
//  * StudentLiveClassPage.tsx, and MyCourse.tsx (which only call
//  * `liveClassApi.joinClass(id)` and pass `res.data` straight into
//  * `liveClass.startSession(...)`) need NO changes.
//  */

// // ─────────────────────────────────────────────────────────────
// //  LIVE CLASSROOM  (Zoom Video SDK-backed real-time sessions)
// // ─────────────────────────────────────────────────────────────
// export type LiveClassStatus = "scheduled" | "live" | "ended" | "cancelled";
// export type LiveBatchDays = "MTW" | "MWT" | "MTT" | "SS";
// export type LiveBatchTime = "10:00-12:00" | "12:00-2:00" | "2:30-4:30" | "4:30-6:30";

// export interface LiveClassRecord {
//   _id: string;
//   course: { _id: string; title: string } | string;
//   mentor: { _id: string; fullName: string } | string;
//   batch: { days: LiveBatchDays; time: LiveBatchTime };
//   title: string;
//   status: LiveClassStatus;
//   provider: string;
//   providerMeetingId?: string;
//   scheduledAt: string | null;
//   startedAt: string | null;
//   endedAt: string | null;
//   createdAt: string;
// }
// export interface JoinLiveClassPayload {
//   token?: string;
//   livekitUrl?: string;
//   roomName?: string;
//   liveClassId?: string;
//   role?: "mentor" | "student";
//   title?: string;

//   // Deprecated Zoom payload fields kept optional for compatibility while the
//   // front-end finishes migrating to the LiveKit contract.
//   signature?: string;
//   providerMeetingId?: string;
//   password?: string;
//   sdkKey?: string;
//   zak?: string;
// }

// interface LiveClassEnvelope<T> {
//   success: boolean;
//   message?: string;
//   data: T;
// }

// export const liveClassApi = {
//   startClass: (payload: { courseId: string; days: LiveBatchDays; time: LiveBatchTime; title?: string }) =>
//     request<LiveClassEnvelope<LiveClassRecord>>(
//       "/api/live/start",
//       { method: "POST", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   endClass: (liveClassId: string) =>
//     request<LiveClassEnvelope<LiveClassRecord>>(
//       "/api/live/end",
//       { method: "POST", body: JSON.stringify({ liveClassId }) },
//       getAdminToken() ?? getToken()
//     ),

//   // Works for both mentor (host) and student (attendee) — role decided by
//   // backend from JWT. Response now carries a Video SDK JWT instead of a
//   // Meeting SDK signature.
//   joinClass: (liveClassId: string) =>
//     request<LiveClassEnvelope<JoinLiveClassPayload>>(
//       "/api/live/join",
//       { method: "POST", body: JSON.stringify({ liveClassId }) },
//       getAdminToken() ?? getToken()
//     ),

//   getCurrent: () =>
//     request<LiveClassEnvelope<LiveClassRecord | null>>("/api/live/current", {}, getAdminToken() ?? getToken()),

//   getUpcoming: () =>
//     request<LiveClassEnvelope<LiveClassRecord[]>>("/api/live/upcoming", {}, getAdminToken() ?? getToken()),

//   attendanceHeartbeat: (liveClassId: string) =>
//     request<LiveClassEnvelope<unknown>>(
//       "/api/live/attendance/heartbeat",
//       { method: "POST", body: JSON.stringify({ liveClassId }) },
//       getToken()
//     ),

//   hostHeartbeat: (liveClassId: string) =>
//     request<LiveClassEnvelope<unknown>>(
//       "/api/live/host-heartbeat",
//       { method: "POST", body: JSON.stringify({ liveClassId }) },
//       getAdminToken() ?? getToken()
//     ),
// };


// // ── BATCH ATTENDANCE ──
// export interface BatchAttendanceStudent {
//   studentId: string;
//   fullName: string;
//   email: string;
//   studentIdCode: string | null;
//   status: "present" | "absent" | "leave" | null;
//   mode: "online" | "offline" | null;
//   joinedOnline: boolean;
// }

// export interface BatchAttendanceResponse {
//   success: boolean;
//   data: {
//     batch: { course: string; days: string | null; time: string | null };
//     date: string;
//     students: BatchAttendanceStudent[];
//   };
// }

// export interface MarkAttendanceRecord {
//   studentId: string;
//   status: "present" | "absent" | "leave";
//   mode?: "online" | "offline";
// }

// export const batchAttendanceApi = {
//   getForDate: (batchId: string, date?: string, liveClassId?: string) => {
//     const params = new URLSearchParams();
//     if (date) params.set("date", date);
//     if (liveClassId) params.set("liveClassId", liveClassId);
//     const qs = params.toString();
//     return request<BatchAttendanceResponse>(
//       `/api/mentor/batches/${encodeURIComponent(batchId)}/attendance${qs ? `?${qs}` : ""}`
//     );
//   },

//   save: (batchId: string, records: MarkAttendanceRecord[], date?: string, liveClassId?: string) =>
//     request<{ success: boolean; message: string; data: { date: string; count: number } }>(
//       `/api/mentor/batches/${encodeURIComponent(batchId)}/attendance`,
//       {
//         method: "POST",
//         body: JSON.stringify({ records, date, liveClassId }),
//       }
//     ),
// };



// // ─────────────────────────────────────────────────────────────
// //  STUDENT ATTENDANCE
// // ─────────────────────────────────────────────────────────────
// export interface StudentAttendanceSummary {
//   currentPercentage: number;
//   requiredPercentage: number;
//   presentDays: number;
//   absentDays: number;
//   leaveDays: number;
// }

// export interface StudentAttendanceMonthPoint {
//   month: string;
//   attendance: number;
// }

// export interface StudentAttendanceCalendarDay {
//   date: number;
//   status: "present" | "absent" | "leave" | null;
// }

// export interface StudentAttendanceLegendItem {
//   label: string;
//   status: "present" | "absent" | "leave";
// }

// export interface StudentAttendanceData {
//   summary: StudentAttendanceSummary;
//   monthlyTrend: StudentAttendanceMonthPoint[];
//   calendar: StudentAttendanceCalendarDay[];
//   calendarMonthLabel: string;
//   calendarYear: number;
//   legend: StudentAttendanceLegendItem[];
// }

// interface StudentAttendanceResponse {
//   success: boolean;
//   message?: string;
//   data: StudentAttendanceData;
// }

// export const studentAttendanceApi = {
//   getMine: (month?: number, year?: number) => {
//     const params = new URLSearchParams();
//     if (month) params.set("month", String(month));
//     if (year) params.set("year", String(year));
//     const qs = params.toString();
//     return request<StudentAttendanceResponse>(`/api/student/attendance${qs ? `?${qs}` : ""}`);
//   },
// };



// // ── CERTIFICATES ──
// export interface CertificateRecord {
//   _id: string;
//   certificateId: string;
//   student: string | { _id: string; fullName: string; email: string; studentId?: string };
//   course: string | { _id: string; title: string };
//   mentor?: string | { _id: string; fullName: string } | null;
//   issuedBy?: string | { _id: string; fullName: string };
//   studentName: string;
//   courseName: string;
//   mentorName?: string;
//   issueDate: string;
//   verificationCode: string;
//   verificationUrl: string;
//   pdfUrl: string;
//   status: "issued" | "revoked";
//   verified: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CertificateRequirement {
//   id: string;
//   title: string;
//   progress: number;
// }

// export interface CertificateEligibility {
//   hasCourseAssigned: boolean;
//   course: { _id: string; title: string; category?: string } | null;
//   mentor: { _id: string; fullName: string; designation?: string } | null;
//   requirements: CertificateRequirement[];
//   overallProgress: number;
//   eligible: boolean;
// }

// export interface EligibleStudentRow {
//   _id: string;
//   fullName: string;
//   email: string;
//   studentId?: string | null;
//   course: { _id: string; title: string } | null;
//   mentor: { _id: string; fullName: string } | null;
//   hasCertificate: boolean;
// }

// interface CertificateListResponse {
//   success: boolean;
//   data: CertificateRecord[];
//   pagination?: { total: number; page: number; limit: number; totalPages: number };
// }
// interface CertificateSingleResponse {
//   success: boolean;
//   message?: string;
//   data: CertificateRecord;
// }
// interface CertificateEligibilityResponse {
//   success: boolean;
//   data: CertificateEligibility & { student?: { fullName: string; studentId?: string } };
// }
// interface EligibleStudentsResponse {
//   success: boolean;
//   data: EligibleStudentRow[];
// }
// export interface PublicCertificateVerification {
//   valid: boolean;
//   certificateId: string;
//   studentName: string;
//   courseName: string;
//   issueDate: string;
//   status: "issued" | "revoked";
//   verified: boolean;
// }
// interface VerifyResponse {
//   success: boolean;
//   message?: string;
//   data: PublicCertificateVerification;
// }

// export const adminCertificateApi = {
//   getStudents: (search = "") =>
//     request<EligibleStudentsResponse>(
//       `/api/admin/certificates/students${search ? `?search=${encodeURIComponent(search)}` : ""}`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   getEligibility: (studentId: string) =>
//     request<CertificateEligibilityResponse>(
//       `/api/admin/certificates/eligibility/${studentId}`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   getAll: (params: { page?: number; limit?: number; search?: string; status?: string } = {}) =>
//     request<CertificateListResponse>(
//       `/api/admin/certificates${buildQuery(params)}`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   issue: (studentId: string) =>
//     request<CertificateSingleResponse>(
//       "/api/admin/certificates",
//       { method: "POST", body: JSON.stringify({ studentId }) },
//       getAdminToken() ?? getToken()
//     ),

//   getById: (id: string) =>
//     request<CertificateSingleResponse>(`/api/admin/certificates/${id}`, {}, getAdminToken() ?? getToken()),

//   revoke: (id: string, reason?: string) =>
//     request<CertificateSingleResponse>(
//       `/api/admin/certificates/${id}/revoke`,
//       { method: "PATCH", body: JSON.stringify({ reason: reason || "" }) },
//       getAdminToken() ?? getToken()
//     ),
// };

// export const studentCertificateApi = {
//   getEligibility: () => request<CertificateEligibilityResponse>("/api/student/certificates/eligibility"),
//   getMine: () => request<CertificateListResponse>("/api/student/certificates"),
//   getById: (id: string) => request<CertificateSingleResponse>(`/api/student/certificates/${id}`),
//   getDownloadUrl: (id: string) =>
//     request<{ success: boolean; data: { url: string } }>(`/api/student/certificates/${id}/download`),
// };

// export const publicCertificateApi = {
//   verify: (certificateId: string) =>
//     request<VerifyResponse>(`/api/verify/${encodeURIComponent(certificateId)}`),
// };



// // ─────────────────────────────────────────────────────────────
// //  OPPORTUNITIES (Career Portal)
// // ─────────────────────────────────────────────────────────────
// export type OpportunityStatus = "draft" | "published";
// export type OpportunityWorkMode = "On-site" | "Hybrid" | "Remote";
// export type OpportunityPayPeriod = "Annual" | "Monthly";
// export type OpportunityVisibility = "Internal" | "Public";

// export interface OpportunityIncentives {
//   performanceBonus: boolean;
//   performanceBonusValue: number | null;
//   signOnBonus: boolean;
//   signOnBonusValue: number | null;
// }

// export interface OpportunityEligibility {
//   experienceLevel: string;
//   minYears: number | null;
//   education: string;
//   notes: string;
//   workAuthRequired: boolean;
//   backgroundCheck: boolean;
// }

// export interface OpportunitySettings {
//   applicationDeadline: string | null;
//   applicationLimit: number | null;
//   visibility: OpportunityVisibility;
//   autoScreening: boolean;
//   alertRecipients: string[];
// }

// // Flat shape returned by the backend (Opportunity.js model)
// export interface Opportunity {
//   _id: string;
//   companyEntity: string;
//     hiringPartner?: string | { _id: string; companyName: string } | null;
//   internalJobCode: string;
//   hiringManager?: string | { _id: string; fullName: string; email: string } | null;
//   department: string;
//   primaryLocation: string;
//   urgentRequirement: boolean;
// applicationCount?: number; 
//   jobTitle: string;
//   slug: string;
//   category: string;
//   employmentType: string;
//   workMode: OpportunityWorkMode;
//   openings: number;
//   description: string;
//   responsibilities: string;
//   requiredSkills: string[];
//   niceToHaveSkills: string[];

//   compensationType: string;
//   currency: string;
//   payMin: number | null;
//   payMax: number | null;
//   payPeriod: OpportunityPayPeriod;
//   benefits: string[];
//   incentives: OpportunityIncentives;

//   eligibility: OpportunityEligibility;
//   settings: OpportunitySettings;

//   status: OpportunityStatus;
//   createdAt: string;
//   updatedAt: string;
// }

// // Payload shape mirrors the wizard's step objects — sent as-is to the backend,
// // which maps basic/role/compensation/eligibility/settings onto the flat model.
// export interface OpportunityWizardPayload {
//   basic: {
//     companyEntity: string;
//     hiringPartner: string; 
//     internalJobCode: string;
//     hiringManager: string;
//     department: string;
//     primaryLocation: string;
//     urgentRequirement: boolean;
//   };
//   role: {
//     jobTitle: string;
//     category: string;
//     employmentType: string;
//     workMode: OpportunityWorkMode;
//     openings: number;
//     description: string;
//     responsibilities: string;
//     requiredSkills: string[];
//     niceToHaveSkills: string[];
//   };
//   compensation: {
//     compensationType: string;
//     currency: string;
//     payMin: number | null;
//     payMax: number | null;
//     payPeriod: OpportunityPayPeriod;
//     benefits: string[];
//     performanceBonus: boolean;
//     performanceBonusValue: number | null;
//     signOnBonus: boolean;
//     signOnBonusValue: number | null;
//   };
//   eligibility: {
//     experienceLevel: string;
//     minYears: number | null;
//     education: string;
//     notes: string;
//     workAuthRequired: boolean;
//     backgroundCheck: boolean;
//   };
//   settings: {
//     applicationDeadline: string;
//     applicationLimit: number | null;
//     visibility: OpportunityVisibility;
//     autoScreening: boolean;
//     alertRecipients: string[];
//   };
//   status?: OpportunityStatus;
// }

// interface OpportunityListResponse {
//   success: boolean;
//   data: Opportunity[];
//   pagination?: { total: number; page: number; limit: number; totalPages: number };
// }

// interface OpportunitySingleResponse {
//   success: boolean;
//   message?: string;
//   data: Opportunity;
// }

// export interface OpportunityListParams {
//   page?: number;
//   limit?: number;
//   search?: string;
//   status?: OpportunityStatus | "";
// }

// export const opportunitiesApi = {
//   getAll: (params: OpportunityListParams = {}) => {
//     const usp = new URLSearchParams();
//     Object.entries(params).forEach(([k, v]) => {
//       if (v !== undefined && v !== "") usp.set(k, String(v));
//     });
//     const qs = usp.toString();
//     return request<OpportunityListResponse>(
//       `/api/admin/opportunities${qs ? `?${qs}` : ""}`,
//       {},
//       getAdminToken() ?? getToken()
//     );
//   },

//   getById: (id: string) =>
//     request<OpportunitySingleResponse>(
//       `/api/admin/opportunities/${id}`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   create: (payload: OpportunityWizardPayload) =>
//     request<OpportunitySingleResponse>(
//       "/api/admin/opportunities",
//       { method: "POST", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   update: (id: string, payload: OpportunityWizardPayload) =>
//     request<OpportunitySingleResponse>(
//       `/api/admin/opportunities/${id}`,
//       { method: "PUT", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   updateStatus: (id: string, status: OpportunityStatus) =>
//     request<OpportunitySingleResponse>(
//       `/api/admin/opportunities/${id}/status`,
//       { method: "PATCH", body: JSON.stringify({ status }) },
//       getAdminToken() ?? getToken()
//     ),

//   remove: (id: string) =>
//     request<{ success: boolean; message?: string }>(
//       `/api/admin/opportunities/${id}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),
// };


// // ─────────────────────────────────────────────────────────────
// //  HIRING PARTNERS
// // ─────────────────────────────────────────────────────────────
// export type HiringPartnerTier = "Premier" | "Standard";

// export interface HiringPartner {
//   _id: string;
//   companyName: string;
//   slug: string;
//   industry: string;
//   logo: string;
//   description: string;
//   website: string;
//   tier: HiringPartnerTier;
//   isActive: boolean;
//   stats: { totalHires: number };
//   openRoles?: number;
//   totalHires?: number;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface HiringPartnerDetail {
//   partner: HiringPartner;
//   opportunities: Opportunity[];
//   openRoles: number;
//   totalHires: number;
// }

// export interface HiringPartnerDashboardStats {
//   totalPartners: number;
//   premierPartners: number;
//   openRoles: number;
//   totalHires: number;
// }

// export interface HiringPartnerPayload {
//   companyName: string;
//   industry?: string;
//   logo?: string;
//   description?: string;
//   website?: string;
//   tier?: HiringPartnerTier;
//   isActive?: boolean;
//   totalHires?: number;
// }

// interface HiringPartnerListResponse {
//   success: boolean;
//   data: HiringPartner[];
//   pagination?: { total: number; page: number; limit: number; totalPages: number };
// }

// interface HiringPartnerSingleResponse {
//   success: boolean;
//   message?: string;
//   data: HiringPartner;
// }

// interface HiringPartnerDetailResponse {
//   success: boolean;
//   data: HiringPartnerDetail;
// }

// interface HiringPartnerStatsResponse {
//   success: boolean;
//   data: HiringPartnerDashboardStats;
// }

// export interface HiringPartnerListParams {
//   page?: number;
//   limit?: number;
//   search?: string;
//   tier?: HiringPartnerTier | "";
//   isActive?: "true" | "false" | "";
// }

// export const hiringPartnersApi = {
//   getAll: (params: HiringPartnerListParams = {}) => {
//     const usp = new URLSearchParams();
//     Object.entries(params).forEach(([k, v]) => {
//       if (v !== undefined && v !== "") usp.set(k, String(v));
//     });
//     const qs = usp.toString();
//     return request<HiringPartnerListResponse>(
//       `/api/admin/hiring-partners${qs ? `?${qs}` : ""}`,
//       {},
//       getAdminToken() ?? getToken()
//     );
//   },

//   getById: (id: string) =>
//     request<HiringPartnerSingleResponse>(
//       `/api/admin/hiring-partners/${id}`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   getDetail: (id: string) =>
//     request<HiringPartnerDetailResponse>(
//       `/api/admin/hiring-partners/${id}/detail`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   create: (payload: HiringPartnerPayload) =>
//     request<HiringPartnerSingleResponse>(
//       "/api/admin/hiring-partners",
//       { method: "POST", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   update: (id: string, payload: Partial<HiringPartnerPayload>) =>
//     request<HiringPartnerSingleResponse>(
//       `/api/admin/hiring-partners/${id}`,
//       { method: "PUT", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   remove: (id: string) =>
//     request<{ success: boolean; message?: string }>(
//       `/api/admin/hiring-partners/${id}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),

//   getDashboardStats: () =>
//     request<HiringPartnerStatsResponse>(
//       "/api/admin/hiring-partners/dashboard/stats",
//       {},
//       getAdminToken() ?? getToken()
//     ),
// };



// // ─────────────────────────────────────────────────────────────
// //  OPPORTUNITY APPLICATIONS (Job Portal)
// // ─────────────────────────────────────────────────────────────
// export type OpportunityApplicationStatus =
//   | "applied" | "under_review" | "shortlisted" | "rejected" | "selected";

// export interface OpportunityApplication {
//   _id: string;
//   opportunity: string | Opportunity;
//   applicant: string | { _id: string; fullName: string; email: string; studentId?: string };
//   fullName: string;
//   email: string;
//   phone?: string;
//   links?: ApplicationLink[]; 
//   coverLetter?: string;
//   resume?: { url: string; originalName?: string };
//   status: OpportunityApplicationStatus;
//   adminRemarks?: string;
//   createdAt: string;
// }

// // export interface ApplyToOpportunityPayload {
// //   fullName: string;
// //   email: string;
// //   phone?: string;
// //   coverLetter?: string;
// //   resume?: File;
// // }


// export type ApplicationLinkType =
//   | "Personal Website" | "LinkedIn" | "GitHub" | "Behance" | "Dribbble"
//   | "ArtStation" | "YouTube" | "Vimeo" | "Google Drive" | "Live Project"
//   | "Resume" | "Other";

// export const APPLICATION_LINK_TYPES: ApplicationLinkType[] = [
//   "Personal Website", "LinkedIn", "GitHub", "Behance", "Dribbble",
//   "ArtStation", "YouTube", "Vimeo", "Google Drive", "Live Project",
//   "Resume", "Other",
// ];

// export interface ApplicationLink {
//   type: ApplicationLinkType;
//   label?: string; // required only when type === "Other"
//   url: string;
// }

// export interface ApplyToOpportunityPayload {
//   fullName: string;
//   email: string;
//   phone?: string;
//   coverLetter?: string;
//   resume?: File;
//   links?: ApplicationLink[]; 
// }
// interface OpportunityApplicationSingleResponse {
//   success: boolean;
//   message?: string;
//   data: OpportunityApplication;
// }
// interface OpportunityApplicationListResponse {
//   success: boolean;
//   message?: string;
//   data: OpportunityApplication[];
// }

// // export const opportunityApplicationApi = {
// //   apply: (opportunityId: string, payload: ApplyToOpportunityPayload) => {
// //     const fd = new FormData();
// //     fd.append("fullName", payload.fullName);
// //     fd.append("email", payload.email);
// //     if (payload.phone) fd.append("phone", payload.phone);
// //     if (payload.coverLetter) fd.append("coverLetter", payload.coverLetter);
// //     if (payload.resume) fd.append("resume", payload.resume);
// //     return requestMultipart<OpportunityApplicationSingleResponse>(
// //       `/api/opportunities/${opportunityId}/apply`,
// //       fd,
// //       "POST",
// //       getToken()
// //     );
// //   },

// //   getMine: () => request<OpportunityApplicationListResponse>("/api/student/opportunity-applications/mine"),

// //   getForOpportunity: (opportunityId: string) =>
// //     request<OpportunityApplicationListResponse>(
// //       `/api/admin/opportunities/${opportunityId}/applications`,
// //       {},
// //       getAdminToken() ?? getToken()
// //     ),

// //   updateStatus: (applicationId: string, status: OpportunityApplicationStatus, adminRemarks?: string) =>
// //     request<OpportunityApplicationSingleResponse>(
// //       `/api/admin/opportunities/applications/${applicationId}/status`,
// //       { method: "PATCH", body: JSON.stringify({ status, adminRemarks }) },
// //       getAdminToken() ?? getToken()
// //     ),
// // };

// // Public (no auth) job listing — for the student-facing Job Portal

// export const opportunityApplicationApi = {
//   apply: (opportunityId: string, payload: ApplyToOpportunityPayload) => {
//     const fd = new FormData();
//     fd.append("fullName", payload.fullName);
//     fd.append("email", payload.email);
//     if (payload.phone) fd.append("phone", payload.phone);
//     if (payload.coverLetter) fd.append("coverLetter", payload.coverLetter);
//     if (payload.resume) fd.append("resume", payload.resume);
//     if (payload.links && payload.links.length > 0) {
//       fd.append("links", JSON.stringify(payload.links));
//     }
//     return requestMultipart<OpportunityApplicationSingleResponse>(
//       `/api/opportunities/${opportunityId}/apply`,
//       fd,
//       "POST",
//       getToken()
//     );
//   },

//   getMine: () => request<OpportunityApplicationListResponse>("/api/student/opportunity-applications/mine"),

//   getForOpportunity: (opportunityId: string) =>
//     request<OpportunityApplicationListResponse>(
//       `/api/admin/opportunities/${opportunityId}/applications`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   updateStatus: (applicationId: string, status: OpportunityApplicationStatus, adminRemarks?: string) =>
//     request<OpportunityApplicationSingleResponse>(
//       `/api/admin/opportunities/applications/${applicationId}/status`,
//       { method: "PATCH", body: JSON.stringify({ status, adminRemarks }) },
//       getAdminToken() ?? getToken()
//     ),
// };

// export const publicOpportunitiesApi = {
//   getAll: (params: { search?: string; department?: string; workMode?: string; category?: string } = {}) => {
//     const usp = new URLSearchParams();
//     Object.entries(params).forEach(([k, v]) => { if (v) usp.set(k, String(v)); });
//     const qs = usp.toString();
//     return request<OpportunityListResponse>(`/api/opportunities${qs ? `?${qs}` : ""}`);
//   },
// };



// export interface BatchVideoRecord {
//   id: string;
//   title: string;
//   description: string;
//   duration: number | null;
//   fileName: string;
//   fileSize: number;
//   createdAt: string;
//   uploadedBy: string | null;
//   streamUrl: string;
// }
// interface BatchVideoListResponse { success: boolean; message?: string; data: BatchVideoRecord[]; }
// interface BatchVideoSingleResponse { success: boolean; message?: string; data: BatchVideoRecord; }

// export const mentorVideoApi = {
//   getForBatch: (batchId: string) =>
//     request<BatchVideoListResponse>(`/api/mentor/batches/${encodeURIComponent(batchId)}/videos`),
//   upload: (batchId: string, payload: { title: string; description?: string; video: File }) => {
//     const fd = new FormData();
//     fd.append("title", payload.title);
//     if (payload.description) fd.append("description", payload.description);
//     fd.append("video", payload.video);
//     return requestMultipart<BatchVideoSingleResponse>(
//       `/api/mentor/batches/${encodeURIComponent(batchId)}/videos`, fd, "POST"
//     );
//   },
//   remove: (videoId: string) =>
//     request<{ success: boolean; message?: string }>(`/api/mentor/videos/${videoId}`, { method: "DELETE" }),
//   getStreamUrl: (streamUrl: string) => `${BASE_URL}${streamUrl}?token=${encodeURIComponent(getToken() ?? "")}`,
// };

// export const studentVideoApi = {
//   getMine: () => request<BatchVideoListResponse>("/api/student/videos"),
//   getStreamUrl: (streamUrl: string) => `${BASE_URL}${streamUrl}?token=${encodeURIComponent(getToken() ?? "")}`,
// };


// // ─────────────────────────────────────────────────────────────
// //  ADMIN — full course list (includes unpublished, for internal mgmt)
// // ─────────────────────────────────────────────────────────────
// export const adminCoursesApi = {
//   getAll: (params: { page?: number; limit?: number; search?: string } = {}) => {
//     const usp = new URLSearchParams();
//     Object.entries(params).forEach(([k, v]) => {
//       if (v !== undefined && v !== "") usp.set(k, String(v));
//     });
//     const qs = usp.toString();
//     return request<{ success: boolean; data: Course[]; pagination?: any }>(
//       `/api/admin/courses${qs ? `?${qs}` : ""}`,
//       {},
//       getAdminToken() ?? getToken()
//     );
//   },
// };

// // ─────────────────────────────────────────────────────────────
// //  ADMIN — RECORDED COURSES: Batch & Video Management
// // ─────────────────────────────────────────────────────────────
// export interface AdminRecordedBatch {
//   batchId: string;
//   courseId: string;
//   days: string | null;
//   time: string | null;
//   isUnscheduled: boolean;
//   mentor: { _id: string; fullName: string; email: string } | null;
//   studentCount: number;
//   videoCount: number;
// }

// export interface AdminBatchVideo {
//   id: string;
//   title: string;
//   description: string;
//   duration: number | null;
//   fileName: string;
//   fileSize: number;
//   createdAt: string;
//   uploadedBy: string | null;
//   streamUrl: string; // relative path, e.g. /api/admin/recorded-videos/:id/stream
// }

// interface AdminBatchesResponse {
//   success: boolean;
//   message?: string;
//   data: AdminRecordedBatch[];
//   course?: { _id: string; title: string };
// }

// interface AdminBatchVideosResponse {
//   success: boolean;
//   message?: string;
//   data: AdminBatchVideo[];
//   batch?: { batchId: string; courseId: string; days: string | null; time: string | null };
// }

// interface AdminBatchVideoSingleResponse {
//   success: boolean;
//   message?: string;
//   data: AdminBatchVideo;
// }

// export const adminRecordedCourseApi = {
//   getBatches: (courseId: string) =>
//     request<AdminBatchesResponse>(
//       `/api/admin/recorded-courses/${courseId}/batches`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   getBatchVideos: (courseId: string, batchId: string) =>
//     request<AdminBatchVideosResponse>(
//       `/api/admin/recorded-courses/${courseId}/batches/${encodeURIComponent(batchId)}/videos`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   uploadVideo: (
//     courseId: string,
//     batchId: string,
//     payload: { title: string; description?: string; video: File }
//   ) => {
//     const fd = new FormData();
//     fd.append("title", payload.title);
//     if (payload.description) fd.append("description", payload.description);
//     fd.append("video", payload.video);
//     return requestMultipart<AdminBatchVideoSingleResponse>(
//       `/api/admin/recorded-courses/${courseId}/batches/${encodeURIComponent(batchId)}/videos`,
//       fd,
//       "POST",
//       getAdminToken() ?? getToken()
//     );
//   },

//   deleteVideo: (videoId: string) =>
//     request<{ success: boolean; message?: string }>(
//       `/api/admin/recorded-videos/${videoId}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),

//   getStreamUrl: (videoId: string) =>
//     `${BASE_URL}/api/admin/recorded-videos/${videoId}/stream?token=${encodeURIComponent(
//       getAdminToken() ?? getToken() ?? ""
//     )}`,
// };


// export interface FeeInstallmentRecord {
//   _id: string;
//   installmentNumber: number;
//   dueDate: string;
//   paidDate?: string | null;
//   amount: number;
//   paidAmount: number;
//   remainingAmount: number;
//   status: "pending" | "partial" | "paid" | "overdue";
//   payments?: { _id: string; amount: number; paidAt: string; paymentMethod: string }[];
// }

// interface InstallmentListResponse { success: boolean; data: FeeInstallmentRecord[]; }
// interface InstallmentSingleResponse { success: boolean; message?: string; data: FeeInstallmentRecord; }

// export const feeInstallmentApi = {
//   getAll: (studentId: string) =>
//     request<InstallmentListResponse>(
//       `/api/admin/students/${studentId}/fee/installments`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   add: (studentId: string, payload: { amount: number; dueDate: string }) =>
//     request<InstallmentSingleResponse>(
//       `/api/admin/students/${studentId}/fee/installments`,
//       { method: "POST", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   update: (studentId: string, installmentId: string, payload: { amount?: number; dueDate?: string }) =>
//     request<InstallmentSingleResponse>(
//       `/api/admin/students/${studentId}/fee/installments/${installmentId}`,
//       { method: "PUT", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   remove: (studentId: string, installmentId: string) =>
//     request<{ success: boolean; message?: string }>(
//       `/api/admin/students/${studentId}/fee/installments/${installmentId}`,
//       { method: "DELETE" },
//       getAdminToken() ?? getToken()
//     ),
// };




// export const supabase = supabaseCompat;






const VITE_API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
export const BASE_URL = VITE_API_BASE?.trim() || "https://slateserver1.onrender.com";

if (!VITE_API_BASE) {
  console.warn(
    "VITE_API_BASE is not set in .env. Falling back to https://slateserver1.onrender.com."
  );
}

// ---------- token helpers ----------
export const getToken = (): string | null => localStorage.getItem("token");
export const setToken = (t: string) => localStorage.setItem("token", t);
export const removeToken = () => localStorage.removeItem("token");

export const getAdminToken = (): string | null => localStorage.getItem("adminToken");
export const setAdminToken = (t: string) => localStorage.setItem("adminToken", t);
export const removeAdminToken = () => localStorage.removeItem("adminToken");



// ---------- typed API error ----------
export class ApiError extends Error {
  errorCode?: string;
  data?: any;
  status?: number;

  constructor(message: string, errorCode?: string, data?: any, status?: number) {
    super(message);
    this.name = "ApiError";
    this.errorCode = errorCode;
    this.data = data;
    this.status = status;
  }
}

// ---------- core fetch ----------
// async function request<T>(
//   path: string,
//   options: RequestInit = {},
//   token?: string | null
// ): Promise<T> {
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     ...(options.headers as Record<string, string>),
//   };
//   const t = token !== undefined ? token : getToken();
//   if (t) headers["Authorization"] = `Bearer ${t}`;

//   const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

//   if (!res.ok) {
//     const err = await res.json().catch(() => ({ message: res.statusText }));
//     throw new Error(err.message || "Request failed");
//   }
//   return res.json() as Promise<T>;
// }


// async function request<T>(
//   path: string,
//   options: RequestInit = {},
//   token?: string | null
// ): Promise<T> {
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     ...(options.headers as Record<string, string>),
//   };
//   const t = token !== undefined ? token : getToken();
//   if (t) headers["Authorization"] = `Bearer ${t}`;

//   const res = await fetch(`${BASE_URL}${path}`, {
//     ...options,
//     headers,
//     cache: "no-store",   // 👈 add this
//   });

//   if (!res.ok) {
//     const err = await res.json().catch(() => ({ message: res.statusText }));
//     throw new Error(err.message || "Request failed");
//   }
//   return res.json() as Promise<T>;
// }

export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const t = token !== undefined ? token : getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    // NEW: preserve errorCode + data (e.g. FEE_PENDING payload) on the thrown error
    throw new ApiError(err.message || "Request failed", err.errorCode, err.data, res.status);
  }
  return res.json() as Promise<T>;
}
// Multipart helper (for profile photo/govt-id uploads)
// async function requestMultipart<T>(
//   path: string,
//   formData: FormData,
//   method: "POST" | "PUT" = "POST",
//   token?: string | null
// ): Promise<T> {
//   const t = token !== undefined ? token : getToken();
//   const headers: Record<string, string> = {};
//   if (t) headers["Authorization"] = `Bearer ${t}`;

//   const res = await fetch(`${BASE_URL}${path}`, {
//     method,
//     body: formData,
//     headers,
//   });

//   if (!res.ok) {
//     const err = await res.json().catch(() => ({ message: res.statusText }));
//     throw new Error(err.message || "Request failed");
//   }
//   return res.json() as Promise<T>;
// }

async function requestMultipart<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PUT" = "POST",
  token?: string | null
): Promise<T> {
  const t = token !== undefined ? token : getToken();
  const headers: Record<string, string> = {};
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    body: formData,
    headers,
    cache: "no-store",   // 👈 add this
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json() as Promise<T>;
}
// ─────────────────────────────────────────────────────────────
//  AUTH  (student + staff)
// ─────────────────────────────────────────────────────────────
export interface AuthUser {
  [x: string]: any;
  id: string;
  email: string;
  name: string;
  fullName: string;
  displayName: string;
  role: "student" | "admin" | "super_admin" | "counsellor" | "mentor" | "accountant" | "coordinator" | "hr" | "receptionist";
  studentId?: string | null;
  status?: string;
  profileCompleted?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: RawAuthUser;
}

interface RawAuthUser {
  _id?: string;
  id?: string;
  email: string;
  name?: string;
  fullName?: string;
  displayName?: string;
  role: "student" | "admin" | "super_admin" | "counsellor" | "mentor" | "accountant" | "coordinator" | "hr" | "receptionist";
  studentId?: string | null;
  status?: string;
  profileCompleted?: boolean;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: RawAuthUser;
}

interface ProfileResponse {
  success: boolean;
  data: RawAuthUser;
}

const normalizeAuthUser = (user: RawAuthUser): AuthUser => ({
  id: (user._id || user.id) as string,
  email: user.email,
  name: user.name ?? user.fullName ?? "",
  fullName: user.fullName ?? user.name ?? "",
  displayName: user.fullName || user.name || user.displayName || "",
  role: user.role,
  studentId: user.studentId ?? null,
  status: user.status,
  profileCompleted: user.profileCompleted ?? false,
});

export const authApi = {
  signup: (displayName: string, email: string, password: string) =>
    request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: displayName,
        fullName: displayName,
        email,
        password,
      }),
    }),

  login: async (identifier: string, password: string) => {
    const response = await request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: identifier.trim(), password }),
    });
    return {
      ...response,
      user: normalizeAuthUser(response.user),
    };
  },

  me: async (): Promise<AuthUser> => {
    const response = await request<ProfileResponse>("/api/auth/profile");
    return normalizeAuthUser(response.data);
  },

  adminLogin: async (email: string, password: string) => {
    const response = await request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: email.trim(), password }),
    });
    return {
      ...response,
      user: normalizeAuthUser(response.user),
    };
  },

 forgotPassword: (email: string) =>
  request<{ success: boolean; message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  }),

verifyResetOtp: (email: string, otp: string) =>
  request<{ success: boolean; valid: boolean; message?: string }>("/api/auth/verify-reset-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  }),

verifyResetToken: (token: string) =>
  request<{ success: boolean; valid: boolean; message?: string }>("/api/auth/verify-reset-token", {
    method: "POST",
    body: JSON.stringify({ token }),
  }),

resetPassword: (...args: [string, string, string] | [string, string]) => {
  if (args.length === 2) {
    const [resetToken, password] = args;
    return request<{ success: boolean; message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: resetToken, password }),
    });
  }

  const [email, otp, password] = args;
  return request<{ success: boolean; message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, password }),
  });
},
};

export interface OtpResponse {
  success: boolean;
  message: string;
}

export const otpApi = {
  sendOtp: (email: string) =>
    request<OtpResponse>("/api/email-otp/send", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, otp: string) =>
    request<OtpResponse>("/api/email-otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),
};

// ─────────────────────────────────────────────────────────────
//  COURSES
// ─────────────────────────────────────────────────────────────
export interface Course {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  image_url?: string;
  price?: number;
  category?: string;
  level?: string | null;
  duration?: string | null;
  total_modules?: number;
  isPublished?: boolean;
  is_published?: boolean;
  createdBy?: string | { _id: string; name: string; email: string };
  created_at?: string;
  createdAt?: string;
}

interface CoursesListResponse {
  success: boolean;
  count: number;
  data: Course[];
}

interface SingleCourseResponse {
  success: boolean;
  data: Course;
}

export const coursesApi = {
  getAll: async (): Promise<Course[]> => {
    const response = await request<CoursesListResponse>("/api/courses");
    return response.data ?? [];
  },

  getById: async (id: string): Promise<Course> => {
    const response = await request<SingleCourseResponse>(`/api/courses/${id}`);
    return response.data;
  },

  create: (data: Partial<Course>) =>
    request<SingleCourseResponse>(
      "/api/courses/create",
      { method: "POST", body: JSON.stringify(data) },
      getAdminToken() ?? getToken()
    ),

  update: (id: string, data: Partial<Course>) =>
    request<SingleCourseResponse>(
      `/api/courses/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      getAdminToken() ?? getToken()
    ),

  delete: (id: string) =>
    request<{ success: boolean }>(
      `/api/courses/${id}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),
};

// ─────────────────────────────────────────────────────────────
//  ENROLLMENTS
// ─────────────────────────────────────────────────────────────
export interface EnrolledCourse {
  id: string;
  _id?: string;
  title: string;
  category?: string;
  level?: string | null;
  duration?: string | null;
  progress?: number;
  total_modules?: number;
  completed_modules?: number;
  image_url?: string | null;
  thumbnail_url?: string | null;
  thumbnail?: string | null;
}

interface EnrollResponse {
  success: boolean;
  message: string;
  enrollment: {
    _id: string;
    student: string;
    course: string;
    status: string;
    enrolledAt: string;
  };
  payment: {
    _id: string;
    student: string;
    course: string;
    amount: number;
    transactionId: string;
    paymentStatus: string;
  };
}

export const enrollmentsApi = {
  enroll: (courseId: string) =>
    request<EnrollResponse>(`/api/enrollments/${courseId}`, { method: "POST" }),

  getMyEnrollments: () => request<EnrolledCourse[]>("/api/enrollments/me"),

  updateProgress: (courseId: string, progress: number, completed_modules: number) =>
    request<{ success: boolean }>(`/api/enrollments/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify({ progress, completed_modules }),
    }),

  getAll: () =>
    request<Array<EnrolledCourse & { userId: string; userEmail: string }>>(
      "/api/enrollments",
      {},
      getAdminToken() ?? getToken()
    ),
};

// ─────────────────────────────────────────────────────────────
//  ADMIN – dashboard & users
// ─────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  created_at: string;
  enrollmentCount: number;
}

export interface AdminDashboardStats {
  totalStudents?: number;
  pendingApprovals?: number;
  approvedStudents?: number;
  rejectedStudents?: number;
  totalCourses?: number;
  totalMentors?: number;
  totalEnrollments?: number;
  totalAssignments?: number;
  totalRevenue?: number;
  pendingFees?: number;
  completionRate?: number;
  totalAdmins?: number;
  recentLeads?: DashboardLead[];
  pendingFollowUps?: DashboardFollowUp[];
  leadSources?: LeadSourceStat[];
  coursePerformance?: CoursePerformanceStat[];
}

interface AdminDashboardResponse {
  success: boolean;
  stats?: AdminDashboardStats;
  data?: AdminDashboardStats;
}

export const adminApi = {
  getDashboard: async () => {
    const response = await request<AdminDashboardResponse>(
      "/api/admin/dashboard",
      {},
      getAdminToken() ?? getToken()
    );
    const stats = response.stats ?? response.data ?? {};
    return {
      totalStudents: stats.totalStudents ?? 0,
      totalAdmins: stats.totalAdmins ?? 0,
      pendingApprovals: stats.pendingApprovals ?? 0,
      approvedStudents: stats.approvedStudents ?? 0,
      rejectedStudents: stats.rejectedStudents ?? 0,
      totalCourses: stats.totalCourses ?? 0,
      totalMentors: stats.totalMentors ?? 0,
      totalEnrollments: stats.totalEnrollments ?? 0,
      totalAssignments: stats.totalAssignments ?? 0,
      totalRevenue: stats.totalRevenue ?? 0,
      pendingFees: stats.pendingFees ?? 0,
      completionRate: stats.completionRate ?? 0,
    };
  },

  getUsers: () =>
    request<AdminUser[]>("/api/admin/users", {}, getAdminToken() ?? getToken()),

  deleteUser: (id: string) =>
    request<{ success: boolean }>(
      `/api/admin/users/${id}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),

  getStats: () => adminApi.getDashboard(),
};

// ─────────────────────────────────────────────────────────────
//  ADMIN – student approval workflow + add/edit/delete student
// ─────────────────────────────────────────────────────────────
export interface PendingStudent {
  _id: string;
  fullName: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  studentId?: string | null;
  createdAt: string;
}

interface PendingStudentsResponse {
  success: boolean;
  count: number;
  data: PendingStudent[];
}

interface ApproveStudentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    fullName: string;
    email: string;
    studentId: string;
    status: string;
  };
}

export interface AddStudentPayload {
  fullName: string;
  email: string;
  password?: string;
  sendEmail?: boolean;
  branch?: string;
}

export interface AddStudentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    fullName: string;
    email: string;
    studentId: string;
    status: string;
    role: string;
  };
  credentials: {
    studentId: string;
    password: string;
  };
  emailSent: boolean;
  emailError?: string | null;
}

export interface UpdateStudentProfilePayload {
  fullName?: string;
  mobileNumber?: string;
  dob?: string;
  fatherName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  govtIdType?: string;
  govtIdNumber?: string;
}

export const studentApprovalApi = {
  getPending: () =>
    request<PendingStudentsResponse>(
      "/api/admin/students/pending",
      {},
      getAdminToken() ?? getToken()
    ),

  approve: (id: string) =>
    request<ApproveStudentResponse>(
      `/api/admin/students/${id}/approve`,
      { method: "PATCH" },
      getAdminToken() ?? getToken()
    ),

  reject: (id: string) =>
    request<{ success: boolean; message: string }>(
      `/api/admin/students/${id}/reject`,
      { method: "PATCH" },
      getAdminToken() ?? getToken()
    ),

  addStudent: (payload: AddStudentPayload) =>
    request<AddStudentResponse>(
      "/api/admin/students",
      { method: "POST", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  deleteStudent: (id: string) =>
    request<{ success: boolean; message: string }>(
      `/api/admin/students/${id}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),

  updateStudentProfile: (id: string, payload: UpdateStudentProfilePayload) =>
    request<{ success: boolean; message: string; data: StudentProfile }>(
      `/api/admin/students/${id}/profile`,
      { method: "PUT", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),
};

// ─────────────────────────────────────────────────────────────
//  SITE CONTENT / STORAGE helpers
// ─────────────────────────────────────────────────────────────
export interface PageSection {
  id: string;
  page: string;
  section: string;
  type: string;
  content: any;
  order_index: number;
}

export const siteContentApi = {
  getSectionsByPage: (page: string) =>
    request<PageSection[]>(`/api/site-content?page=${encodeURIComponent(page)}`),

  getSection: (page: string, section: string) =>
    request<PageSection | null>(
      `/api/site-content/${encodeURIComponent(page)}/${encodeURIComponent(section)}`
    ),
};

export const storageApi = {
  getPublicUrl: (bucket: string, file: string) =>
    request<{ publicUrl: string }>(
      `/api/storage/public?bucket=${encodeURIComponent(bucket)}&file=${encodeURIComponent(file)}`
    ),

  uploadFile: (formData: FormData, token?: string | null) =>
    fetch(`${BASE_URL}/api/storage/upload`, {
      method: "POST",
      body: formData,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    }).then(async (r) => {
      if (!r.ok) {
        const errBody = await r.json().catch(() => ({ message: r.statusText }));
        throw new Error(errBody.message || "Upload failed");
      }
      return r.json();
    }),
};

// ─────────────────────────────────────────────────────────────
//  Legacy Supabase compat shim
// ─────────────────────────────────────────────────────────────
const unsupportedSupabase = () => {
  throw new Error(
    "Legacy Supabase compatibility layer: this page still uses Supabase APIs. Migrate it to the backend REST client."
  );
};

const supabaseCompat: any = {
  from: () => supabaseCompat,
  select: unsupportedSupabase,
  update: unsupportedSupabase,
  insert: unsupportedSupabase,
  delete: unsupportedSupabase,
  order: () => supabaseCompat,
  eq: () => supabaseCompat,
  in: () => supabaseCompat,
  or: () => supabaseCompat,
  single: unsupportedSupabase,
  maybeSingle: unsupportedSupabase,
  upsert: unsupportedSupabase,
  storage: {
    from: () => ({
      upload: unsupportedSupabase,
      getPublicUrl: async () => ({
        data: null,
        error: new Error("Legacy Supabase storage is not supported."),
      }),
      remove: unsupportedSupabase,
      createSignedUrl: async () => ({
        data: null,
        error: new Error("Legacy Supabase storage is not supported."),
      }),
    }),
  },
  auth: {
    resetPasswordForEmail: unsupportedSupabase,
    getUser: unsupportedSupabase,
  },
};

// ── MENTORS ──
export interface Mentor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  photoUrl?: string;
  isActive?: boolean;
}
interface MentorsListResponse { success: boolean; count: number; data: Mentor[]; }
interface MentorResponse { success: boolean; message?: string; data: Mentor; }

export const mentorApi = {
  getAll: async (): Promise<Mentor[]> => {
    const res = await request<MentorsListResponse>(
      "/api/mentors",
      {},
      getAdminToken() ?? getToken()
    );
    return res.data ?? [];
  },
  create: (data: Partial<Mentor>) =>
    request<MentorResponse>(
      "/api/mentors",
      { method: "POST", body: JSON.stringify(data) },
      getAdminToken() ?? getToken()
    ),
  update: (id: string, data: Partial<Mentor>) =>
    request<MentorResponse>(
      `/api/mentors/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      getAdminToken() ?? getToken()
    ),
  remove: (id: string) =>
    request<{ success: boolean }>(
      `/api/mentors/${id}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),
};

// ── COURSE/MENTOR ASSIGNMENT ──
// export interface StudentAssignment {
//   _id?: string;
//   course: Course | string;
//   mentor?: Mentor | string | null;
//   status: "active" | "completed" | "dropped";
//   assignedAt?: string;
// }

export interface StudentAssignment {
  _id?: string;
  course: Course | string;
  mentor?: Mentor | string | null;
  status: "active" | "completed" | "dropped";
  assignedAt?: string;
  batch?: {
    days: "MTW" | "MWT" | "MTT" | "SS";
   time: "10:00-12:00" | "12:00-2:00" | "2:30-4:30" | "4:30-6:30"
  } | null;
}

interface AssignmentResponse { success: boolean; message?: string; data: StudentAssignment | null; }

// export const assignmentApi = {
//   assign: (studentId: string, course: string, mentor?: string) =>
//     request<AssignmentResponse>(
//       `/api/admin/students/${studentId}/assign`,
//       { method: "PATCH", body: JSON.stringify({ course, mentor }) },
//       getAdminToken() ?? getToken()
//     ),
//   getMine: () => request<AssignmentResponse>("/api/student/assignment"),
// };


export interface AssignBatchPayload {
  days: "MTW" | "MWT" | "MTT" | "SS";
 time: "10:00-12:00" | "12:00-2:00" | "2:30-4:30" | "4:30-6:30"; 
}

export const assignmentApi = {
  assign: (studentId: string, course: string, mentor?: string, batch?: AssignBatchPayload) =>
    request<AssignmentResponse>(
      `/api/admin/students/${studentId}/assign`,
      { method: "PATCH", body: JSON.stringify({ course, mentor, batch }) },
      getAdminToken() ?? getToken()
    ),
  getMine: () => request<AssignmentResponse>("/api/student/assignment"),
};

// ─────────────────────────────────────────────────────────────
//  STUDENT PROFILE
// ─────────────────────────────────────────────────────────────
export interface StudentProfile {
  _id?: string;
  student?: string;
  fullName: string;
  dob?: string;
  fatherName?: string;
    gender?: string;     
  mobileNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
    qualification?: string;        
  college?: string;                
  degree?: string;               
  passingYear?: string;           
  govtIdType?: string;
  govtIdNumber?: string;
  govtIdImageUrl?: string;
  govtIdImagePublicId?: string;
  preferredCourse?: string | { _id: string; title: string; category?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface StudentProfileResponse {
  success: boolean;
  message?: string;
  data: StudentProfile | null;
}

export const studentProfileApi = {
  getMine: () => request<StudentProfileResponse>("/api/student/profile"),
  create: (formData: FormData) =>
    requestMultipart<StudentProfileResponse>("/api/student/profile", formData, "POST"),
  update: (formData: FormData) =>
    requestMultipart<StudentProfileResponse>("/api/student/profile", formData, "PUT"),
};

// ── ADMIN: full student details ──
export interface AdminStudentDetails {
  success: boolean;
  student: AdminUser & {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    studentId?: string;
    status?: string;
    approvedAt?: string;
    createdAt?: string;
  };
  profile: StudentProfile | null;
  assignment: StudentAssignment | null;
  fee: Fee | null;
  payments: PaymentRecord[];
}

// ── NEW: Fee Collection Counsellor assignment (student-level) ──────────────
export interface AssignStudentFeeCollectionPayload {
  feeCollectionCounsellorId: string | null;
  reason?: string;
}

export interface AssignFeeCollectionResult {
  success: boolean;
  message: string;
  data?: AdminStudentDetails["student"] & {
    feeCollectionCounsellor?: { _id: string; fullName: string; email: string } | null;
  };
}

export const adminStudentApi = {
  getById: (id: string) =>
    request<AdminStudentDetails>(
      `/api/admin/students/${id}`,
      {},
      getAdminToken() ?? getToken()
    ),

  // NEW
  assignFeeCollection: (id: string, payload: AssignStudentFeeCollectionPayload) =>
    request<AssignFeeCollectionResult>(
      `/api/admin/students/${id}/assign-fee-collection`,
      { method: "PATCH", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),
};
// ── FEES ──
export interface Fee {
  nextDueDate: string | null;
  _id?: string;
  totalFees: number;
  paymentMode: "full" | "emi";
  emiMonths?: number | null;
  monthlyEmiAmount?: number | null;
  totalPaid: number;
  remainingAmount: number;
  course?: string | { _id: string; title: string; price?: number } | null;
}

interface FeeResponse {
  success: boolean;
  message?: string;
  data: Fee | null;
  payments?: PaymentRecord[];
}

// interface FeeSetupPayload {
//   totalFees: number;
//   paymentMode: "full" | "emi";
//   emiMonths?: number;
//   nextDueDate?: string | null;
//   course?: string;
//   payments?: { amount: number; paymentMethod?: string; transactionId?: string }[];
// }


interface FeeSetupPayload {
  totalFees: number;
  paymentMode: "full" | "emi";
  emiMonths?: number;
  nextDueDate?: string | null;
  course?: string;
  payments?: { amount: number; paymentMethod?: string; transactionId?: string }[];
  installments?: { installmentNumber: number; amount: number; dueDate: string }[];
  registrationPayment?: {             
    amount: number;
    paymentMethod?: string;
    transactionId?: string;
    paidAt?: string;
  };
}
export const feeApi = {
  setup: (studentId: string, payload: FeeSetupPayload) =>
    request<FeeResponse>(
      `/api/admin/students/${studentId}/fee`,
      { method: "POST", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  getByStudent: (studentId: string) =>
    request<FeeResponse>(
      `/api/admin/students/${studentId}/fee`,
      {},
      getAdminToken() ?? getToken()
    ),

  getMine: () => request<FeeResponse>("/api/student/fee"),
};

// ─────────────────────────────────────────────────────────────
//  PAYMENTS
// ─────────────────────────────────────────────────────────────
export interface PaymentRecord {
  _id: string;
  student?: string;
  fee?: string;
  course?: string | { _id: string; title: string };
  paymentNumber: number;
  amount: number;
  paymentMethod: "Cash" | "UPI" | "Bank Transfer" | "Card" | "Cheque" | "Other" | string;
  transactionId?: string | null;
  paymentStatus: "pending" | "success" | "failed";
  paidAt: string;
  isRegistrationPayment?: boolean;
  recordedBy?: string;
  createdAt?: string;
}

interface PaymentsListResponse { success: boolean; data: PaymentRecord[]; }
interface AddPaymentResponse {
  success: boolean;
  message: string;
  data: PaymentRecord;
  fee: Fee;
}

// export const paymentApi = {
//   // FIX: correct endpoint is /payment (singular), not /payments
//   getByStudent: (studentId: string) =>
//     request<PaymentsListResponse>(
//       `/api/admin/students/${studentId}/payment`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

// add: (
//   studentId: string,
//   payload: {
//     amount: number;
//     paymentMethod?: string;
//     transactionId?: string;
//     paidAt?: string;
//     installmentId?: string; 
//   }
// ) =>
//   request<AddPaymentResponse>(
//     `/api/admin/students/${studentId}/payment`,
//     { method: "POST", body: JSON.stringify(payload) },
//     getAdminToken() ?? getToken()
//   ),

//   getMine: () => request<PaymentsListResponse>("/api/student/payment"),
// };

// ─────────────────────────────────────────────────────────────
//  STUDENT DASHBOARD
// ─────────────────────────────────────────────────────────────
// export interface StudentDashboardData {
//   success: boolean;
//   myCourses?: number;
//   totalSpent?: number;
//   courses?: EnrolledCourse[];
//   payments?: PaymentRecord[];
//   profile: StudentProfile | null;
//   assignment: StudentAssignment | null;
//   fee: Fee | null;
//   feePayments: PaymentRecord[];
// }

export const paymentApi = {
  getByStudent: (studentId: string) =>
    request<PaymentsListResponse>(`/api/admin/students/${studentId}/payment`, {}, getAdminToken() ?? getToken()),

  add: (studentId: string, payload: {
    amount: number; paymentMethod?: string; transactionId?: string; paidAt?: string; installmentId?: string;
  }) =>
    request<AddPaymentResponse>(
      `/api/admin/students/${studentId}/payment`,
      { method: "POST", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  // NEW — Super Admin only; backend enforces the role, but hide the button client-side too
  remove: (studentId: string, paymentId: string) =>
    request<{ success: boolean; message: string; data?: any }>(
      `/api/admin/students/${studentId}/payment/${paymentId}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),

  getMine: () => request<PaymentsListResponse>("/api/student/payment"),
};

export interface StudentDashboardData {
  success: boolean;
  student?: { fullName: string; email: string; studentId: string | null; profileCompleted?: boolean } | null; // NEW
  myCourses?: number;
  totalSpent?: number;
  courses?: EnrolledCourse[];
  payments?: PaymentRecord[];
  profile: StudentProfile | null;
  assignment: StudentAssignment | null;
  fee: Fee | null;
  feePayments: PaymentRecord[];

   statCards: StatCardData[];
  snapshotStats: SnapshotStatData[];
  streak: { days: boolean[]; currentStreak: number };
  roadmap: RoadmapItemData[];
  attendanceTrend: AttendanceTrendPoint[];
  attendancePercent: number;
  nextClass: NextClassData | null;
  hasCourseAssigned: boolean;
}



export interface StatCardData {
  label: string;
  value: string;
  note: string;
  key: "course" | "attendance" | "portfolio" | "placement" | "fees" | "nextClass";
}

export interface SnapshotStatData {
  label: string;
  value: number;
  color: string;
}

export interface RoadmapItemData {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "locked";
  progress: number;
  lastAccess: string | null;
  feedback: string | null;
}

export interface AttendanceTrendPoint {
  month: string;
  attendance: number;
}

export interface NextClassData {
  status: "upcoming" | "live" | "completed";
  dateLabel: string;
  timeLabel: string;
  moduleTitle: string;
}

export const studentDashboardApi = {
  getMine: () => request<StudentDashboardData>("/api/student/dashboard"),
};

// ─────────────────────────────────────────────────────────────
//  DASHBOARD ANALYTICS
// ─────────────────────────────────────────────────────────────
export interface DashboardLead {
  _id: string;
  fullName: string;
  course: string | { _id: string; title: string; slug?: string; category?: string };
  source: string;
  leadStatus: string;
  createdAt: string;
}

export interface DashboardFollowUp {
  _id: string;
  fullName: string;
  mobileNumber?: string;
  course: string | { _id: string; title: string; slug?: string; category?: string };
  nextFollowUpDate: string;
  leadStatus: string;
  assignedTo?: string | null;
  isOverdue?: boolean;
}

export interface LeadSourceStat {
  source: string;
  value: number;
}

export interface CoursePerformanceStat {
  course: string;
  students: number;
  completion: number;
  rating: number;
}

export interface RevenueStat {
  month: string;
  revenue: number;
  students: number;
} 

export interface RecentPaymentRecord {
  _id: string;
  amount: number;
  status: string;
  paidAt?: string;
  student?: { fullName?: string; email?: string } | string | null;
  course?: { title?: string } | string | null;
}

interface DashboardLeadsResponse {
  success: boolean;
  leads?: DashboardLead[];
  data?: DashboardLead[];
  pagination?: { total: number; totalPages: number };
}

interface DashboardFollowUpsResponse {
  success: boolean;
  data: DashboardFollowUp[];
}

interface LeadSourcesResponse {
  success: boolean;
  data: LeadSourceStat[];
}

interface CoursePerformanceResponse {
  success: boolean;
  data: CoursePerformanceStat[];
}

interface RevenueSeriesResponse {
  success: boolean;
  data: RevenueStat[];
}

interface RecentPaymentsResponse {
  success: boolean;
  data: RecentPaymentRecord[];
  pagination?: { total: number; totalPages: number };
} 
// ── dashboardExtApi — full object (replaces the existing one) ─────────────────
 
export const dashboardExtApi = {
  getRecentLeads: async (): Promise<DashboardLead[]> => {
    const res = await request<DashboardLeadsResponse>(
      "/api/leads?page=1&limit=5",
      {},
      getAdminToken() ?? getToken()
    );
    return res.leads ?? res.data ?? [];
  },
 
  // getPendingFollowUps: async (): Promise<DashboardFollowUp[]> => {
  //   const now = new Date();
  //   const [todayRes, overdueRes] = await Promise.allSettled([
  //     request<DashboardFollowUpsResponse>(
  //       "/api/leads/followups/all?filter=today",
  //       {},
  //       getAdminToken() ?? getToken()
  //     ),
  //     request<DashboardFollowUpsResponse>(
  //       "/api/leads/followups/all?filter=overdue",
  //       {},
  //       getAdminToken() ?? getToken()
  //     ),
  //   ]);
 
  //   const todayItems   = todayRes.status   === "fulfilled" ? (todayRes.value.data   ?? []) : [];
  //   const overdueItems = overdueRes.status === "fulfilled" ? (overdueRes.value.data ?? []) : [];
 
  //   const seen   = new Set<string>();
  //   const merged: DashboardFollowUp[] = [];
  //   for (const item of [...overdueItems, ...todayItems]) {
  //     if (seen.has(item._id)) continue;
  //     seen.add(item._id);
  //     merged.push({
  //       ...item,
  //       isOverdue: item.nextFollowUpDate
  //         ? new Date(item.nextFollowUpDate) < now
  //         : false,
  //     });
  //   }
  //   return merged.slice(0, 5);
  // },
 

    getPendingFollowUps: async (): Promise<DashboardFollowUp[]> => {
    const res = await request<DashboardFollowUpsResponse>(
      "/api/leads/followups/dashboard-pending",
      {},
      getAdminToken() ?? getToken()
    );
    return res.data ?? [];
  },

  getLeadSources: async (): Promise<LeadSourceStat[]> => {
    const res = await request<LeadSourcesResponse>(
      "/api/admin/analytics/lead-sources",
      {},
      getAdminToken() ?? getToken()
    );
    return res.data ?? [];
  },
 
  getCoursePerformance: async (): Promise<CoursePerformanceStat[]> => {
    const res = await request<CoursePerformanceResponse>(
      "/api/admin/analytics/course-performance",
      {},
      getAdminToken() ?? getToken()
    );
    return res.data ?? [];
  },
 
  // ── NEW ────────────────────────────────────────────────────────────────────
 
  /**
   * Returns last 12 months of monthly revenue + new-student counts.
   * Backed by GET /api/admin/analytics/revenue-series
   */
  getRevenueSeries: async (): Promise<RevenueStat[]> => {
    const res = await request<RevenueSeriesResponse>(
      "/api/admin/analytics/revenue-series",
      {},
      getAdminToken() ?? getToken()
    );
    return res.data ?? [];
  },
 
  /**
   * Returns the most recent successful payments (global, not per-student).
   * Backed by GET /api/fee-collection/recent-payments (already exists).
   */
  getRecentPayments: async (limit = 5): Promise<RecentPaymentRecord[]> => {
    const res = await request<RecentPaymentsResponse>(
      `/api/fee-collection/recent-payments?limit=${limit}&page=1`,
      {},
      getAdminToken() ?? getToken()
    );
    return res.data ?? [];
  },
}



// ─────────────────────────────────────────────────────────────
//  PORTFOLIO  (student + admin)
//  Paste this block into client.ts — anywhere after the `request`
//  and `requestMultipart` function definitions (e.g. right before
//  `export const supabase = supabaseCompat;` at the end of the file).
//  It reuses the same `request()` helper, `getToken()`/`getAdminToken()`
//  pattern as every other section above, so no new dependencies.
// ─────────────────────────────────────────────────────────────

export interface PortfolioImage {
  url: string;
  publicId: string;
}

export type PortfolioCategory = "Design" | "Marketing" | "3D" | "Data" | "Tech";

// export type PortfolioStatus =
//   | "draft"
//   | "pending"
//   | "approved"
//   | "rejected"
//   | "needs_changes"
//   | "published"
//   | "archived";

export type PortfolioStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "published"
  | "archived";
// export interface Portfolio {
//   _id: string;
//   student: string | { _id: string; fullName: string; email: string };
//   course: string | { _id: string; title: string; category: string };
//   courseTitle: string;
//   category: PortfolioCategory;
//   title: string;
//   slug: string;
//   description: string;
//   thumbnail?: PortfolioImage | null;
//   gallery: PortfolioImage[];
//   githubUrl: string;
//   liveUrl: string;
//   figmaUrl: string;
//   behanceUrl: string;
//   videoUrl: string;
//   driveUrl: string;
//   technologies: string[];
//   tags: string[];
//   status: PortfolioStatus;
//   featured: boolean;
//   adminRemarks: string;
//   approvedBy?: { _id: string; fullName: string; email: string } | null;
//   approvedAt?: string | null;
//   publishedAt?: string | null;
//   views: number;
//   likes: number;
//   createdAt: string;
//   updatedAt: string;
// }


// UPDATE the Portfolio interface:
export interface Portfolio {
  _id: string;
  student: string | { _id: string; fullName: string; email: string } | null;
  externalStudent: boolean;
  studentName?: string;
  studentEmail?: string;
  studentBatch?: string;
    studentPhoto?: PortfolioImage | null;   
  studentReview?: string;               
  course: string | { _id: string; title: string; category: string };
  courseTitle: string;
  category: PortfolioCategory;
  title: string;
  slug: string;
  description: string;
  thumbnail?: PortfolioImage | null;
  gallery: PortfolioImage[];
  githubUrl: string;
  liveUrl: string;
  figmaUrl: string;
  behanceUrl: string;
  videoUrl: string;
  driveUrl: string;
  technologies: string[];
  tags: string[];
  status: PortfolioStatus;
  featured: boolean;
  adminRemarks: string;
  approvedBy?: { _id: string; fullName: string; email: string } | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

// ADD:
export interface ExternalPortfolioPayload {
  studentName: string;
  studentEmail?: string;
  studentBatch?: string;
    studentPhoto?: PortfolioImage | null;   
  studentReview?: string;                  
  course: string;
  title: string;
  description: string;
  thumbnail?: PortfolioImage | null;
  gallery?: PortfolioImage[];
  githubUrl?: string;
  liveUrl?: string;
  figmaUrl?: string;
  behanceUrl?: string;
  videoUrl?: string;
  driveUrl?: string;
  technologies?: string[];
  tags?: string[];
  featured?: boolean;
  publish?: boolean;
}

export interface PortfolioFormPayload {
  title: string;
  description: string;
  thumbnail?: PortfolioImage | null;
  gallery?: PortfolioImage[];
  githubUrl?: string;
  liveUrl?: string;
  figmaUrl?: string;
  behanceUrl?: string;
  videoUrl?: string;
  driveUrl?: string;
  technologies?: string[];
  tags?: string[];
}

interface PortfolioListResponse {
  success: boolean;
  data: Portfolio[];
}

interface SinglePortfolioResponse {
  success: boolean;
  message?: string;
  data: Portfolio;
}

// ── STUDENT ──────────────────────────────────────────────────────────────
// Uses default token (getToken()) automatically, same as studentProfileApi.

// export interface StudentPortfolioPayload {
//   title: string;
//   description: string;
//   githubUrl?: string;
//   liveUrl?: string;
//   thumbnail?: PortfolioImage | null;
//   gallery?: PortfolioImage[];
// }

// Student can send these — technologies/tags are optional suggestions,
// admin can fully override them later.
export interface StudentPortfolioPayload {
  title: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  thumbnail?: PortfolioImage | null;
  gallery?: PortfolioImage[];
  technologies?: string[];
  tags?: string[];
  studentReview?: string; 
}

export interface PublicPortfolioListParams {
  page?: number;
  limit?: number;
  category?: PortfolioCategory | "";
  search?: string;
}

interface PublicPortfolioListResponse {
  success: boolean;
  portfolios: Portfolio[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const publicPortfolioApi = {
  getAll: (params: PublicPortfolioListParams = {}) =>
    request<PublicPortfolioListResponse>(`/api/portfolio${buildQuery(params)}`),
};


// export const portfolioApi = {
//   create: (payload: PortfolioFormPayload) =>
//     request<SinglePortfolioResponse>("/api/student/portfolio", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     }),

//   getMine: () => request<PortfolioListResponse>("/api/student/portfolio"),

//   update: (id: string, payload: Partial<PortfolioFormPayload>) =>
//     request<SinglePortfolioResponse>(`/api/student/portfolio/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(payload),
//     }),

//   remove: (id: string) =>
//     request<{ success: boolean; message?: string }>(`/api/student/portfolio/${id}`, {
//       method: "DELETE",
//     }),

//   submit: (id: string) =>
//     request<SinglePortfolioResponse>(`/api/student/portfolio/${id}/submit`, {
//       method: "PATCH",
//     }),
// };

// ── ADMIN ────────────────────────────────────────────────────────────────
// Passes getAdminToken() ?? getToken() explicitly, same as adminApi / feeApi.


export const portfolioApi = {
  create: (payload: StudentPortfolioPayload) =>
    request<SinglePortfolioResponse>("/api/student/portfolio", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMine: () => request<PortfolioListResponse>("/api/student/portfolio"),

  update: (id: string, payload: Partial<StudentPortfolioPayload>) =>
    request<SinglePortfolioResponse>(`/api/student/portfolio/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    request<{ success: boolean; message?: string }>(`/api/student/portfolio/${id}`, {
      method: "DELETE",
    }),

  submit: (id: string) =>
    request<SinglePortfolioResponse>(`/api/student/portfolio/${id}/submit`, {
      method: "PATCH",
    }),
};
export interface AdminPortfolioListParams {
  page?: number;
  limit?: number;
  status?: PortfolioStatus | "";
  category?: PortfolioCategory | "";
  search?: string;
}

interface AdminPortfolioListResponse {
  success: boolean;
  portfolios: Portfolio[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// const buildQuery = (params: Record<string, string | number | undefined>) => {
//   const usp = new URLSearchParams();
//   Object.entries(params).forEach(([k, v]) => {
//     if (v !== undefined && v !== "") usp.set(k, String(v));
//   });
//   const qs = usp.toString();
//   return qs ? `?${qs}` : "";
// };

const buildQuery = <T extends object>(params: T) => {
  const usp = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") {
      usp.set(k, String(v));
    }
  });

  const qs = usp.toString();
  return qs ? `?${qs}` : "";
};

export const adminPortfolioApi = {
  getAll: (params: AdminPortfolioListParams) =>
    request<AdminPortfolioListResponse>(
      `/api/admin/portfolio${buildQuery(params)}`,
      {},
      getAdminToken() ?? getToken()
    ),

  getById: (id: string) =>
    request<SinglePortfolioResponse>(
      `/api/admin/portfolio/${id}`,
      {},
      getAdminToken() ?? getToken()
    ),

    uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return requestMultipart<{ success: boolean; data: PortfolioImage }>(
      "/api/admin/portfolio/upload",
      fd,
      "POST",
      getAdminToken() ?? getToken()
    );
  },

  update: (id: string, payload: Partial<Portfolio>) =>
    request<SinglePortfolioResponse>(
      `/api/admin/portfolio/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  remove: (id: string) =>
    request<{ success: boolean; message?: string }>(
      `/api/admin/portfolio/${id}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),

  approve: (id: string) =>
    request<SinglePortfolioResponse>(
      `/api/admin/portfolio/${id}/approve`,
      { method: "PATCH" },
      getAdminToken() ?? getToken()
    ),

  reject: (id: string, remark: string) =>
    request<SinglePortfolioResponse>(
      `/api/admin/portfolio/${id}/reject`,
      { method: "PATCH", body: JSON.stringify({ remark }) },
      getAdminToken() ?? getToken()
    ),

  requestChanges: (id: string, remark: string) =>
    request<SinglePortfolioResponse>(
      `/api/admin/portfolio/${id}/request-changes`,
      { method: "PATCH", body: JSON.stringify({ remark }) },
      getAdminToken() ?? getToken()
    ),

  publish: (id: string) =>
    request<SinglePortfolioResponse>(
      `/api/admin/portfolio/${id}/publish`,
      { method: "PATCH" },
      getAdminToken() ?? getToken()
    ),

  unpublish: (id: string) =>
    request<SinglePortfolioResponse>(
      `/api/admin/portfolio/${id}/unpublish`,
      { method: "PATCH" },
      getAdminToken() ?? getToken()
    ),

  toggleFeatured: (id: string) =>
    request<SinglePortfolioResponse>(
      `/api/admin/portfolio/${id}/feature`,
      { method: "PATCH" },
      getAdminToken() ?? getToken()
    ),

  createExternal: (payload: ExternalPortfolioPayload) =>
    request<SinglePortfolioResponse>(
      "/api/admin/portfolio/external",
      { method: "POST", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),
};



// ─────────────────────────────────────────────────────────────
//  STUDENT DOCUMENTS
// ─────────────────────────────────────────────────────────────
export type DocumentSlotKey =
  | "aadhaar"
  | "pan"
  | "resume"
  | "offer_letter"
  | "passport_photo"
  | "course_certificate";

export interface StudentDocumentApiRecord {
  id: DocumentSlotKey;
  docId?: string | null;
  status: "empty" | "under_review" | "verified" | "action_required";
  fileType: "pdf" | "image" | "doc" | null;
  fileSize: number | null;
  uploadedAt: string | null;
  fileUrl: string | null;
  note: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

interface DocumentsListResponse {
  success: boolean;
  data: StudentDocumentApiRecord[];
}

interface SingleDocumentResponse {
  success: boolean;
  message?: string;
  data: StudentDocumentApiRecord;
}

export const studentDocumentApi = {
  getMine: () => request<DocumentsListResponse>("/api/student/documents"),

  upload: (type: DocumentSlotKey, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return requestMultipart<SingleDocumentResponse>(`/api/student/documents/${type}`, fd, "POST");
  },

  replace: (type: DocumentSlotKey, file: File) => {
    // same endpoint — backend upserts on (student, type)
    const fd = new FormData();
    fd.append("file", file);
    return requestMultipart<SingleDocumentResponse>(`/api/student/documents/${type}`, fd, "POST");
  },

  remove: (type: DocumentSlotKey) =>
    request<{ success: boolean; message?: string }>(`/api/student/documents/${type}`, {
      method: "DELETE",
    }),
};

// ── ADMIN: student document review ──
export const adminDocumentApi = {
  getByStudent: (studentId: string) =>
    request<DocumentsListResponse>(
      `/api/admin/students/${studentId}/documents`,
      {},
      getAdminToken() ?? getToken()
    ),

  verify: (studentId: string, type: DocumentSlotKey) =>
    request<SingleDocumentResponse>(
      `/api/admin/students/${studentId}/documents/${type}/verify`,
      { method: "PATCH" },
      getAdminToken() ?? getToken()
    ),

  requestAction: (studentId: string, type: DocumentSlotKey, note: string) =>
    request<SingleDocumentResponse>(
      `/api/admin/students/${studentId}/documents/${type}/request-action`,
      { method: "PATCH", body: JSON.stringify({ note }) },
      getAdminToken() ?? getToken()
    ),
};





// ─────────────────────────────────────────────────────────────
//  ASSIGNMENTS (submissions)
// ─────────────────────────────────────────────────────────────
export type AssignmentStatus = "Submitted" | "Under Review" | "Approved" | "Rejected";

export interface AssignmentFile {
  name: string;
  url: string;
  publicId: string;
  fileType: "image" | "pdf" | "raw" | "video";
  size: number;
}

export interface AssignmentRecord {
  _id: string;
  student: string | { _id: string; fullName: string; email: string; studentId?: string };
  title: string;
  description: string;
  category?: string;
  thumbnail?: string;
  files: AssignmentFile[];
  figmaLink?: string;
  githubLink?: string;
  liveLink?: string;
  driveLink?: string;
  notes?: string;
  status: AssignmentStatus;
  grade: string;
  feedback: string;
  reviewedBy?: string | { _id: string; fullName: string; role: string } | null;
  reviewedAt?: string | null;
  submittedDate: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentListResponse {
  success: boolean;
  data: AssignmentRecord[];
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

interface AssignmentSingleResponse {
  success: boolean;
  message?: string;
  data: AssignmentRecord;
}

export interface AssignmentCreatePayload {
  title: string;
  description: string;
  category?: string;
  figmaLink?: string;
  githubLink?: string;
  liveLink?: string;
  driveLink?: string;
  notes?: string;
  files?: File[];
}

const buildAssignmentFormData = (payload: AssignmentCreatePayload) => {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("description", payload.description);
  if (payload.category) fd.append("category", payload.category);
  if (payload.figmaLink) fd.append("figmaLink", payload.figmaLink);
  if (payload.githubLink) fd.append("githubLink", payload.githubLink);
  if (payload.liveLink) fd.append("liveLink", payload.liveLink);
  if (payload.driveLink) fd.append("driveLink", payload.driveLink);
  if (payload.notes) fd.append("notes", payload.notes);
  (payload.files || []).forEach((file) => fd.append("files", file));
  return fd;
};

export const assignmentSubmissionApi = {
  // Student
  create: (payload: AssignmentCreatePayload) =>
    requestMultipart<AssignmentSingleResponse>("/api/assignment-submissions", buildAssignmentFormData(payload), "POST"),

  getMine: () => request<AssignmentListResponse>("/api/assignment-submissions/mine"),

  update: (id: string, payload: Partial<AssignmentCreatePayload>) =>
    requestMultipart<AssignmentSingleResponse>(
      `/api/assignment-submissions/${id}`,
      buildAssignmentFormData(payload as AssignmentCreatePayload),
      "PUT"
    ),

  remove: (id: string) =>
    request<{ success: boolean; message?: string }>(`/api/assignment-submissions/${id}`, { method: "DELETE" }),

  getById: (id: string) => request<AssignmentSingleResponse>(`/api/assignment-submissions/${id}`),

  // Mentor / Admin / Super Admin
  getAll: (params: { page?: number; limit?: number; status?: string; search?: string; studentId?: string } = {}) =>
    request<AssignmentListResponse>(
      `/api/assignment-submissions${buildQuery(params)}`,
      {},
      getAdminToken() ?? getToken()
    ),

  review: (id: string, payload: { status?: AssignmentStatus; grade?: string; feedback?: string }) =>
    request<AssignmentSingleResponse>(
      `/api/assignment-submissions/${id}/review`,
      { method: "PATCH", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  adminDelete: (id: string) =>
    request<{ success: boolean; message?: string }>(
      `/api/assignment-submissions/admin/${id}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),
};



// ─────────────────────────────────────────────────────────────
//  MENTOR PORTAL  (the logged-in mentor's own dashboard data)
//  NOTE: distinct from `mentorApi` above, which is the admin-facing
//  CRUD for managing mentor *profiles*. This is the mentor's own view
//  of their assigned students/courses/assignments/classes.
// ─────────────────────────────────────────────────────────────

// export interface MentorDashboardStats {
//   assignedStudents: number;
//   pendingAssignments: number;
//   completedReviews: number;
//   activeCourses: number;
// }


export interface MentorDashboardStats {
  assignedStudents: number;
  totalStudents: number;
  totalBatches: number;
  activeCourses: number;
  pendingAssignments: number;
  completedReviews: number;
}

export interface MentorAssignmentRow {
  _id: string;
  studentName: string;
  studentId?: string | null;
  title: string;
  course?: string;
  status: "Submitted" | "Under Review" | "Approved" | "Rejected";
  submittedDate: string;
}

export interface MentorStudentRow {
  _id: string;
  fullName: string;
  email: string;
  studentId?: string | null;
  course?: string | null;
  progress: number;
  lastActivity?: string | null;
}

export interface MentorClassRow {
  _id: string;
  title: string;
  course?: string;
  date: string;
  time: string;
}

export interface MentorCourseRow {
  _id: string;
  title: string;
  category?: string;
  studentsCount: number;
}

// interface MentorDashboardResponse {
//   success: boolean;
//   data: {
//     stats: MentorDashboardStats;
//     recentAssignments: MentorAssignmentRow[];
//     students: MentorStudentRow[];
//     upcomingClasses: MentorClassRow[];
//   };
// }

interface MentorDashboardResponse {
  success: boolean;
  data: {
    stats: MentorDashboardStats;
    batches: MentorBatchRow[];
    recentAssignments: MentorAssignmentRow[];
    students: MentorStudentRow[];
    upcomingClasses: MentorClassRow[];
  };
}

interface MentorStudentsResponse {
  success: boolean;
  data: MentorStudentRow[];
}

interface MentorCoursesResponse {
  success: boolean;
  data: MentorCourseRow[];
}

interface MentorClassesResponse {
  success: boolean;
  data: MentorClassRow[];
}

// export const mentorDashboardApi = {
//   getDashboard: () => request<MentorDashboardResponse>("/api/mentor/dashboard"),
//   getStudents: () => request<MentorStudentsResponse>("/api/mentor/students"),
//   getCourses: () => request<MentorCoursesResponse>("/api/mentor/courses"),
//   getClasses: () => request<MentorClassesResponse>("/api/mentor/classes"),
// };


export interface MentorBatchRow {
  id: string;
  course: string;
  courseId: string;
  category?: string;
  batchDays: string | null;
  batchTime: string | null;
  totalStudents: number;
}

export interface MentorBatchStudentRow {
  name: string;
  email: string;
  studentId: string | null;
  progress: number;
  assignmentStatus: string;
}

export interface MentorBatchStudentsResponse {
  success: boolean;
  data: {
    batch: { course: string; days: string | null; time: string | null };
    students: MentorBatchStudentRow[];
  };
}

interface MentorBatchesResponse {
  success: boolean;
  data: MentorBatchRow[];
}

export const mentorDashboardApi = {
  getDashboard: () => request<MentorDashboardResponse>("/api/mentor/dashboard"),
  getStudents: () => request<MentorStudentsResponse>("/api/mentor/students"),
  getCourses: () => request<MentorCoursesResponse>("/api/mentor/courses"),
  getClasses: () => request<MentorClassesResponse>("/api/mentor/classes"),
  getBatches: () => request<MentorBatchesResponse>("/api/mentor/batches"),
  getBatchStudents: (id: string) =>
    request<MentorBatchStudentsResponse>(`/api/mentor/batches/${encodeURIComponent(id)}/students`),
};



// // ─────────────────────────────────────────────────────────────
// //  LIVE CLASSROOM  (Zoom-backed real-time sessions)
// // ─────────────────────────────────────────────────────────────
// export type LiveClassStatus = "scheduled" | "live" | "ended" | "cancelled";
// export type LiveBatchDays = "MTW" | "MWT" | "MTT" | "SS";
// export type LiveBatchTime = "10:00-12:00" | "12:00-2:00" | "2:30-4:30" | "4:30-6:30";

// export interface LiveClassRecord {
//   _id: string;
//   course: { _id: string; title: string } | string;
//   mentor: { _id: string; fullName: string } | string;
//   batch: { days: LiveBatchDays; time: LiveBatchTime };
//   title: string;
//   status: LiveClassStatus;
//   provider: string;
//   providerMeetingId?: string;
//   scheduledAt: string | null;
//   startedAt: string | null;
//   endedAt: string | null;
//   createdAt: string;
// }

// // export interface JoinLiveClassPayload {
// //   signature: string;
// //   providerMeetingId: string;
// //   password: string; 
// //   sdkKey: string;
// //   liveClassId: string;
// // }

// export interface JoinLiveClassPayload {
//   signature: string;
//   providerMeetingId: string;
//   password: string;
//   sdkKey: string;
//   liveClassId: string;
//   zak?: string; // NEW — only present when the mentor (host) joins
// }

// interface LiveClassEnvelope<T> {
//   success: boolean;
//   message?: string;
//   data: T;
// }

// export const liveClassApi = {
//   startClass: (payload: { courseId: string; days: LiveBatchDays; time: LiveBatchTime; title?: string }) =>
//     request<LiveClassEnvelope<LiveClassRecord>>(
//       "/api/live/start",
//       { method: "POST", body: JSON.stringify(payload) },
//       getAdminToken() ?? getToken()
//     ),

//   endClass: (liveClassId: string) =>
//     request<LiveClassEnvelope<LiveClassRecord>>(
//       "/api/live/end",
//       { method: "POST", body: JSON.stringify({ liveClassId }) },
//       getAdminToken() ?? getToken()
//     ),

//   // works for both mentor (host) and student (attendee) — role decided by backend from JWT
//   joinClass: (liveClassId: string) =>
//     request<LiveClassEnvelope<JoinLiveClassPayload>>(
//       "/api/live/join",
//       { method: "POST", body: JSON.stringify({ liveClassId }) },
//       getAdminToken() ?? getToken()
//     ),

//   getCurrent: () =>
//     request<LiveClassEnvelope<LiveClassRecord | null>>(
//       "/api/live/current",
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   getUpcoming: () =>
//     request<LiveClassEnvelope<LiveClassRecord[]>>(
//       "/api/live/upcoming",
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   attendanceHeartbeat: (liveClassId: string) =>
//     request<LiveClassEnvelope<unknown>>(
//       "/api/live/attendance/heartbeat",
//       { method: "POST", body: JSON.stringify({ liveClassId }) },
//       getToken()
//     ),

//   hostHeartbeat: (liveClassId: string) =>
//     request<LiveClassEnvelope<unknown>>(
//       "/api/live/host-heartbeat",
//       { method: "POST", body: JSON.stringify({ liveClassId }) },
//       getAdminToken() ?? getToken()
//     ),
// };



/**
 * PATCH for src/integrations/client.ts
 * ─────────────────────────────────────
 * Everything else in client.ts (auth, courses, enrollments, admin, fees,
 * portfolio, documents, assignments, mentor dashboard, attendance,
 * certificates, etc.) is UNCHANGED — only the "LIVE CLASSROOM" section's
 * payload shape changes, because Video SDK auth (a signed JWT) is a
 * different shape than Meeting SDK auth (signature + zak + password).
 *
 * Replace the existing `JoinLiveClassPayload` interface and the
 * `liveClassApi` export in client.ts with the block below. Nothing in
 * `liveClassApi`'s method names/signatures changes — only the shape of
 * the data `joinClass` resolves to — so MentorLiveClassPage.tsx,
 * StudentLiveClassPage.tsx, and MyCourse.tsx (which only call
 * `liveClassApi.joinClass(id)` and pass `res.data` straight into
 * `liveClass.startSession(...)`) need NO changes.
 */

// ─────────────────────────────────────────────────────────────
//  LIVE CLASSROOM  (Zoom Video SDK-backed real-time sessions)
// ─────────────────────────────────────────────────────────────
export type LiveClassStatus = "scheduled" | "live" | "ended" | "cancelled";
export type LiveBatchDays = "MTW" | "MWT" | "MTT" | "SS";
export type LiveBatchTime = "10:00-12:00" | "12:00-2:00" | "2:30-4:30" | "4:30-6:30";

export interface LiveClassRecord {
  _id: string;
  course: { _id: string; title: string } | string;
  mentor: { _id: string; fullName: string } | string;
  batch: { days: LiveBatchDays; time: LiveBatchTime };
  title: string;
  status: LiveClassStatus;
  provider: string;
  providerMeetingId?: string;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}
export interface JoinLiveClassPayload {
  token?: string;
  livekitUrl?: string;
  roomName?: string;
  liveClassId?: string;
  role?: "mentor" | "student";
  title?: string;

  // Deprecated Zoom payload fields kept optional for compatibility while the
  // front-end finishes migrating to the LiveKit contract.
  signature?: string;
  providerMeetingId?: string;
  password?: string;
  sdkKey?: string;
  zak?: string;
}

interface LiveClassEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const liveClassApi = {
  startClass: (payload: { courseId: string; days: LiveBatchDays; time: LiveBatchTime; title?: string }) =>
    request<LiveClassEnvelope<LiveClassRecord>>(
      "/api/live/start",
      { method: "POST", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  endClass: (liveClassId: string) =>
    request<LiveClassEnvelope<LiveClassRecord>>(
      "/api/live/end",
      { method: "POST", body: JSON.stringify({ liveClassId }) },
      getAdminToken() ?? getToken()
    ),

  // Works for both mentor (host) and student (attendee) — role decided by
  // backend from JWT. Response now carries a Video SDK JWT instead of a
  // Meeting SDK signature.
  joinClass: (liveClassId: string) =>
    request<LiveClassEnvelope<JoinLiveClassPayload>>(
      "/api/live/join",
      { method: "POST", body: JSON.stringify({ liveClassId }) },
      getAdminToken() ?? getToken()
    ),

  getCurrent: () =>
    request<LiveClassEnvelope<LiveClassRecord | null>>("/api/live/current", {}, getAdminToken() ?? getToken()),

  getUpcoming: () =>
    request<LiveClassEnvelope<LiveClassRecord[]>>("/api/live/upcoming", {}, getAdminToken() ?? getToken()),

  attendanceHeartbeat: (liveClassId: string) =>
    request<LiveClassEnvelope<unknown>>(
      "/api/live/attendance/heartbeat",
      { method: "POST", body: JSON.stringify({ liveClassId }) },
      getToken()
    ),

  hostHeartbeat: (liveClassId: string) =>
    request<LiveClassEnvelope<unknown>>(
      "/api/live/host-heartbeat",
      { method: "POST", body: JSON.stringify({ liveClassId }) },
      getAdminToken() ?? getToken()
    ),
};


// ── BATCH ATTENDANCE ──
export interface BatchAttendanceStudent {
  studentId: string;
  fullName: string;
  email: string;
  studentIdCode: string | null;
  status: "present" | "absent" | "leave" | null;
  mode: "online" | "offline" | null;
  joinedOnline: boolean;
}

export interface BatchAttendanceResponse {
  success: boolean;
  data: {
    batch: { course: string; days: string | null; time: string | null };
    date: string;
    students: BatchAttendanceStudent[];
  };
}

export interface MarkAttendanceRecord {
  studentId: string;
  status: "present" | "absent" | "leave";
  mode?: "online" | "offline";
}

export const batchAttendanceApi = {
  getForDate: (batchId: string, date?: string, liveClassId?: string) => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (liveClassId) params.set("liveClassId", liveClassId);
    const qs = params.toString();
    return request<BatchAttendanceResponse>(
      `/api/mentor/batches/${encodeURIComponent(batchId)}/attendance${qs ? `?${qs}` : ""}`
    );
  },

  save: (batchId: string, records: MarkAttendanceRecord[], date?: string, liveClassId?: string) =>
    request<{ success: boolean; message: string; data: { date: string; count: number } }>(
      `/api/mentor/batches/${encodeURIComponent(batchId)}/attendance`,
      {
        method: "POST",
        body: JSON.stringify({ records, date, liveClassId }),
      }
    ),
};



// ─────────────────────────────────────────────────────────────
//  STUDENT ATTENDANCE
// ─────────────────────────────────────────────────────────────
export interface StudentAttendanceSummary {
  currentPercentage: number;
  requiredPercentage: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
}

export interface StudentAttendanceMonthPoint {
  month: string;
  attendance: number;
}

export interface StudentAttendanceCalendarDay {
  date: number;
  status: "present" | "absent" | "leave" | null;
}

export interface StudentAttendanceLegendItem {
  label: string;
  status: "present" | "absent" | "leave";
}

export interface StudentAttendanceData {
  summary: StudentAttendanceSummary;
  monthlyTrend: StudentAttendanceMonthPoint[];
  calendar: StudentAttendanceCalendarDay[];
  calendarMonthLabel: string;
  calendarYear: number;
  legend: StudentAttendanceLegendItem[];
}

interface StudentAttendanceResponse {
  success: boolean;
  message?: string;
  data: StudentAttendanceData;
}

export const studentAttendanceApi = {
  getMine: (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.set("month", String(month));
    if (year) params.set("year", String(year));
    const qs = params.toString();
    return request<StudentAttendanceResponse>(`/api/student/attendance${qs ? `?${qs}` : ""}`);
  },
};



// ── CERTIFICATES ──
export interface CertificateRecord {
  _id: string;
  certificateId: string;
  student: string | { _id: string; fullName: string; email: string; studentId?: string };
  course: string | { _id: string; title: string };
  mentor?: string | { _id: string; fullName: string } | null;
  issuedBy?: string | { _id: string; fullName: string };
  studentName: string;
  courseName: string;
  mentorName?: string;
  issueDate: string;
  verificationCode: string;
  verificationUrl: string;
  pdfUrl: string;
  status: "issued" | "revoked";
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateRequirement {
  id: string;
  title: string;
  progress: number;
}

export interface CertificateEligibility {
  hasCourseAssigned: boolean;
  course: { _id: string; title: string; category?: string } | null;
  mentor: { _id: string; fullName: string; designation?: string } | null;
  requirements: CertificateRequirement[];
  overallProgress: number;
  eligible: boolean;
}

export interface EligibleStudentRow {
  _id: string;
  fullName: string;
  email: string;
  studentId?: string | null;
  course: { _id: string; title: string } | null;
  mentor: { _id: string; fullName: string } | null;
  hasCertificate: boolean;
}

interface CertificateListResponse {
  success: boolean;
  data: CertificateRecord[];
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}
interface CertificateSingleResponse {
  success: boolean;
  message?: string;
  data: CertificateRecord;
}
interface CertificateEligibilityResponse {
  success: boolean;
  data: CertificateEligibility & { student?: { fullName: string; studentId?: string } };
}
interface EligibleStudentsResponse {
  success: boolean;
  data: EligibleStudentRow[];
}
export interface PublicCertificateVerification {
  valid: boolean;
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  status: "issued" | "revoked";
  verified: boolean;
}
interface VerifyResponse {
  success: boolean;
  message?: string;
  data: PublicCertificateVerification;
}

export const adminCertificateApi = {
  getStudents: (search = "") =>
    request<EligibleStudentsResponse>(
      `/api/admin/certificates/students${search ? `?search=${encodeURIComponent(search)}` : ""}`,
      {},
      getAdminToken() ?? getToken()
    ),

  getEligibility: (studentId: string) =>
    request<CertificateEligibilityResponse>(
      `/api/admin/certificates/eligibility/${studentId}`,
      {},
      getAdminToken() ?? getToken()
    ),

  getAll: (params: { page?: number; limit?: number; search?: string; status?: string } = {}) =>
    request<CertificateListResponse>(
      `/api/admin/certificates${buildQuery(params)}`,
      {},
      getAdminToken() ?? getToken()
    ),

  issue: (studentId: string) =>
    request<CertificateSingleResponse>(
      "/api/admin/certificates",
      { method: "POST", body: JSON.stringify({ studentId }) },
      getAdminToken() ?? getToken()
    ),

  getById: (id: string) =>
    request<CertificateSingleResponse>(`/api/admin/certificates/${id}`, {}, getAdminToken() ?? getToken()),

  revoke: (id: string, reason?: string) =>
    request<CertificateSingleResponse>(
      `/api/admin/certificates/${id}/revoke`,
      { method: "PATCH", body: JSON.stringify({ reason: reason || "" }) },
      getAdminToken() ?? getToken()
    ),
};

export const studentCertificateApi = {
  getEligibility: () => request<CertificateEligibilityResponse>("/api/student/certificates/eligibility"),
  getMine: () => request<CertificateListResponse>("/api/student/certificates"),
  getById: (id: string) => request<CertificateSingleResponse>(`/api/student/certificates/${id}`),
  getDownloadUrl: (id: string) =>
    request<{ success: boolean; data: { url: string } }>(`/api/student/certificates/${id}/download`),
};

export const publicCertificateApi = {
  verify: (certificateId: string) =>
    request<VerifyResponse>(`/api/verify/${encodeURIComponent(certificateId)}`),
};



// ─────────────────────────────────────────────────────────────
//  OPPORTUNITIES (Career Portal)
// ─────────────────────────────────────────────────────────────
export type OpportunityStatus = "draft" | "published";
export type OpportunityWorkMode = "On-site" | "Hybrid" | "Remote";
export type OpportunityPayPeriod = "Annual" | "Monthly";
export type OpportunityVisibility = "Internal" | "Public";

export interface OpportunityIncentives {
  performanceBonus: boolean;
  performanceBonusValue: number | null;
  signOnBonus: boolean;
  signOnBonusValue: number | null;
}

export interface OpportunityEligibility {
  experienceLevel: string;
  minYears: number | null;
  education: string;
  notes: string;
  workAuthRequired: boolean;
  backgroundCheck: boolean;
}

export interface OpportunitySettings {
  applicationDeadline: string | null;
  applicationLimit: number | null;
  visibility: OpportunityVisibility;
  autoScreening: boolean;
  alertRecipients: string[];
}

// Flat shape returned by the backend (Opportunity.js model)
export interface Opportunity {
  _id: string;
  companyEntity: string;
    hiringPartner?: string | { _id: string; companyName: string } | null;
  internalJobCode: string;
  hiringManager?: string | { _id: string; fullName: string; email: string } | null;
  department: string;
  primaryLocation: string;
  urgentRequirement: boolean;
applicationCount?: number; 
  jobTitle: string;
  slug: string;
  category: string;
  employmentType: string;
  workMode: OpportunityWorkMode;
  openings: number;
  description: string;
  responsibilities: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];

  compensationType: string;
  currency: string;
  payMin: number | null;
  payMax: number | null;
  payPeriod: OpportunityPayPeriod;
  benefits: string[];
  incentives: OpportunityIncentives;

  eligibility: OpportunityEligibility;
  settings: OpportunitySettings;

  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
}

// Payload shape mirrors the wizard's step objects — sent as-is to the backend,
// which maps basic/role/compensation/eligibility/settings onto the flat model.
export interface OpportunityWizardPayload {
  basic: {
    companyEntity: string;
    hiringPartner: string; 
    internalJobCode: string;
    hiringManager: string;
    department: string;
    primaryLocation: string;
    urgentRequirement: boolean;
  };
  role: {
    jobTitle: string;
    category: string;
    employmentType: string;
    workMode: OpportunityWorkMode;
    openings: number;
    description: string;
    responsibilities: string;
    requiredSkills: string[];
    niceToHaveSkills: string[];
  };
  compensation: {
    compensationType: string;
    currency: string;
    payMin: number | null;
    payMax: number | null;
    payPeriod: OpportunityPayPeriod;
    benefits: string[];
    performanceBonus: boolean;
    performanceBonusValue: number | null;
    signOnBonus: boolean;
    signOnBonusValue: number | null;
  };
  eligibility: {
    experienceLevel: string;
    minYears: number | null;
    education: string;
    notes: string;
    workAuthRequired: boolean;
    backgroundCheck: boolean;
  };
  settings: {
    applicationDeadline: string;
    applicationLimit: number | null;
    visibility: OpportunityVisibility;
    autoScreening: boolean;
    alertRecipients: string[];
  };
  status?: OpportunityStatus;
}

interface OpportunityListResponse {
  success: boolean;
  data: Opportunity[];
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

interface OpportunitySingleResponse {
  success: boolean;
  message?: string;
  data: Opportunity;
}

export interface OpportunityListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OpportunityStatus | "";
}

export const opportunitiesApi = {
  getAll: (params: OpportunityListParams = {}) => {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") usp.set(k, String(v));
    });
    const qs = usp.toString();
    return request<OpportunityListResponse>(
      `/api/admin/opportunities${qs ? `?${qs}` : ""}`,
      {},
      getAdminToken() ?? getToken()
    );
  },

  getById: (id: string) =>
    request<OpportunitySingleResponse>(
      `/api/admin/opportunities/${id}`,
      {},
      getAdminToken() ?? getToken()
    ),

  create: (payload: OpportunityWizardPayload) =>
    request<OpportunitySingleResponse>(
      "/api/admin/opportunities",
      { method: "POST", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  update: (id: string, payload: OpportunityWizardPayload) =>
    request<OpportunitySingleResponse>(
      `/api/admin/opportunities/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  updateStatus: (id: string, status: OpportunityStatus) =>
    request<OpportunitySingleResponse>(
      `/api/admin/opportunities/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      getAdminToken() ?? getToken()
    ),

  remove: (id: string) =>
    request<{ success: boolean; message?: string }>(
      `/api/admin/opportunities/${id}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),
};


// ─────────────────────────────────────────────────────────────
//  HIRING PARTNERS
// ─────────────────────────────────────────────────────────────
export type HiringPartnerTier = "Premier" | "Standard";

export interface HiringPartner {
  _id: string;
  companyName: string;
  slug: string;
  industry: string;
  logo: string;
  description: string;
  website: string;
  tier: HiringPartnerTier;
  isActive: boolean;
  stats: { totalHires: number };
  openRoles?: number;
  totalHires?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HiringPartnerDetail {
  partner: HiringPartner;
  opportunities: Opportunity[];
  openRoles: number;
  totalHires: number;
}

export interface HiringPartnerDashboardStats {
  totalPartners: number;
  premierPartners: number;
  openRoles: number;
  totalHires: number;
}

export interface HiringPartnerPayload {
  companyName: string;
  industry?: string;
  logo?: string;
  description?: string;
  website?: string;
  tier?: HiringPartnerTier;
  isActive?: boolean;
  totalHires?: number;
}

interface HiringPartnerListResponse {
  success: boolean;
  data: HiringPartner[];
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

interface HiringPartnerSingleResponse {
  success: boolean;
  message?: string;
  data: HiringPartner;
}

interface HiringPartnerDetailResponse {
  success: boolean;
  data: HiringPartnerDetail;
}

interface HiringPartnerStatsResponse {
  success: boolean;
  data: HiringPartnerDashboardStats;
}

export interface HiringPartnerListParams {
  page?: number;
  limit?: number;
  search?: string;
  tier?: HiringPartnerTier | "";
  isActive?: "true" | "false" | "";
}

export const hiringPartnersApi = {
  getAll: (params: HiringPartnerListParams = {}) => {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") usp.set(k, String(v));
    });
    const qs = usp.toString();
    return request<HiringPartnerListResponse>(
      `/api/admin/hiring-partners${qs ? `?${qs}` : ""}`,
      {},
      getAdminToken() ?? getToken()
    );
  },

  getById: (id: string) =>
    request<HiringPartnerSingleResponse>(
      `/api/admin/hiring-partners/${id}`,
      {},
      getAdminToken() ?? getToken()
    ),

  getDetail: (id: string) =>
    request<HiringPartnerDetailResponse>(
      `/api/admin/hiring-partners/${id}/detail`,
      {},
      getAdminToken() ?? getToken()
    ),

  create: (payload: HiringPartnerPayload) =>
    request<HiringPartnerSingleResponse>(
      "/api/admin/hiring-partners",
      { method: "POST", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  update: (id: string, payload: Partial<HiringPartnerPayload>) =>
    request<HiringPartnerSingleResponse>(
      `/api/admin/hiring-partners/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  remove: (id: string) =>
    request<{ success: boolean; message?: string }>(
      `/api/admin/hiring-partners/${id}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),

  getDashboardStats: () =>
    request<HiringPartnerStatsResponse>(
      "/api/admin/hiring-partners/dashboard/stats",
      {},
      getAdminToken() ?? getToken()
    ),
};



// ─────────────────────────────────────────────────────────────
//  OPPORTUNITY APPLICATIONS (Job Portal)
// ─────────────────────────────────────────────────────────────
export type OpportunityApplicationStatus =
  | "applied" | "under_review" | "shortlisted" | "rejected" | "selected";

export interface OpportunityApplication {
  _id: string;
  opportunity: string | Opportunity;
  applicant: string | { _id: string; fullName: string; email: string; studentId?: string };
  fullName: string;
  email: string;
  phone?: string;
  links?: ApplicationLink[]; 
  coverLetter?: string;
  resume?: { url: string; originalName?: string };
  status: OpportunityApplicationStatus;
  adminRemarks?: string;
  createdAt: string;
}

// export interface ApplyToOpportunityPayload {
//   fullName: string;
//   email: string;
//   phone?: string;
//   coverLetter?: string;
//   resume?: File;
// }


export type ApplicationLinkType =
  | "Personal Website" | "LinkedIn" | "GitHub" | "Behance" | "Dribbble"
  | "ArtStation" | "YouTube" | "Vimeo" | "Google Drive" | "Live Project"
  | "Resume" | "Other";

export const APPLICATION_LINK_TYPES: ApplicationLinkType[] = [
  "Personal Website", "LinkedIn", "GitHub", "Behance", "Dribbble",
  "ArtStation", "YouTube", "Vimeo", "Google Drive", "Live Project",
  "Resume", "Other",
];

export interface ApplicationLink {
  type: ApplicationLinkType;
  label?: string; // required only when type === "Other"
  url: string;
}

export interface ApplyToOpportunityPayload {
  fullName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  resume?: File;
  links?: ApplicationLink[]; 
}
interface OpportunityApplicationSingleResponse {
  success: boolean;
  message?: string;
  data: OpportunityApplication;
}
interface OpportunityApplicationListResponse {
  success: boolean;
  message?: string;
  data: OpportunityApplication[];
}

// export const opportunityApplicationApi = {
//   apply: (opportunityId: string, payload: ApplyToOpportunityPayload) => {
//     const fd = new FormData();
//     fd.append("fullName", payload.fullName);
//     fd.append("email", payload.email);
//     if (payload.phone) fd.append("phone", payload.phone);
//     if (payload.coverLetter) fd.append("coverLetter", payload.coverLetter);
//     if (payload.resume) fd.append("resume", payload.resume);
//     return requestMultipart<OpportunityApplicationSingleResponse>(
//       `/api/opportunities/${opportunityId}/apply`,
//       fd,
//       "POST",
//       getToken()
//     );
//   },

//   getMine: () => request<OpportunityApplicationListResponse>("/api/student/opportunity-applications/mine"),

//   getForOpportunity: (opportunityId: string) =>
//     request<OpportunityApplicationListResponse>(
//       `/api/admin/opportunities/${opportunityId}/applications`,
//       {},
//       getAdminToken() ?? getToken()
//     ),

//   updateStatus: (applicationId: string, status: OpportunityApplicationStatus, adminRemarks?: string) =>
//     request<OpportunityApplicationSingleResponse>(
//       `/api/admin/opportunities/applications/${applicationId}/status`,
//       { method: "PATCH", body: JSON.stringify({ status, adminRemarks }) },
//       getAdminToken() ?? getToken()
//     ),
// };

// Public (no auth) job listing — for the student-facing Job Portal

export const opportunityApplicationApi = {
  apply: (opportunityId: string, payload: ApplyToOpportunityPayload) => {
    const fd = new FormData();
    fd.append("fullName", payload.fullName);
    fd.append("email", payload.email);
    if (payload.phone) fd.append("phone", payload.phone);
    if (payload.coverLetter) fd.append("coverLetter", payload.coverLetter);
    if (payload.resume) fd.append("resume", payload.resume);
    if (payload.links && payload.links.length > 0) {
      fd.append("links", JSON.stringify(payload.links));
    }
    return requestMultipart<OpportunityApplicationSingleResponse>(
      `/api/opportunities/${opportunityId}/apply`,
      fd,
      "POST",
      getToken()
    );
  },

  getMine: () => request<OpportunityApplicationListResponse>("/api/student/opportunity-applications/mine"),

  getForOpportunity: (opportunityId: string) =>
    request<OpportunityApplicationListResponse>(
      `/api/admin/opportunities/${opportunityId}/applications`,
      {},
      getAdminToken() ?? getToken()
    ),

  updateStatus: (applicationId: string, status: OpportunityApplicationStatus, adminRemarks?: string) =>
    request<OpportunityApplicationSingleResponse>(
      `/api/admin/opportunities/applications/${applicationId}/status`,
      { method: "PATCH", body: JSON.stringify({ status, adminRemarks }) },
      getAdminToken() ?? getToken()
    ),
};

export const publicOpportunitiesApi = {
  getAll: (params: { search?: string; department?: string; workMode?: string; category?: string } = {}) => {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) usp.set(k, String(v)); });
    const qs = usp.toString();
    return request<OpportunityListResponse>(`/api/opportunities${qs ? `?${qs}` : ""}`);
  },
};



export interface BatchVideoRecord {
  id: string;
  title: string;
  description: string;
  duration: number | null;
  fileName: string;
  fileSize: number;
  createdAt: string;
  uploadedBy: string | null;
  streamUrl: string;
}
interface BatchVideoListResponse { success: boolean; message?: string; data: BatchVideoRecord[]; }
interface BatchVideoSingleResponse { success: boolean; message?: string; data: BatchVideoRecord; }

export const mentorVideoApi = {
  getForBatch: (batchId: string) =>
    request<BatchVideoListResponse>(`/api/mentor/batches/${encodeURIComponent(batchId)}/videos`),
  upload: (batchId: string, payload: { title: string; description?: string; video: File }) => {
    const fd = new FormData();
    fd.append("title", payload.title);
    if (payload.description) fd.append("description", payload.description);
    fd.append("video", payload.video);
    return requestMultipart<BatchVideoSingleResponse>(
      `/api/mentor/batches/${encodeURIComponent(batchId)}/videos`, fd, "POST"
    );
  },
  remove: (videoId: string) =>
    request<{ success: boolean; message?: string }>(`/api/mentor/videos/${videoId}`, { method: "DELETE" }),
  getStreamUrl: (streamUrl: string) => `${BASE_URL}${streamUrl}?token=${encodeURIComponent(getToken() ?? "")}`,
};

export const studentVideoApi = {
  getMine: () => request<BatchVideoListResponse>("/api/student/videos"),
  getStreamUrl: (streamUrl: string) => `${BASE_URL}${streamUrl}?token=${encodeURIComponent(getToken() ?? "")}`,
};


// ─────────────────────────────────────────────────────────────
//  ADMIN — full course list (includes unpublished, for internal mgmt)
// ─────────────────────────────────────────────────────────────
export const adminCoursesApi = {
  getAll: (params: { page?: number; limit?: number; search?: string } = {}) => {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") usp.set(k, String(v));
    });
    const qs = usp.toString();
    return request<{ success: boolean; data: Course[]; pagination?: any }>(
      `/api/admin/courses${qs ? `?${qs}` : ""}`,
      {},
      getAdminToken() ?? getToken()
    );
  },
};

// ─────────────────────────────────────────────────────────────
//  ADMIN — RECORDED COURSES: Batch & Video Management
// ─────────────────────────────────────────────────────────────
export interface AdminRecordedBatch {
  batchId: string;
  courseId: string;
  days: string | null;
  time: string | null;
  isUnscheduled: boolean;
  mentor: { _id: string; fullName: string; email: string } | null;
  studentCount: number;
  videoCount: number;
}

export interface AdminBatchVideo {
  id: string;
  title: string;
  description: string;
  duration: number | null;
  fileName: string;
  fileSize: number;
  createdAt: string;
  uploadedBy: string | null;
  streamUrl: string; // relative path, e.g. /api/admin/recorded-videos/:id/stream
}

interface AdminBatchesResponse {
  success: boolean;
  message?: string;
  data: AdminRecordedBatch[];
  course?: { _id: string; title: string };
}

interface AdminBatchVideosResponse {
  success: boolean;
  message?: string;
  data: AdminBatchVideo[];
  batch?: { batchId: string; courseId: string; days: string | null; time: string | null };
}

interface AdminBatchVideoSingleResponse {
  success: boolean;
  message?: string;
  data: AdminBatchVideo;
}

export const adminRecordedCourseApi = {
  getBatches: (courseId: string) =>
    request<AdminBatchesResponse>(
      `/api/admin/recorded-courses/${courseId}/batches`,
      {},
      getAdminToken() ?? getToken()
    ),

  getBatchVideos: (courseId: string, batchId: string) =>
    request<AdminBatchVideosResponse>(
      `/api/admin/recorded-courses/${courseId}/batches/${encodeURIComponent(batchId)}/videos`,
      {},
      getAdminToken() ?? getToken()
    ),

  uploadVideo: (
    courseId: string,
    batchId: string,
    payload: { title: string; description?: string; video: File }
  ) => {
    const fd = new FormData();
    fd.append("title", payload.title);
    if (payload.description) fd.append("description", payload.description);
    fd.append("video", payload.video);
    return requestMultipart<AdminBatchVideoSingleResponse>(
      `/api/admin/recorded-courses/${courseId}/batches/${encodeURIComponent(batchId)}/videos`,
      fd,
      "POST",
      getAdminToken() ?? getToken()
    );
  },

  deleteVideo: (videoId: string) =>
    request<{ success: boolean; message?: string }>(
      `/api/admin/recorded-videos/${videoId}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),

  getStreamUrl: (videoId: string) =>
    `${BASE_URL}/api/admin/recorded-videos/${videoId}/stream?token=${encodeURIComponent(
      getAdminToken() ?? getToken() ?? ""
    )}`,
};


export interface FeeInstallmentRecord {
  _id: string;
  installmentNumber: number;
  dueDate: string;
  paidDate?: string | null;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "pending" | "partial" | "paid" | "overdue";
  payments?: { _id: string; amount: number; paidAt: string; paymentMethod: string }[];
}

interface InstallmentListResponse { success: boolean; data: FeeInstallmentRecord[]; }
interface InstallmentSingleResponse { success: boolean; message?: string; data: FeeInstallmentRecord; }

export const feeInstallmentApi = {
  getAll: (studentId: string) =>
    request<InstallmentListResponse>(
      `/api/admin/students/${studentId}/fee/installments`,
      {},
      getAdminToken() ?? getToken()
    ),

  add: (studentId: string, payload: { amount: number; dueDate: string }) =>
    request<InstallmentSingleResponse>(
      `/api/admin/students/${studentId}/fee/installments`,
      { method: "POST", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  update: (studentId: string, installmentId: string, payload: { amount?: number; dueDate?: string }) =>
    request<InstallmentSingleResponse>(
      `/api/admin/students/${studentId}/fee/installments/${installmentId}`,
      { method: "PUT", body: JSON.stringify(payload) },
      getAdminToken() ?? getToken()
    ),

  remove: (studentId: string, installmentId: string) =>
    request<{ success: boolean; message?: string }>(
      `/api/admin/students/${studentId}/fee/installments/${installmentId}`,
      { method: "DELETE" },
      getAdminToken() ?? getToken()
    ),
};




export const supabase = supabaseCompat;

