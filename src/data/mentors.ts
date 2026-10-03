/**
 * Mentor detail data now comes from the backend
 * (see src/services/mentor.service.ts).
 *
 * The only thing kept here is `slugify`, used as a client-side fallback
 * on the Mentors listing page when a mentor record has no `slug` yet.
 */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");


    /** Shape of a mentor in the public listing (GET /api/mentors) */
export interface MentorListItem {
  _id: string;
  slug?: string;
  name: string;
  designation?: string;
  company?: string;
  expertise: string[];
  rating: number;
  studentsCount: number;
  linkedinUrl?: string;
  instagramUrl?: string;
  photoUrl?: string;
}