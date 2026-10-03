export type ApplicationStatus =
  | "Applied"
  | "Shortlisted"
  | "Interview Scheduled"
  | "Interviewed"
  | "Selected"
  | "Rejected";

export interface CareerApplication {
  _id: string;
  career: {
    _id: string;
    title: string;
    location: string;
    department?: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentCompany: string;
  experience: number;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: string;
  portfolio: string;
  linkedIn: string;
  github: string;
  coverLetter: string;
  resume: {
    url: string;
    publicId: string;
    originalName: string;
    size: number;
  };
  status: ApplicationStatus;
  interviewDate?: string;
  adminRemarks: string;
  createdByIP: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationListResponse {
  success: boolean;
  data: CareerApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApplicationResponse {
  success: boolean;
  data: CareerApplication;
}

export interface DashboardStats {
  total: number;
  applied: number;
  shortlisted: number;
  interviewed: number;
  selected: number;
  rejected: number;
}