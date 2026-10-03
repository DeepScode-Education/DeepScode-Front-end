// import type { VercelRequest, VercelResponse } from "@vercel/node";
// import fs from "fs";
// import path from "path";

// import { render, fetchSeoForRoute, fetchPageData } from "../dist/server/entry-server.js";

// // function getTemplate(): string {
// //   const templatePath = path.resolve(process.cwd(), "dist/client/index.html");
// //   return fs.readFileSync(templatePath, "utf-8");
// // }



// function getTemplate(): string {
//   const templatePath = path.resolve(process.cwd(), "dist/client/_template.html");
//   return fs.readFileSync(templatePath, "utf-8");
// }
// /**
//  * Vercel rewrite ke baad req.url = "/api/ssr" ho jaata hai.
//  * Original request path yahan se milta hai (priority order):
//  *  1. x-invoke-path  — Vercel internal header (most reliable)
//  *  2. x-matched-path — fallback
//  *  3. referer path   — last resort
//  *  4. "/"            — default
//  */
// function getOriginalPath(req: VercelRequest): string {
//   const invokePath = req.headers["x-invoke-path"];
//   if (invokePath && typeof invokePath === "string" && invokePath !== "/api/ssr") {
//     return invokePath.startsWith("/") ? invokePath : `/${invokePath}`;
//   }

//   const matchedPath = req.headers["x-matched-path"];
//   if (matchedPath && typeof matchedPath === "string" && matchedPath !== "/api/ssr") {
//     // x-matched-path mein kabhi kabhi query string bhi hota hai
//     return matchedPath.split("?")[0];
//   }

//   // req.url ko last resort ki tarah use karo — but /api/ssr filter karo
//   const rawUrl = req.url || "/";
//   if (rawUrl === "/api/ssr" || rawUrl.startsWith("/api/ssr?")) {
//     // Query param mein original path pass hua ho toh use karo (future proofing)
//     const qp = new URL(rawUrl, "http://localhost").searchParams.get("url");
//     return qp || "/";
//   }

//   return rawUrl.split("?")[0] || "/";
// }

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   const url = getOriginalPath(req);

//   console.log("🚀 SSR FUNCTION EXECUTED");
//   console.log("================================");
//   console.log("req.url          :", req.url);
//   console.log("resolved url     :", url);
//   console.log("x-invoke-path    :", req.headers["x-invoke-path"]);
//   console.log("x-matched-path   :", req.headers["x-matched-path"]);
//   console.log("x-forwarded-host :", req.headers["x-forwarded-host"]);
//   console.log("================================");

//   try {
//     const template = getTemplate();

//     const [seo, ssrData] = await Promise.all([
//       fetchSeoForRoute(url),
//       fetchPageData(url),
//     ]);

//     const { html, head, dataScript } = render(url, seo, ssrData);

//     const finalHtml = template
//       .replace("<!--app-head-->", head)
//       .replace("<!--app-html-->", html)
//       .replace("<!--app-data-->", dataScript);

//     res.setHeader("Content-Type", "text/html; charset=utf-8");
//     res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
//     res.status(200).send(finalHtml);
//   } catch (err) {
//     console.error("[SSR] render error for url:", url);
//     console.error("[SSR] Stack:", err instanceof Error ? err.stack : err);

//     try {
//       const fallback = getTemplate()
//         .replace("<!--app-head-->", "")
//         .replace("<!--app-html-->", "")
//         .replace("<!--app-data-->", "");
//       res.setHeader("Content-Type", "text/html; charset=utf-8");
//       res.status(200).send(fallback);
//     } catch {
//       res.status(500).send("Internal Server Error");
//     }
//   }
// }




import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

import { render, fetchSeoForRoute, fetchPageData } from "../dist/server/entry-server.js";

function getTemplate(): string {
  const templatePath = path.resolve(process.cwd(), "dist/client/_template.html");
  return fs.readFileSync(templatePath, "utf-8");
}

function getOriginalPath(req: VercelRequest): string {
  const invokePath = req.headers["x-invoke-path"];
  if (invokePath && typeof invokePath === "string" && invokePath !== "/api/ssr") {
    return invokePath.startsWith("/") ? invokePath : `/${invokePath}`;
  }

  const matchedPath = req.headers["x-matched-path"];
  if (matchedPath && typeof matchedPath === "string" && matchedPath !== "/api/ssr") {
    return matchedPath.split("?")[0];
  }

  const rawUrl = req.url || "/";
  if (rawUrl === "/api/ssr" || rawUrl.startsWith("/api/ssr?")) {
    const qp = new URL(rawUrl, "http://localhost").searchParams.get("url");
    return qp || "/";
  }

  return rawUrl.split("?")[0] || "/";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = getOriginalPath(req);

  console.log("🚀 SSR FUNCTION EXECUTED");
  console.log("================================");
  console.log("req.url          :", req.url);
  console.log("resolved url     :", url);
  console.log("x-invoke-path    :", req.headers["x-invoke-path"]);
  console.log("x-matched-path   :", req.headers["x-matched-path"]);
  console.log("x-forwarded-host :", req.headers["x-forwarded-host"]);
  console.log("================================");

  try {
    const template = getTemplate();

    const [seo, ssrData] = await Promise.all([
      fetchSeoForRoute(url),
      fetchPageData(url),
    ]);

    const { html, head, dataScript } = render(url, seo, ssrData);

    const finalHtml = template
      .replace("<!--app-head-->", head)
      .replace("<!--app-html-->", html)
      .replace("<!--app-data-->", dataScript);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    // NEW: required for Zoom Meeting SDK's SharedArrayBuffer usage.
    // Without this, the embedded Zoom UI renders a black canvas in
    // production even though the SDK loads fine.
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.status(200).send(finalHtml);
  } catch (err) {
    console.error("[SSR] render error for url:", url);
    console.error("[SSR] Stack:", err instanceof Error ? err.stack : err);

    try {
      const fallback = getTemplate()
        .replace("<!--app-head-->", "")
        .replace("<!--app-html-->", "")
        .replace("<!--app-data-->", "");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
      res.status(200).send(fallback);
    } catch {
      res.status(500).send("Internal Server Error");
    }
  }
}