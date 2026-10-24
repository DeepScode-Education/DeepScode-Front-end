
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import path from 'path'
// import viteCompression from 'vite-plugin-compression';
// import { visualizer } from "rollup-plugin-visualizer";

// const ROOT = process.cwd();

// export default defineConfig(({ mode, isSsrBuild }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//   },
//   plugins: [
//     react(),
//     !isSsrBuild &&
//       visualizer({
//         open: true,
//         gzipSize: true,
//       }),
//     mode === 'production' && viteCompression({
//       verbose: false,
//       disable: false,
//       threshold: 10240,
//       algorithm: 'gzip',
//       ext: '.gz',
//     }),
//   ].filter(Boolean),
//   resolve: {
//     alias: [
//       {
//         find: "@",
//         replacement: path.resolve(ROOT, "./src"),
//       },
//       {
//         // Only match exact "react-router-dom" — not subpaths
//         find: /^react-router-dom$/,
//         replacement: path.resolve(
//           ROOT,
//           "node_modules/react-router-dom/dist/index.mjs"
//         ),
//       },
//       {
//         // Only match exact "react-router" — not "react-router/dom" etc.
//         find: /^react-router$/,
//         replacement: path.resolve(
//           ROOT,
//           "node_modules/react-router/dist/development/index.mjs"
//         ),
//       },
//     ],
//   },
//   build: {
//     target: 'es2020',
//     minify: mode === 'production' ? 'terser' : false,
//     terserOptions: mode === 'production' ? {
//       compress: {
//         drop_console: true,
//         drop_debugger: true,
//       },
//     } : undefined,
//     rollupOptions: isSsrBuild
//       ? {
//           // Ensure SSR entry point is explicit and output is a single named file
//           input: 'src/entry-server.tsx',
//           output: {
//             format: 'es',
//             entryFileNames: 'entry-server.js',
//           },
//         }
//       : {
//           input: 'index.html',
//           output: {
//             manualChunks(id) {
//               if (!id.includes('node_modules')) return;

//               // IMPORTANT: charts-vendor check MUST come before the generic
//               // react-vendor check. recharts pulls in its own internal deps
//               // (react-smooth, d3-*, etc.) whose file paths contain the
//               // substring "react". If the broad react check ran first, those
//               // internal deps would get pulled into react-vendor while the
//               // rest of recharts stayed in charts-vendor — splitting a single
//               // library across two chunks that reference each other. That
//               // circular chunk reference is what caused the
//               // "Cannot access 'o' before initialization" crash.
//               if (
//                 id.includes('recharts') ||
//                 id.includes('date-fns') ||
//                 id.includes('react-smooth') ||
//                 id.includes('d3-') ||
//                 id.includes('victory-vendor')
//               ) {
//                 return 'charts-vendor';
//               }

//               if (
//                 id.includes('react-router-dom') ||
//                 id.includes('react-router') ||
//                 id.includes('@remix-run/router')
//               ) {
//                 return 'react-router-vendor';
//               }

//               // Narrowed from id.includes('react') to path-segment matches
//               // so packages like "react-smooth" (used by recharts) don't get
//               // swept into react-vendor by accident.
//               if (
//                 id.includes('/react/') ||
//                 id.includes('/react-dom/') ||
//                 id.includes('@radix-ui') ||
//                 id.includes('react-icons')
//               ) {
//                 return 'react-vendor';
//               }

//               if (id.includes('framer-motion') || id.includes('lucide-react')) {
//                 return 'ui-vendor';
//               }

//               if (
//                 id.includes('axios') ||
//                 id.includes('@tanstack') ||
//                 id.includes('react-query') ||
//                 id.includes('@supabase')
//               ) {
//                 return 'data-vendor';
//               }
//             },
//           },
//         },
//     sourcemap: mode === 'development',
//     chunkSizeWarningLimit: 500,
//   },
//   optimizeDeps: {
//     include: ['react', 'react-dom', 'react-router-dom'],
//   },
//   ssr: {
//     noExternal: ["react-router-dom", "react-router", "@remix-run/router"],
//   },
// }))




import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import viteCompression from 'vite-plugin-compression';
import { visualizer } from "rollup-plugin-visualizer";

const ROOT = process.cwd();

export default defineConfig(({ mode, isSsrBuild }) => ({
  server: {
    host: "::",
    port: 8080,
    // NEW: required for Zoom Meeting SDK's SharedArrayBuffer usage
    // (video decoding). Without these, Zoom silently renders a black
    // canvas instead of the camera feed.
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
  },
  plugins: [
    react(),
    !isSsrBuild &&
      visualizer({
        open: true,
        gzipSize: true,
      }),
    mode === 'production' && viteCompression({
      verbose: false,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ].filter(Boolean),
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(ROOT, "./src"),
      },
      {
        // Only match exact "react-router-dom" — not subpaths
        find: /^react-router-dom$/,
        replacement: path.resolve(
          ROOT,
          "node_modules/react-router-dom/dist/index.mjs"
        ),
      },
      {
        // Only match exact "react-router" — not "react-router/dom" etc.
        find: /^react-router$/,
        replacement: path.resolve(
          ROOT,
          "node_modules/react-router/dist/development/index.mjs"
        ),
      },
    ],
  },
  build: {
    target: 'es2020',
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    } : undefined,
    rollupOptions: isSsrBuild
      ? {
          // Ensure SSR entry point is explicit and output is a single named file
          input: 'src/entry-server.tsx',
          output: {
            format: 'es',
            entryFileNames: 'entry-server.js',
          },
        }
      : {
          input: 'index.html',
          output: {
            manualChunks(id) {
              if (!id.includes('node_modules')) return;

              // IMPORTANT: charts-vendor check MUST come before the generic
              // react-vendor check. recharts pulls in its own internal deps
              // (react-smooth, d3-*, etc.) whose file paths contain the
              // substring "react". If the broad react check ran first, those
              // internal deps would get pulled into react-vendor while the
              // rest of recharts stayed in charts-vendor — splitting a single
              // library across two chunks that reference each other. That
              // circular chunk reference is what caused the
              // "Cannot access 'o' before initialization" crash.
              if (
                id.includes('react-router-dom') ||
                id.includes('react-router') ||
                id.includes('@remix-run/router')
              ) {
                return 'react-router-vendor';
              }

              if (
                id.includes('@zoom') ||
                id.includes('zoom') ||
                id.includes('live-class')
              ) {
                return 'zoom-vendor';
              }

              if (id.includes('recharts') || id.includes('d3-') || id.includes('react-smooth')) {
                return 'charts-vendor';
              }

              if (id.includes('aos')) {
                return 'aos-vendor';
              }

              if (id.includes('framer-motion')) {
                return 'motion-vendor';
              }

              if (id.includes('embla-carousel')) {
                return 'carousel-vendor';
              }

              if (id.includes('@tiptap') || id.includes('@dnd-kit')) {
                return 'editor-vendor';
              }

              // React itself is shared by every route. Keep route-only UI
              // packages out of this initial chunk; grouping all Radix and
              // icons here pulled admin UI onto the public homepage.
              if (
                id.includes('/react/') ||
                id.includes('/react-dom/')
              ) {
                return 'react-vendor';
              }

              if (
                id.includes('axios') ||
                id.includes('@tanstack') ||
                id.includes('react-query') ||
                id.includes('@supabase')
              ) {
                return 'data-vendor';
              }
            },
          },
        },
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 500,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  ssr: {
    noExternal: ["react-router-dom", "react-router", "@remix-run/router"],
  },
}))
