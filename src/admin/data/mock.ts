// Centralized mock data for the admin panel.
// Replace with real API/Cloud queries when backend is wired up.

export const overviewStats = [
  { label: "Total Students", value: "1,284", delta: "+12.4%", trend: "up" as const },
  { label: "Active Courses", value: "24", delta: "+3", trend: "up" as const },
  { label: "Revenue (₹)", value: "28.4L", delta: "+18.2%", trend: "up" as const },
  { label: "New Leads", value: "67", delta: "-4.1%", trend: "down" as const },
  { label: "Trial → Paid", value: "32%", delta: "+4.2%", trend: "up" as const },
  { label: "Placement Rate", value: "87%", delta: "+2.1%", trend: "up" as const },
  { label: "Monthly Sales", value: "₹4.8L", delta: "+9.6%", trend: "up" as const },
  { label: "ROAS", value: "4.2x", delta: "+0.4x", trend: "up" as const },
];

export const revenueSeries = [
  { month: "Jan", revenue: 18400, students: 420 },
  { month: "Feb", revenue: 21200, students: 468 },
  { month: "Mar", revenue: 24800, students: 530 },
  { month: "Apr", revenue: 26100, students: 612 },
  { month: "May", revenue: 29400, students: 705 },
  { month: "Jun", revenue: 32800, students: 812 },
  { month: "Jul", revenue: 35600, students: 940 },
  { month: "Aug", revenue: 38900, students: 1024 },
  { month: "Sep", revenue: 42100, students: 1128 },
  { month: "Oct", revenue: 45800, students: 1210 },
  { month: "Nov", revenue: 48200, students: 1262 },
  { month: "Dec", revenue: 52400, students: 1284 },
];

export const conversionSeries = [
  { stage: "Visitors", value: 12400 },
  { stage: "Leads", value: 1820 },
  { stage: "Trials", value: 640 },
  { stage: "Converted", value: 284 },
];

export const leadSources = [
  { source: "Instagram", value: 412, pct: 28 },
  { source: "Google Ads", value: 388, pct: 26 },
  { source: "Referral", value: 264, pct: 18 },
  { source: "Website", value: 220, pct: 15 },
  { source: "WhatsApp", value: 132, pct: 9 },
  { source: "Facebook", value: 60, pct: 4 },
];

export const coursePerformance = [
  { course: "UI/UX Design", students: 312, completion: 78, rating: 4.9 },
  { course: "Full-Stack Dev", students: 264, completion: 71, rating: 4.8 },
  { course: "Data Analytics", students: 198, completion: 82, rating: 4.9 },
  { course: "Digital Marketing", students: 176, completion: 74, rating: 4.7 },
];

export const placementAnalytics = [
  { month: "Jan", placed: 18, offers: 24 },
  { month: "Feb", placed: 22, offers: 30 },
  { month: "Mar", placed: 28, offers: 36 },
  { month: "Apr", placed: 31, offers: 42 },
  { month: "May", placed: 35, offers: 48 },
  { month: "Jun", placed: 41, offers: 54 },
];

export type LeadStage =
  | "New Lead"
  | "Contacted"
  | "Interested"
  | "Trial Booked"
  | "Trial Completed"
  | "Negotiation"
  | "Converted"
  | "Lost";

export const LEAD_STAGES: LeadStage[] = [
  "New Lead", "Contacted", "Interested", "Trial Booked",
  "Trial Completed", "Negotiation", "Converted", "Lost",
];

