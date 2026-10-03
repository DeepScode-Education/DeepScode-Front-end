import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { SsrDataProvider, type SsrDataBag } from "./ssr/SsrDataContext";


export { fetchSeoForRoute } from "./ssr/fetchSeo";
export { fetchPageData } from "./ssr/fetchPageData";

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
}

export function render(url: string, seo: SeoData = {}, ssrData: SsrDataBag = {}) {
  const html = renderToString(
    <React.StrictMode>
      <SsrDataProvider data={ssrData}>
        <App ssrPath={url} />
      </SsrDataProvider>
    </React.StrictMode>,
  );

  const head = buildHeadTags(seo, url);
  const dataScript = buildDataScript(ssrData);
  return { html, head, dataScript };
}

function esc(s = ""): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHeadTags(seo: SeoData, url: string): string {
  const title = seo.title || "Slate Academy: Best Designing & Marketing Institute in Delhi";
  const description =
    seo.description ||
    "Join the best institute in Delhi for Graphic Design, UI/UX, Motion Graphics, 3D Design, Digital Marketing & Data Analytics courses with 100% placement support.";
  const canonical = seo.canonical || `https://slate-academy.com${url}`;
  const ogImage = seo.ogImage || "";
  const keywords = (seo.keywords || []).join(", ");

  return `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    ${keywords ? `<meta name="keywords" content="${esc(keywords)}" />` : ""}
    <link rel="canonical" href="${esc(canonical)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${esc(canonical)}" />
    ${ogImage ? `<meta property="og:image" content="${esc(ogImage)}" />` : ""}
    ${ogImage ? `<meta property="og:image:width" content="1200" />` : ""}
    ${ogImage ? `<meta property="og:image:height" content="630" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    ${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}" />` : ""}
  `.trim();
}

function buildDataScript(ssrData: SsrDataBag): string {
  const json = JSON.stringify(ssrData ?? {}).replace(/</g, "\\u003c");
  return `<script>window.__SSR_DATA__ = ${json};</script>`;
}