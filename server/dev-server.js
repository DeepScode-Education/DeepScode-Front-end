// import express from "express";
// import fs from "fs";
// import path from "path";
// import { createServer as createViteServer } from "vite";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const ROOT = path.resolve(__dirname, "..");
// const PORT = 5500;

// async function createServer() {
//   const app = express();

//   const vite = await createViteServer({
//     server: { middlewareMode: "ssr" },
//     appType: "custom",
//     resolve: {
//       alias: [
//         {
//           find: /^react-router-dom$/,
//           replacement: path.resolve(ROOT, "node_modules/react-router-dom/dist/index.mjs"),
//         },
//         {
//           find: /^react-router$/,
//           replacement: path.resolve(ROOT, "node_modules/react-router/dist/development/index.mjs"),
//         },
//       ],
//     },
//     ssr: {
//       noExternal: ["react-router-dom", "react-router", "@remix-run/router"],
//     },
//   });

//   app.use(vite.middlewares);

//   app.use(async (req, res) => {
//     const url = req.originalUrl;

//     // Internal / browser requests skip karo
//     if (
//       url.startsWith("/.well-known") ||
//       url.startsWith("/__vite") ||
//       url.startsWith("/@")
//     ) {
//       res.status(404).end();
//       return;
//     }

//     try {
//       let template = fs.readFileSync(path.resolve(ROOT, "index.html"), "utf-8");
//       template = await vite.transformIndexHtml(url, template);

//       const { fetchSeoForRoute } = await vite.ssrLoadModule("/src/ssr/fetchSeo.ts");
//       const { fetchPageData } = await vite.ssrLoadModule("/src/ssr/fetchPageData.ts");
//       const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");

//       const [seo, ssrData] = await Promise.all([
//         fetchSeoForRoute(url),
//         fetchPageData(url),
//       ]);

//       const { html, head, dataScript } = render(url, seo, ssrData);

//       const finalHtml = template
//         .replace("<!--app-head-->", head)
//         .replace("<!--app-html-->", html)
//         .replace("<!--app-data-->", dataScript);

//       res.status(200).set({ "Content-Type": "text/html" }).end(finalHtml);
//     } catch (e) {
//       vite.ssrFixStacktrace(e);
//       console.error("SSR ERROR:", e);
//       res.status(500).end(e.stack);
//     }
//   });

//   app.listen(PORT, () => {
//     console.log(`SSR dev server running at http://localhost:${PORT}`);
//   });
// }

// createServer();




import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = 5500;

async function createServer() {
  const app = express();

  // NEW: required for Zoom Meeting SDK's SharedArrayBuffer usage (video
  // decoding). Without these, Zoom's embedded UI silently renders a black
  // canvas instead of the camera feed. Placed before vite.middlewares so
  // it applies to every response — HTML pages AND the JS/CSS module
  // assets Vite serves in dev mode (Zoom's SDK chunk included).
  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    next();
  });

  const vite = await createViteServer({
    server: { middlewareMode: "ssr" },
    appType: "custom",
    resolve: {
      alias: [
        {
          find: /^react-router-dom$/,
          replacement: path.resolve(ROOT, "node_modules/react-router-dom/dist/index.mjs"),
        },
        {
          find: /^react-router$/,
          replacement: path.resolve(ROOT, "node_modules/react-router/dist/development/index.mjs"),
        },
      ],
    },
    ssr: {
      noExternal: ["react-router-dom", "react-router", "@remix-run/router"],
    },
  });

  app.use(vite.middlewares);

  app.use(async (req, res) => {
    const url = req.originalUrl;

    // Internal / browser requests skip karo
    if (
      url.startsWith("/.well-known") ||
      url.startsWith("/__vite") ||
      url.startsWith("/@")
    ) {
      res.status(404).end();
      return;
    }

    try {
      let template = fs.readFileSync(path.resolve(ROOT, "index.html"), "utf-8");
      template = await vite.transformIndexHtml(url, template);

      const { fetchSeoForRoute } = await vite.ssrLoadModule("/src/ssr/fetchSeo.ts");
      const { fetchPageData } = await vite.ssrLoadModule("/src/ssr/fetchPageData.ts");
      const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");

      const [seo, ssrData] = await Promise.all([
        fetchSeoForRoute(url),
        fetchPageData(url),
      ]);

      const { html, head, dataScript } = render(url, seo, ssrData);

      const finalHtml = template
        .replace("<!--app-head-->", head)
        .replace("<!--app-html-->", html)
        .replace("<!--app-data-->", dataScript);

      res.status(200).set({ "Content-Type": "text/html" }).end(finalHtml);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error("SSR ERROR:", e);
      res.status(500).end(e.stack);
    }
  });

  app.listen(PORT, () => {
    console.log(`SSR dev server running at http://localhost:${PORT}`);
  });
}

createServer();