export const leads: {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  stage: LeadStage;
  source: string;
  owner: string;
  createdAt: string;
}[] = [
    { id: "L-1024", name: "Aarav Mehta", email: "aarav@example.com", phone: "+91 98 1234 5678", course: "UI/UX Design", stage: "New Lead", source: "Website", owner: "Riya S.", createdAt: "2h ago" },
    { id: "L-1023", name: "Sara Khan", email: "sara@example.com", phone: "+91 99 8841 2900", course: "Full-Stack Dev", stage: "Contacted", source: "Instagram", owner: "Arjun M.", createdAt: "5h ago" },
    { id: "L-1022", name: "Omar Hassan", email: "omar@example.com", phone: "+91 97 4423 3990", course: "Data Analytics", stage: "Interested", source: "Referral", owner: "Riya S.", createdAt: "1d ago" },
    { id: "L-1021", name: "Lina Ahmed", email: "lina@example.com", phone: "+91 96 2201 1440", course: "Digital Marketing", stage: "Trial Booked", source: "Google Ads", owner: "Neha P.", createdAt: "2d ago" },
    { id: "L-1020", name: "Yusuf Ali", email: "yusuf@example.com", phone: "+91 90 7789 0120", course: "UI/UX Design", stage: "Trial Completed", source: "Website", owner: "Arjun M.", createdAt: "3d ago" },
    { id: "L-1019", name: "Maya Patel", email: "maya@example.com", phone: "+91 95 1108 8470", course: "Full-Stack Dev", stage: "Negotiation", source: "Facebook", owner: "Neha P.", createdAt: "4d ago" },
    { id: "L-1018", name: "Hassan Raza", email: "hassan@example.com", phone: "+91 92 9012 2330", course: "Data Analytics", stage: "Converted", source: "Website", owner: "Riya S.", createdAt: "5d ago" },
    { id: "L-1017", name: "Noor Sheikh", email: "noor@example.com", phone: "+91 93 3345 5660", course: "Digital Marketing", stage: "Lost", source: "Referral", owner: "Arjun M.", createdAt: "1w ago" },
    { id: "L-1016", name: "Vikram Iyer", email: "vikram@example.com", phone: "+91 94 5566 7788", course: "UI/UX Design", stage: "New Lead", source: "WhatsApp", owner: "Neha P.", createdAt: "2h ago" },
    { id: "L-1015", name: "Zara Sheikh", email: "zara@example.com", phone: "+91 91 1122 3344", course: "Full-Stack Dev", stage: "Contacted", source: "Instagram", owner: "Riya S.", createdAt: "6h ago" },
  ];

export const followUps = [
  { id: "F-301", lead: "Aarav Mehta", task: "Send course brochure", due: "Today, 4:00 PM", priority: "High", owner: "Riya S." },
  { id: "F-302", lead: "Sara Khan", task: "Demo call follow-up", due: "Today, 6:30 PM", priority: "High", owner: "Arjun M." },
  { id: "F-303", lead: "Omar Hassan", task: "Share EMI options", due: "Tomorrow, 11:00 AM", priority: "Medium", owner: "Riya S." },
  { id: "F-304", lead: "Lina Ahmed", task: "Trial class reminder", due: "Tomorrow, 5:00 PM", priority: "Medium", owner: "Neha P." },
  { id: "F-305", lead: "Maya Patel", task: "Negotiation — discount approval", due: "Wed, 2:00 PM", priority: "High", owner: "Neha P." },
  { id: "F-306", lead: "Vikram Iyer", task: "WhatsApp intro message", due: "Wed, 4:00 PM", priority: "Low", owner: "Neha P." },
];

export const callLogs = [
  { id: "CL-9001", lead: "Aarav Mehta", agent: "Riya S.", duration: "4m 12s", outcome: "Interested", date: "Today, 3:14 PM" },
  { id: "CL-9000", lead: "Sara Khan", agent: "Arjun M.", duration: "7m 48s", outcome: "Trial Booked", date: "Today, 1:02 PM" },
  { id: "CL-8999", lead: "Maya Patel", agent: "Neha P.", duration: "11m 03s", outcome: "Negotiation", date: "Yesterday, 6:45 PM" },
  { id: "CL-8998", lead: "Yusuf Ali", agent: "Arjun M.", duration: "2m 50s", outcome: "No Answer", date: "Yesterday, 4:30 PM" },
  { id: "CL-8997", lead: "Omar Hassan", agent: "Riya S.", duration: "6m 22s", outcome: "Interested", date: "Yesterday, 11:18 AM" },
];

export const campaigns = [
  { id: "CMP-201", name: "UI/UX Spring Cohort", channel: "Email", reach: 12400, ctr: "8.2%", conversions: 184, status: "Live" },
  { id: "CMP-202", name: "Full-Stack Free Trial", channel: "WhatsApp", reach: 8200, ctr: "14.6%", conversions: 226, status: "Live" },
  { id: "CMP-203", name: "Data Analytics Webinar", channel: "Instagram", reach: 22800, ctr: "5.1%", conversions: 312, status: "Scheduled" },
  { id: "CMP-204", name: "Marketing Bootcamp", channel: "Google Ads", reach: 18400, ctr: "6.8%", conversions: 198, status: "Paused" },
];

