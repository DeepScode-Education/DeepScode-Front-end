export type CareerStatus = "Draft" | "Published" | "Closed";

export type WorkMode = "Remote" | "Hybrid" | "Onsite";

export type EmploymentType =
  | "Full Time"
  | "Part Time"
  | "Internship"
  | "Contract"
  | "Freelance";

export interface Career {
  _id: string;

  title: string;

  slug: string;

  department: string;

  location: string;

  workMode: WorkMode;

  employmentType: EmploymentType;

  experience: {
    min: number;
    max: number;
  };

  salary: {
    min: number;
    max: number;
    currency: string;
  };

  openings: number;

  description: string;

  responsibilities: string[];

  requirements: string[];

  skills: string[];

  benefits: string[];

  featured: boolean;

  status: CareerStatus;

  sortOrder: number;

  applicationDeadline?: string;

  createdAt: string;

  updatedAt: string;
}

export interface CareerPayload {
  title: string;

  department: string;

  location: string;

  workMode: WorkMode;

  employmentType: EmploymentType;

  experience: {
    min: number;
    max: number;
  };

  salary: {
    min: number;
    max: number;
  };

  openings: number;

  description: string;

  responsibilities: string[];

  requirements: string[];

  skills: string[];

  benefits: string[];

  featured: boolean;

  status: CareerStatus;

  applicationDeadline?: string;
}

export interface CareerListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  data: Career[];
}

export interface CareerResponse {
  success: boolean;

  data: Career;
}