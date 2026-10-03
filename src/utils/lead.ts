// utils/lead.ts
export const getCourseLabel = (course: any) =>
  typeof course === "object" && course ? course.title : (course as string) || "—";