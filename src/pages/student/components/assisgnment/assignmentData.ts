// assignmentData.ts

export type ProjectStatus =
  "Submitted" | "Under Review" | "Approved" | "Rejected";

export interface StudentProject {

  id:number;

  title:string;

  description:string;

  category:string;

  thumbnail:string;

  files:{
    name:string;
    type:string;
    size:string;
  }[];

  figmaLink?:string;

  githubLink?:string;

  liveLink?:string;

  submittedDate:string;

  submittedAt?:string;

  status:ProjectStatus;

  grade:string;

  feedback:string;

}

export const studentProjects: StudentProject[] = [
  {
    id: 1,

    title: "Food Delivery App UI Design",

    description:
      "Complete mobile app UI/UX case study including wireframes and prototype.",

    category: "UI/UX Design",

    thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3",

    files: [
      {
        name: "food-delivery-ui.fig",
        type: "Figma File",
        size: "8.5 MB",
      },
      {
        name: "screens.png",
        type: "Image",
        size: "2.4 MB",
      },
    ],

    figmaLink: "https://figma.com/file/example",

    submittedDate: "28 July 2026",

    status: "Under Review",

    grade: "-",

    feedback: "Waiting for mentor review.",
  },

  {
    id: 2,

    title: "Portfolio Website",

    description: "Personal developer portfolio website project.",

    category: "Web Development",

    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",

    files: [
      {
        name: "portfolio.zip",
        type: "Source Code",
        size: "15 MB",
      },
    ],

    githubLink: "https://github.com/example",

    liveLink: "https://portfolio.example.com",

    submittedDate: "20 July 2026",

    status: "Approved",

    grade: "A+",

    feedback: "Excellent work and clean implementation.",
  },

  {
    id: 3,

    title: "3D Product Visualization",

    description: "3D modelling and product rendering project.",

    category: "3D Design",

    thumbnail: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4",

    files: [
      {
        name: "product-render.blend",
        type: "Blender File",
        size: "120 MB",
      },
    ],

    submittedDate: "15 July 2026",

    status: "Submitted",

    grade: "-",

    feedback: "Not reviewed yet.",
  },
];