export const students = [
  { id: "S-2041", name: "Aarav Mehta", email: "aarav@example.com", course: "UI/UX Design", joined: "Mar 2025", status: "Active", attendance: 94, fees: "Paid" },
  { id: "S-2040", name: "Lina Ahmed", email: "lina@example.com", course: "Digital Marketing", joined: "Feb 2025", status: "Active", attendance: 88, fees: "Paid" },
  { id: "S-2039", name: "Noor Sheikh", email: "noor@example.com", course: "Data Analytics", joined: "Jan 2025", status: "Active", attendance: 96, fees: "Paid" },
  { id: "S-2038", name: "Daniel Cruz", email: "daniel@example.com", course: "Full-Stack Dev", joined: "Jan 2025", status: "On hold", attendance: 62, fees: "Overdue" },
  { id: "S-2037", name: "Riya Joshi", email: "riya@example.com", course: "UI/UX Design", joined: "Dec 2024", status: "Active", attendance: 91, fees: "Paid" },
  { id: "S-2036", name: "Kabir Singh", email: "kabir@example.com", course: "Data Analytics", joined: "Nov 2024", status: "Active", attendance: 85, fees: "Pending" },
];

export const courses = [
  { id: "C-01", name: "UI/UX Design Mastery", level: "Design", students: 312, teacher: "Anjali Rao", price: 25000, currency: "₹", status: "Live" },
  { id: "C-02", name: "Full-Stack Web (3D)", level: "Coding", students: 264, teacher: "James Whitaker", price: 45000, currency: "₹", status: "Live" },
  { id: "C-03", name: "Data Analytics Pro", level: "Analytics", students: 198, teacher: "Karim Idris", price: 35000, currency: "₹", status: "Live" },
  { id: "C-04", name: "Digital Marketing 360", level: "Marketing", students: 176, teacher: "Priya Nair", price: 22000, currency: "₹", status: "Live" },
  { id: "C-05", name: "Product Design Sprint", level: "Design", students: 88, teacher: "Hala Mansour", price: 18000, currency: "₹", status: "Live" },
  { id: "C-06", name: "Python for Data Science", level: "Analytics", students: 142, teacher: "Daniel Cruz", price: 28000, currency: "₹", status: "Live" },
  { id: "C-07", name: "SEO & Content Marketing", level: "Marketing", students: 96, teacher: "Emma Clarke", price: 16000, currency: "₹", status: "Draft" },
  { id: "C-08", name: "React & Next.js Pro", level: "Coding", students: 152, teacher: "Aman Verma", price: 32000, currency: "₹", status: "Live" },
];

export const recordedCourses = [
  { id: "RC-01", title: "UI/UX Design Mastery", modules: 12, lessons: 84, duration: "42h", students: 312, certificate: true },
  { id: "RC-02", title: "Full-Stack Web (3D)", modules: 16, lessons: 124, duration: "68h", students: 264, certificate: true },
  { id: "RC-03", title: "Data Analytics Pro", modules: 10, lessons: 72, duration: "38h", students: 198, certificate: true },
  { id: "RC-04", title: "Digital Marketing 360", modules: 8, lessons: 56, duration: "28h", students: 176, certificate: true },
];

export const classes = [
  { id: "CL-501", course: "UI/UX Design", teacher: "Anjali Rao", date: "Today", time: "4:00 PM", duration: "60 min", students: 18, platform: "Zoom" },
  { id: "CL-502", course: "Full-Stack Dev", teacher: "Karim Idris", date: "Today", time: "6:00 PM", duration: "90 min", students: 24, platform: "Google Meet" },
  { id: "CL-503", course: "Data Analytics", teacher: "Daniel Cruz", date: "Tomorrow", time: "5:00 PM", duration: "120 min", students: 32, platform: "Zoom" },
  { id: "CL-504", course: "Digital Marketing", teacher: "James Whitaker", date: "Tomorrow", time: "7:00 PM", duration: "60 min", students: 16, platform: "Zoom" },
  { id: "CL-505", course: "UI/UX Design", teacher: "Priya Nair", date: "Wed", time: "4:30 PM", duration: "90 min", students: 22, platform: "Google Meet" },
];

