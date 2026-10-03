// import { mkdirSync, writeFileSync } from "fs";
// import { resolve } from "path";

// const SITE_URL = "https://slate-academy.com";
// const API_BASE = `${(process.env.VITE_API_BASE || "https://slateserver1.onrender.com").replace(/\/$/, "")}/api`;
// const PAGE_SIZE = 100;

// const staticRoutes = [
//   { path: "/", priority: "1.0", changefreq: "daily" },
//   { path: "/courses", priority: "0.9", changefreq: "daily" },
//   { path: "/portfolio", priority: "0.8", changefreq: "weekly" },
//   { path: "/contact", priority: "0.7", changefreq: "weekly" },
//   { path: "/support", priority: "0.7", changefreq: "weekly" },
//   { path: "/support/payments", priority: "0.7", changefreq: "weekly" },
//   { path: "/support/courses", priority: "0.7", changefreq: "weekly" },
//   { path: "/support/account", priority: "0.7", changefreq: "weekly" },
//   { path: "/support/technical", priority: "0.7", changefreq: "weekly" },
//   { path: "/ai-chat", priority: "0.7", changefreq: "weekly" },
//   { path: "/about", priority: "0.8", changefreq: "weekly" },
//   { path: "/careers", priority: "0.7", changefreq: "weekly" },
//   { path: "/blog", priority: "0.8", changefreq: "daily" },
//   { path: "/privacy", priority: "0.3", changefreq: "yearly" },
//   { path: "/mentors", priority: "0.7", changefreq: "weekly" },
//   { path: "/jobs-portal", priority: "0.7", changefreq: "weekly" },
//   { path: "/knowledge-hub", priority: "0.8", changefreq: "weekly" },
//   { path: "/placements", priority: "0.8", changefreq: "weekly" },
// ];

// function escapeXml(value) {
//   return String(value ?? "")
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&apos;");
// }

// function normalizeDate(value, fallback) {
//   const date = value ? new Date(value) : null;
//   return date && !Number.isNaN(date.getTime()) ? date.toISOString() : fallback;
// }

// async function fetchJson(path, params = {}) {
//   const url = new URL(`${API_BASE}${path}`);
//   Object.entries(params).forEach(([key, value]) => {
//     url.searchParams.set(key, String(value));
//   });

//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error(`GET ${url} failed with ${response.status} ${response.statusText}`);
//   }

//   return response.json();
// }

// async function fetchAllPages(path) {
//   const records = [];
//   let page = 1;

//   while (true) {
//     const payload = await fetchJson(path, { page, limit: PAGE_SIZE });
//     const pageRecords = Array.isArray(payload.data) ? payload.data : [];
//     records.push(...pageRecords);

//     const pagination = payload.pagination;
//     const hasNextPage = pagination
//       ? pagination.hasNextPage === true || page < pagination.totalPages
//       : pageRecords.length === PAGE_SIZE;

//     if (!hasNextPage || pageRecords.length === 0) break;
//     page += 1;
//   }

//   return records;
// }

// function isPublishedCourse(course) {
//   return course?.publishing?.isPublished === true || course?.isPublished === true;
// }

// function isPublishedBlog(blog) {
//   return (
//     blog?.status === "Published" &&
//     blog?.deleted !== true &&
//     blog?.isDeleted !== true
//   );
// }

// function addUrl(urls, route) {
//   const loc = `${SITE_URL}${route.path}`;
//   if (!urls.has(loc)) urls.set(loc, { ...route, loc });
// }

// function renderUrl(route, fallbackDate) {
//   return `
//   <url>
//     <loc>${escapeXml(route.loc)}</loc>
//     <lastmod>${escapeXml(normalizeDate(route.lastmod, fallbackDate))}</lastmod>
//     <changefreq>${escapeXml(route.changefreq)}</changefreq>
//     <priority>${escapeXml(route.priority)}</priority>
//   </url>`;
// }

// async function generateSitemap() {
//   const fallbackDate = new Date().toISOString();
//   const urls = new Map();

//   staticRoutes.forEach((route) => addUrl(urls, { ...route, lastmod: fallbackDate }));

//   const courses = await fetchAllPages("/courses");
//   const publishedCourses = courses.filter(isPublishedCourse).filter((course) => course.slug);
//   publishedCourses.forEach((course) => {
//     addUrl(urls, {
//       path: `/${course.slug}`,
//       lastmod: course.updatedAt,
//       changefreq: "weekly",
//       priority: "0.8",
//     });
//   });

