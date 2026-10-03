export interface CareerMilestone {
  period: string;
  title: string;
  company: string;
  description: string;
}

export interface FeaturedProject {
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
}

export interface ToolkitCategory {
  label?: string;
  tools: string[];
}

export interface Toolkit {
  title: string;
  subtitle?: string;
  categories: ToolkitCategory[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  students: string;
  price: string;
}

export interface Testimonial {
  id: number;
  name: string;
  designation: string;
  image: string;
  review: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

/** Raw shape returned by GET /api/mentors/profile/:slug (before id-hydration) */
export interface MentorDetailResponse {
  slug: string;
  name: string;
  designation?: string;
  company?: string;
  photoUrl?: string;
  heroImage?: string;

  experience?: string;
  studentsCount?: string | number;
  projects?: string;
  rating?: number;
  languages?: string;
  status?: string;
  description?: string;

  about?: string[];
  expertise?: string[];

  careerMilestones?: CareerMilestone[];
  featuredProjects?: FeaturedProject[];
  artStationUrl?: string;
  toolkit?: Toolkit | null;

  testimonials?: Omit<Testimonial, "id">[];
  courses?: Omit<Course, "id">[];
  faqs?: Omit<FAQ, "id">[];
}

/** Shape used by the page after id-hydration */
export interface MentorDetail extends Omit <
  MentorDetailResponse,
  "testimonials" | "courses" | "faqs"
> {
  testimonials?: Testimonial[];
  courses?: Course[];
  faqs?: FAQ[];
}