export const teachers = [
  { id: "T-101", name: "Anjali Rao", email: "anjali@slate.ac", subject: "UI/UX Design", students: 312, classes: 12, rating: 4.9 },
  { id: "T-102", name: "James Whitaker", email: "james@slate.ac", subject: "Full-Stack Dev", students: 264, classes: 14, rating: 4.8 },
  { id: "T-103", name: "Karim Idris", email: "karim@slate.ac", subject: "Data Analytics", students: 198, classes: 10, rating: 4.9 },
  { id: "T-104", name: "Priya Nair", email: "priya@slate.ac", subject: "Marketing", students: 176, classes: 8, rating: 4.7 },
  { id: "T-105", name: "Hala Mansour", email: "hala@slate.ac", subject: "Product Design", students: 88, classes: 6, rating: 4.8 },
  { id: "T-106", name: "Daniel Cruz", email: "daniel@slate.ac", subject: "Python", students: 142, classes: 9, rating: 4.9 },
];

export const mentors = [
  { id: "M-01", name: "Ananya Krishnan", role: "Sr. Product Designer @ Razorpay", expertise: "UI/UX, Design Systems", sessions: 142, rating: 4.9, featured: true },
  { id: "M-02", name: "Rahul Khanna", role: "Eng. Manager @ Swiggy", expertise: "React, System Design", sessions: 98, rating: 4.8, featured: true },
  { id: "M-03", name: "Sneha Reddy", role: "Data Lead @ Flipkart", expertise: "SQL, Python, ML", sessions: 124, rating: 4.9, featured: false },
  { id: "M-04", name: "Aditya Bose", role: "Growth Lead @ CRED", expertise: "Performance Marketing", sessions: 86, rating: 4.7, featured: true },
  { id: "M-05", name: "Meera Iyer", role: "Sr. UX Researcher @ Zomato", expertise: "User Research", sessions: 64, rating: 4.8, featured: false },
];

export const assignments = [
  { id: "A-201", title: "Design a Mobile Banking App", course: "UI/UX Design", submissions: 184, due: "Apr 22", status: "Open" },
  { id: "A-202", title: "Build a Todo App with React", course: "Full-Stack Dev", submissions: 142, due: "Apr 24", status: "Open" },
  { id: "A-203", title: "SQL Joins Practice Set", course: "Data Analytics", submissions: 96, due: "Apr 20", status: "Closed" },
  { id: "A-204", title: "Run a Google Ads Campaign", course: "Digital Marketing", submissions: 64, due: "Apr 28", status: "Open" },
];

export const certificates = [
  { id: "CERT-9012", student: "Aarav Mehta", course: "UI/UX Design", issued: "Apr 14, 2026", verified: true },
  { id: "CERT-9011", student: "Lina Ahmed", course: "Digital Marketing", issued: "Apr 10, 2026", verified: true },
  { id: "CERT-9010", student: "Noor Sheikh", course: "Data Analytics", issued: "Apr 06, 2026", verified: true },
  { id: "CERT-9009", student: "Riya Joshi", course: "UI/UX Design", issued: "Apr 02, 2026", verified: true },
];

export const knowledgeHub = [
  { id: "KH-01", title: "System Design Cheatsheet", type: "PDF", category: "Interview Prep", size: "2.4 MB", updated: "2d ago" },
  { id: "KH-02", title: "Figma Auto Layout Masterclass", type: "Video", category: "Design", size: "1h 12m", updated: "5d ago" },
  { id: "KH-03", title: "SQL Window Functions Notes", type: "Notes", category: "Analytics", size: "8 pages", updated: "1w ago" },
  { id: "KH-04", title: "Resume Templates Pack", type: "PDF", category: "Career", size: "5.1 MB", updated: "1w ago" },
  { id: "KH-05", title: "React Hooks Deep Dive", type: "Video", category: "Coding", size: "48m", updated: "2w ago" },
  { id: "KH-06", title: "Behavioral Interview Bank", type: "Notes", category: "Interview Prep", size: "24 pages", updated: "2w ago" },
];