//   const blogs = await fetchAllPages("/blogs");
//   const publishedBlogs = blogs.filter(isPublishedBlog).filter((blog) => blog.slug);
//   publishedBlogs.forEach((blog) => {
//     addUrl(urls, {
//       path: `/blog/${blog.slug}`,
//       lastmod: blog.updatedAt,
//       changefreq: "weekly",
//       priority: "0.7",
//     });
//   });

//   const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...urls.values()]
//     .map((route) => renderUrl(route, fallbackDate))
//     .join("")}
// </urlset>
// `;

//   const publicDir = resolve(process.cwd(), "public");
//   mkdirSync(publicDir, { recursive: true });
//   const sitemapPath = resolve(publicDir, "sitemap.xml");
//   writeFileSync(sitemapPath, sitemap);

//   const distDir = resolve(process.cwd(), "dist");
//   mkdirSync(distDir, { recursive: true });
//   const distSitemapPath = resolve(distDir, "sitemap.xml");
//   writeFileSync(distSitemapPath, sitemap);

//   console.log("Sitemap generated successfully.");
//   console.log(`Static URLs: ${staticRoutes.length}`);
//   console.log(`Published courses: ${publishedCourses.length}`);
//   console.log(`Published blogs: ${publishedBlogs.length}`);
//   console.log(`Total URLs: ${urls.size}`);
//   console.log(`File: ${sitemapPath}`);
// }

// generateSitemap().catch((error) => {
//   console.error("Sitemap generation failed:", error.message);
//   process.exitCode = 1;
// });




// scripts/generate-sitemap.js
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Your website URL - MAKE SURE THIS IS CORRECT
const SITE_URL = 'https://slate-academy.com'; // NO trailing slash!

// Define your routes
// const staticRoutes = [
//     { path: '/', priority: 1.0, changefreq: 'daily' },
//     { path: '/courses', priority: 0.9, changefreq: 'daily' },
//     { path: '/portfolio', priority: 0.8, changefreq: 'weekly' },
//     { path: '/support', priority: 0.7, changefreq: 'weekly' },
//     { path: '/ai-chat', priority: 0.7, changefreq: 'weekly' },
// ];

const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/courses", priority: "0.9", changefreq: "daily" },
  { path: "/portfolio", priority: "0.8", changefreq: "weekly" },
  { path: "/contact", priority: "0.7", changefreq: "weekly" },
  { path: "/support", priority: "0.7", changefreq: "weekly" },
  { path: "/support/payments", priority: "0.7", changefreq: "weekly" },
  { path: "/support/courses", priority: "0.7", changefreq: "weekly" },
  { path: "/support/account", priority: "0.7", changefreq: "weekly" },
  { path: "/support/technical", priority: "0.7", changefreq: "weekly" },
  { path: "/ai-chat", priority: "0.7", changefreq: "weekly" },
  { path: "/about", priority: "0.8", changefreq: "weekly" },
  { path: "/careers", priority: "0.7", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/mentors", priority: "0.7", changefreq: "weekly" },
  { path: "/jobs-portal", priority: "0.7", changefreq: "weekly" },
  { path: "/knowledge-hub", priority: "0.8", changefreq: "weekly" },
  { path: "/placements", priority: "0.8", changefreq: "weekly" },
];

const generateSitemap = () => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        staticRoutes.forEach(route => {
            const url = `${SITE_URL}${route.path}`;
            sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
        });

        sitemap += `
</urlset>`;

        // Ensure public directory exists
        const publicDir = resolve(process.cwd(), 'public');
        mkdirSync(publicDir, { recursive: true });

        // Write the file
        const sitemapPath = resolve(publicDir, 'sitemap.xml');
        writeFileSync(sitemapPath, sitemap);

        // If a build output directory exists (e.g. dist), also write the sitemap there
        try {
            const outDir = resolve(process.cwd(), 'dist');
            const distSitemapPath = resolve(outDir, 'sitemap.xml');
            // Only write if dist directory exists (i.e., after a build)
            mkdirSync(outDir, { recursive: true });
            writeFileSync(distSitemapPath, sitemap);
            console.log(`📍 Also wrote sitemap to: ${distSitemapPath}`);
        } catch (err) {
            // Non-fatal: if we can't write to dist, it's fine — public has the file.
        }

        console.log('✅ Sitemap generated successfully!');
        console.log(`📍 File location: ${sitemapPath}`);
        console.log(`📍 Sitemap URL: ${SITE_URL}/sitemap.xml`);
    } catch (error) {
        console.error('❌ Error generating sitemap:', error.message);
    }
};

generateSitemap();