// export interface Blog {
//   _id: string;

//   title: string;

//   slug: string;

//   shortDescription: string;

//   content: string;

//   thumbnail: {
//     url: string;
//     publicId: string;
//   };
//   category: string; 

//   tags: string[];

//   featured: boolean;

//   status: "Draft" | "Published";

//   readTime: number;

//   views: number;

//   seoTitle: string;

//   metaDescription: string;

//   createdAt: string;

//   updatedAt: string;
// }

// export interface BlogResponse {
//   success: boolean;
//   message?: string;
//   data: Blog;
// }

// export interface BlogListResponse {
//   success: boolean;

//   total: number;

//   page: number;

//   limit: number;

//   totalPages: number;

//   data: Blog[];
// }

// export interface BlogQuery {
//   page?: number;

//   limit?: number;

//   search?: string;

//   category?: string;

//   status?: string;

//   featured?: boolean;
// }

// export interface BlogPayload {
//   title: string;

//   shortDescription: string;

//   content: string;

//  category: string; 

//   featured?: boolean;

//   status?: "Draft" | "Published";

//   readTime?: number;

//   seoTitle?: string;

//   metaDescription?: string;

//   tags?: string[];

//   thumbnail?: File | null;
// }











export interface BlogCourseRef {
  _id: string;
  title: string;
  slug: string;
  category?: string;
}

export interface Blog {
  _id: string;

  title: string;

  slug: string;

  shortDescription: string;

  content: string;

  thumbnail: {
    url: string;
    publicId: string;
  };

  // NEW — the actual Course this blog is tagged to. Populated on read;
  // may be null for legacy blogs created before this change.
  course?: BlogCourseRef | null;

  // LEGACY — free-text label, auto-synced from course.category server-side.
  // Kept for backward compatibility / fallback display when `course` is null.
  category?: string;

  tags: string[];

  featured: boolean;

  status: "Draft" | "Published";

  readTime: number;

  views: number;

  seoTitle: string;

  metaDescription: string;

  createdAt: string;

  updatedAt: string;
}

export interface BlogResponse {
  success: boolean;
  message?: string;
  data: Blog;
}

export interface BlogListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  data: Blog[];
}

export interface BlogQuery {
  page?: number;

  limit?: number;

  search?: string;

  category?: string; // legacy fallback filter

  course?: string; // NEW — Course _id

  status?: string;

  featured?: boolean;
}

export interface BlogPayload {
  title: string;

  shortDescription: string;

  content: string;

  course: string; // CHANGED — Course _id instead of a category label

  featured?: boolean;

  status?: "Draft" | "Published";

  readTime?: number;

  seoTitle?: string;

  metaDescription?: string;

  tags?: string[];

  thumbnail?: File | null;
}