export const hiringPartners = [
  { id: "HP-01", company: "Razorpay", industry: "Fintech", openRoles: 8, hires: 24, tier: "Premier" },
  { id: "HP-02", company: "Swiggy", industry: "Food-tech", openRoles: 6, hires: 18, tier: "Premier" },
  { id: "HP-03", company: "Flipkart", industry: "E-commerce", openRoles: 12, hires: 32, tier: "Premier" },
  { id: "HP-04", company: "CRED", industry: "Fintech", openRoles: 4, hires: 11, tier: "Standard" },
  { id: "HP-05", company: "Zomato", industry: "Food-tech", openRoles: 9, hires: 22, tier: "Premier" },
  { id: "HP-06", company: "Meesho", industry: "E-commerce", openRoles: 5, hires: 14, tier: "Standard" },
];

export const studentPlacements = [
  { id: "PL-501", student: "Aarav Mehta", company: "Razorpay", role: "UI Designer", ctc: "₹12 LPA", status: "Offered", date: "Apr 14" },
  { id: "PL-502", student: "Lina Ahmed", company: "Swiggy", role: "Growth Marketer", ctc: "₹10 LPA", status: "Joined", date: "Apr 10" },
  { id: "PL-503", student: "Noor Sheikh", company: "Flipkart", role: "Data Analyst", ctc: "₹14 LPA", status: "Joined", date: "Apr 06" },
  { id: "PL-504", student: "Riya Joshi", company: "Zomato", role: "Product Designer", ctc: "₹13 LPA", status: "Interviewing", date: "Apr 02" },
  { id: "PL-505", student: "Kabir Singh", company: "CRED", role: "Frontend Engineer", ctc: "₹16 LPA", status: "Interviewing", date: "Mar 28" },
];

export const opportunities = [
  { id: "OP-301", company: "Razorpay", role: "Junior UI Designer", type: "Full-time", location: "Bangalore", applicants: 42, posted: "2d ago" },
  { id: "OP-302", company: "Swiggy", role: "Frontend Engineer", type: "Full-time", location: "Bangalore", applicants: 68, posted: "3d ago" },
  { id: "OP-303", company: "Flipkart", role: "Data Analyst Intern", type: "Internship", location: "Remote", applicants: 124, posted: "5d ago" },
  { id: "OP-304", company: "CRED", role: "Growth Associate", type: "Full-time", location: "Bangalore", applicants: 36, posted: "1w ago" },
];

export const successStories = [
  { id: "SS-01", student: "Aarav Mehta", from: "Mech. Engineering Grad", to: "UI Designer @ Razorpay", quote: "Slate gave me a portfolio that landed interviews in 2 weeks." },
  { id: "SS-02", student: "Lina Ahmed", from: "MBA fresher", to: "Growth @ Swiggy", quote: "The marketing bootcamp made me job-ready in 3 months." },
  { id: "SS-03", student: "Noor Sheikh", from: "BCom graduate", to: "Data Analyst @ Flipkart", quote: "From Excel to SQL & Python — a complete career switch." },
];

export const blogPosts = [
  { id: "B-09", title: "How to Build a UI/UX Portfolio That Gets You Hired", category: "Design", status: "Published", author: "Anjali Rao", date: "Apr 12, 2026" },
  { id: "B-08", title: "Top 5 Mistakes Junior Developers Make", category: "Coding", status: "Published", author: "James Whitaker", date: "Apr 08, 2026" },
  { id: "B-07", title: "Data Analytics vs Data Science: Which is Right for You?", category: "Analytics", status: "Published", author: "Slate Editorial", date: "Apr 02, 2026" },
  { id: "B-06", title: "The 2026 Digital Marketing Playbook", category: "Marketing", status: "Draft", author: "Priya Nair", date: "Mar 28, 2026" },
  { id: "B-05", title: "How Live Cohorts Improve Outcomes", category: "Insights", status: "Scheduled", author: "Slate Editorial", date: "Apr 22, 2026" },
];

export const homepageSections = [
  { id: "sec-hero", type: "Hero", title: "Become a Job-Ready UI/UX Designer", visible: true },
  { id: "sec-trust", type: "Trust Strip", title: "5,000+ students · 87% placement", visible: true },
  { id: "sec-services", type: "Services", title: "What we teach", visible: true },
  { id: "sec-testi", type: "Testimonials", title: "Loved by students", visible: true },
  { id: "sec-faq", type: "FAQ", title: "Frequently asked questions", visible: true },
  { id: "sec-cta", type: "CTA", title: "Start your design career today", visible: true },
];

export const landingPages = [
  { id: "LP-01", name: "UI/UX Design Course", slug: "/ui-ux-course", visits: 12400, conversions: 184, cvr: "1.48%", status: "Live" },
  { id: "LP-02", name: "Full-Stack Cohort", slug: "/full-stack", visits: 8200, conversions: 96, cvr: "1.17%", status: "Live" },
  { id: "LP-03", name: "Data Analytics Webinar", slug: "/data-webinar", visits: 5800, conversions: 142, cvr: "2.45%", status: "Live" },
  { id: "LP-04", name: "Marketing Bootcamp", slug: "/marketing", visits: 3200, conversions: 38, cvr: "1.19%", status: "Draft" },
];

export const navMenus = [
  { id: "NM-01", location: "Header", items: 6, lastEdited: "2d ago" },
  { id: "NM-02", location: "Footer", items: 14, lastEdited: "1w ago" },
  { id: "NM-03", location: "Mobile Drawer", items: 8, lastEdited: "3d ago" },
];

export const formsList = [
  { id: "FR-01", name: "Course Inquiry", fields: 5, submissions: 642, conversion: "8.4%", status: "Live" },
  { id: "FR-02", name: "Free Trial Booking", fields: 4, submissions: 312, conversion: "12.1%", status: "Live" },
  { id: "FR-03", name: "Newsletter Signup", fields: 1, submissions: 1842, conversion: "3.2%", status: "Live" },
  { id: "FR-04", name: "Career Application", fields: 7, submissions: 84, conversion: "2.1%", status: "Live" },
];

export const seoPages = [
  { id: "SE-01", page: "/", title: "Slate Academy — Learn Design, Code, Marketing", score: 92, issues: 1 },
  { id: "SE-02", page: "/courses", title: "All Courses — Slate Academy", score: 88, issues: 2 },
  { id: "SE-03", page: "/ui-ux-course", title: "UI/UX Design Course (₹25k) — Slate", score: 96, issues: 0 },
  { id: "SE-04", page: "/blog", title: "Slate Blog — Career, Tech & Design", score: 84, issues: 3 },
];

export const testimonialsList = [
  { id: "TS-01", name: "Aarav Mehta", role: "UI Designer @ Razorpay", rating: 5, featured: true },
  { id: "TS-02", name: "Lina Ahmed", role: "Growth @ Swiggy", rating: 5, featured: true },
  { id: "TS-03", name: "Noor Sheikh", role: "Data Analyst @ Flipkart", rating: 5, featured: true },
  { id: "TS-04", name: "Kabir Singh", role: "Frontend Engineer @ CRED", rating: 4, featured: false },
];

export const emailCampaigns = [
  { id: "EC-01", name: "April Cohort Launch", recipients: 8400, openRate: "42%", clickRate: "12%", status: "Sent" },
  { id: "EC-02", name: "Free Trial Reminder", recipients: 1240, openRate: "58%", clickRate: "22%", status: "Sent" },
  { id: "EC-03", name: "May Newsletter", recipients: 12800, openRate: "—", clickRate: "—", status: "Scheduled" },
  { id: "EC-04", name: "Cart Abandonment", recipients: 320, openRate: "64%", clickRate: "31%", status: "Active" },
];

export const whatsappCampaigns = [
  { id: "WC-01", name: "Trial Booking Confirmation", recipients: 1240, delivered: "98%", read: "82%", status: "Active" },
  { id: "WC-02", name: "Class Reminder (Daily)", recipients: 4200, delivered: "99%", read: "88%", status: "Active" },
  { id: "WC-03", name: "Payment Reminder", recipients: 184, delivered: "97%", read: "76%", status: "Active" },
  { id: "WC-04", name: "Welcome Series", recipients: 642, delivered: "99%", read: "91%", status: "Active" },
];

export const referrals = [
  { id: "RF-01", referrer: "Aarav Mehta", referred: "Vikram Iyer", reward: "₹2,000", status: "Paid", date: "Apr 14" },
  { id: "RF-02", referrer: "Lina Ahmed", referred: "Zara Sheikh", reward: "₹2,000", status: "Pending", date: "Apr 12" },
  { id: "RF-03", referrer: "Noor Sheikh", referred: "Maya Patel", reward: "₹2,000", status: "Paid", date: "Apr 09" },
  { id: "RF-04", referrer: "Riya Joshi", referred: "Yusuf Ali", reward: "₹2,000", status: "Paid", date: "Apr 06" },
];

export const affiliates = [
  { id: "AF-01", name: "DesignBootcamp Blog", visits: 12400, signups: 312, earnings: "₹62,400", status: "Active" },
  { id: "AF-02", name: "TechCareer YT Channel", visits: 8200, signups: 184, earnings: "₹36,800", status: "Active" },
  { id: "AF-03", name: "CodeWithMe Newsletter", visits: 5400, signups: 96, earnings: "₹19,200", status: "Active" },
  { id: "AF-04", name: "Growth Hackers India", visits: 3200, signups: 42, earnings: "₹8,400", status: "Pending" },
];

export const coupons = [
  { id: "CP-01", code: "EARLY25", discount: "25% off", uses: 184, limit: 500, expires: "Apr 30", status: "Active" },
  { id: "CP-02", code: "DESIGN10", discount: "₹10,000 off", uses: 42, limit: 100, expires: "May 15", status: "Active" },
  { id: "CP-03", code: "FRESHER", discount: "15% off", uses: 312, limit: 1000, expires: "Jun 30", status: "Active" },
  { id: "CP-04", code: "ALUMNI", discount: "30% off", uses: 96, limit: 200, expires: "—", status: "Active" },
];

export const installments = [
  { id: "INS-01", student: "Aarav Mehta", course: "UI/UX Design", plan: "3 months", paid: 2, remaining: 1, next: "Apr 28", amount: "₹8,500" },
  { id: "INS-02", student: "Daniel Cruz", course: "Full-Stack Dev", plan: "6 months", paid: 1, remaining: 5, next: "Apr 22", amount: "₹7,500" },
  { id: "INS-03", student: "Kabir Singh", course: "Data Analytics", plan: "3 months", paid: 1, remaining: 2, next: "Apr 25", amount: "₹11,700" },
  { id: "INS-04", student: "Riya Joshi", course: "UI/UX Design", plan: "6 months", paid: 4, remaining: 2, next: "Apr 30", amount: "₹4,200" },
];

export const payments = [
  { id: "INV-9821", student: "Aarav Mehta", course: "UI/UX Design", amount: 8500, currency: "₹", status: "Paid", date: "Apr 14" },
  { id: "INV-9820", student: "Lina Ahmed", course: "Digital Marketing", amount: 22000, currency: "₹", status: "Paid", date: "Apr 13" },
  { id: "INV-9819", student: "Daniel Cruz", course: "Full-Stack Dev", amount: 7500, currency: "₹", status: "Overdue", date: "Apr 10" },
  { id: "INV-9818", student: "Riya Joshi", course: "UI/UX Design", amount: 4200, currency: "₹", status: "Paid", date: "Apr 09" },
  { id: "INV-9817", student: "Kabir Singh", course: "Data Analytics", amount: 11700, currency: "₹", status: "Pending", date: "Apr 08" },
  { id: "INV-9816", student: "Noor Sheikh", course: "Data Analytics", amount: 35000, currency: "₹", status: "Paid", date: "Apr 06" },
];

export const recentActivity = [
  { who: "Aarav Mehta", what: "enrolled in UI/UX Design", when: "12 min ago" },
  { who: "Sara Khan", what: "booked a trial class", when: "38 min ago" },
  { who: "Anjali Rao", what: "uploaded a recording", when: "1 hr ago" },
  { who: "Lina Ahmed", what: "paid ₹22,000", when: "2 hr ago" },
  { who: "Daniel Cruz", what: "marked attendance for Full-Stack", when: "3 hr ago" },
];
