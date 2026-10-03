// import { motion } from "framer-motion";
// import { Calendar, CheckCircle2, Download } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface RoadmapLevel {
//   title      : string;
//   duration   : string;
//   description: string;
//   modules    : string[];
//   schedule   : string;
//   ctaLabel   : string;
//   /** Per-level Cloudinary PDF URL set by admin. null = not uploaded yet. */
//   ctaFileUrl?: string | null;
// }

// interface ProgramStructureProps {
//   roadmap?           : readonly RoadmapLevel[];
//   /** Global syllabus PDF — used as fallback when a level has no ctaFileUrl. */
//   syllabus?          : string;
//   onRequestDownload? : (fileUrl: string, label: string) => void;
// }

// const ProgramStructure = ({
//   roadmap = [],
//   syllabus,
//   onRequestDownload,
// }: ProgramStructureProps) => {
//   const [level1, level2] = roadmap;

//   /**
//    * Determine which PDF URL to use for a level.
//    * Returns null if nothing is available (button will be disabled).
//    */
//   const resolveFileUrl = (level: RoadmapLevel): string | null =>
//     level.ctaFileUrl || syllabus || null;

//   /**
//    * Called when the user clicks a CTA button.
//    *
//    * If onRequestDownload is provided (parent wants to intercept — e.g. to
//    * show a lead-capture form first), delegate to it.
//    * Otherwise fall through to a direct browser download.
//    */
//   const handleDownload = (level: RoadmapLevel) => {
//     const fileUrl = resolveFileUrl(level);
//     if (!fileUrl) return;

//     if (onRequestDownload) {
//       onRequestDownload(fileUrl, level.ctaLabel);
//       return;
//     }

//     // Direct download fallback
//     const link = document.createElement("a");
//     link.href     = fileUrl;
//     link.download = `Slate-Academy-${level.ctaLabel.replace(/\s+/g, "-")}.pdf`;
//     link.target   = "_blank";   // open in new tab for raw-storage URLs
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <section className="bg-[#f0f0f5] py-16 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
//             Program Structure
//           </span>
//           <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
//             Two Levels. One{" "}
//             <span className="text-[#0037FF]">Transformation.</span>
//           </h2>
//           <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
//             A modular path designed to take you from foundations to AI-powered expertise.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//           {/* ── Level 1 ─────────────────────────────────────────────────── */}
//           {level1 && (() => {
//             const fileUrl   = resolveFileUrl(level1);
//             const isReady   = Boolean(fileUrl);

//             return (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: 0.1 }}
//                 className="bg-white rounded-3xl border-2 border-[#0037FF]/30 shadow-xl shadow-[#0037FF]/10 p-7 relative flex flex-col"
//               >
//                 <span className="text-xs font-bold tracking-widest text-[#0037FF] uppercase">
//                   Level 1
//                 </span>
//                 <h3 className="text-3xl font-black text-slate-900 mt-1 mb-1">
//                   Professional
//                 </h3>
//                 <p className="text-[#0037FF] text-sm font-medium mb-3">
//                   Foundation → Pro
//                 </p>
//                 <p className="text-slate-500 text-sm mb-5">{level1.description || level1.title}</p>

//                 <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-3 mb-5">
//                   <Calendar className="h-4 w-4 text-[#0037FF]" />
//                   <span className="text-sm text-slate-700 font-medium">
//                     Duration: {level1.duration}
//                   </span>
//                 </div>

//                 <p className="text-xs text-slate-400 mb-3 font-medium">{level1.schedule}</p>

//                 <ul className="space-y-2.5 mb-6 flex-1">
//                   {level1.modules.map((mod, i) => (
//                     <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
//                       <CheckCircle2 className="h-4 w-4 text-[#0037FF] flex-shrink-0" />
//                       {mod}
//                     </li>
//                   ))}
//                 </ul>

//                 <Button
//                   variant="outline"
//                   onClick={() => handleDownload(level1)}
//                   disabled={!isReady}
//                   title={isReady ? `Download ${level1.ctaLabel}` : "PDF not available yet"}
//                   className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <Download className="h-4 w-4 mr-2" />
//                   {isReady ? level1.ctaLabel : "Coming Soon"}
//                 </Button>
//               </motion.div>
//             );
//           })()}

//           {/* ── Level 2 ─────────────────────────────────────────────────── */}
//           {level2 && (() => {
//             const fileUrl   = resolveFileUrl(level2);
//             const isReady   = Boolean(fileUrl);

//             return (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: 0.2 }}
//                 className="bg-white rounded-3xl border-2 border-[#0037FF]/30 shadow-xl shadow-[#0037FF]/10 p-7 relative flex flex-col"
//               >
//                 <span className="absolute -top-3 right-6 bg-[#0037FF] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
//                   Most Recommended
//                 </span>

//                 <span className="text-xs font-bold tracking-widest text-[#0037FF] uppercase">
//                   Level 2
//                 </span>
//                 <h3 className="text-3xl font-black text-slate-900 mt-1 mb-1">
//                   Expert
//                 </h3>
//                 <p className="text-[#0037FF] text-sm font-medium mb-3">
//                   AI-Powered Mastery
//                 </p>
//                 <p className="text-slate-500 text-sm mb-5">{level2.description || level2.title}</p>

//                 <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-3 mb-5">
//                   <Calendar className="h-4 w-4 text-[#0037FF]" />
//                   <span className="text-sm text-slate-700 font-medium">
//                     Duration: {level2.duration}
//                   </span>
//                 </div>

//                 <p className="text-xs text-slate-400 mb-3 font-medium">{level2.schedule}</p>

//                 <ul className="space-y-2.5 mb-6 flex-1">
//                   {level2.modules.map((mod, i) => (
//                     <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
//                       <CheckCircle2 className="h-4 w-4 text-[#0037FF] flex-shrink-0" />
//                       {mod}
//                     </li>
//                   ))}
//                 </ul>

//                 <Button
//                   onClick={() => handleDownload(level2)}
//                   disabled={!isReady}
//                   title={isReady ? `Download ${level2.ctaLabel}` : "PDF not available yet"}
//                   className="w-full bg-[#0037FF] hover:bg-[#4a6ff7] text-white mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <Download className="h-4 w-4 mr-2" />
//                   {isReady ? level2.ctaLabel : "Coming Soon"}
//                 </Button>
//               </motion.div>
//             );
//           })()}

//         </div>
//       </div>
//     </section>
//   );
// };

// export default ProgramStructure;



import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoadmapLevel {
  title      : string;
  duration   : string;
  description: string;
  modules    : string[];
  schedule   : string;
  ctaLabel   : string;
  /** Per-level Cloudinary PDF URL set by admin. null = not uploaded yet. */
  ctaFileUrl?: string | null;
}

interface ProgramStructureProps {
  roadmap?: readonly RoadmapLevel[];
  /**
   * Global syllabus PDF — currently unused for per-level readiness on
   * purpose. Each level's button must reflect only its OWN ctaFileUrl;
   * falling back to a shared syllabus here previously let Level 2 borrow
   * Level 1's file (or vice versa) whenever its own PDF wasn't uploaded,
   * showing "enabled" for content that doesn't actually exist for that level.
   * Kept as a prop in case you want a distinct top-level "overview" CTA later.
   */
  syllabus?: string | null;
  /**
   * Supplied by the page-level useDownload() hook (via CourseDetail).
   * This component never downloads anything itself — it only asks for one.
   */
  onRequestDownload: (fileUrl: string, label: string) => void;
}

const ProgramStructure = ({
  roadmap = [],
  onRequestDownload,
}: ProgramStructureProps) => {
  const [level1, level2] = roadmap;

  /**
   * Each level is only "ready" if admin has uploaded a PDF for THAT level.
   * No cross-level or global fallback — a missing ctaFileUrl means the
   * button stays disabled ("Coming Soon"), full stop.
   */
  const resolveFileUrl = (level: RoadmapLevel): string | null =>
    level.ctaFileUrl ?? null;

  return (
    <section className="bg-[#f0f0f5] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Program Structure
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
            Two Levels. One{" "}
            <span className="text-[#0037FF]">Transformation.</span>
          </h2>
          <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto font-medium">
            A modular path designed to take you from foundations to AI-powered expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Level 1 ─────────────────────────────────────────────────── */}
          {level1 && (() => {
            const fileUrl = resolveFileUrl(level1);
            const isReady = Boolean(fileUrl);

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl border-2 border-[#0037FF]/30 shadow-xl shadow-[#0037FF]/10 p-7 relative flex flex-col"
              >
                <span className="text-xs font-bold tracking-widest text-[#0037FF] uppercase">
                  Level 1
                </span>
                <h3 className="text-3xl font-black text-slate-900 mt-1 mb-1">
                  Professional
                </h3>
                <p className="text-[#0037FF] text-sm font-medium mb-3">
                  Foundation → Pro
                </p>
                <p className="text-slate-500 text-sm mb-5">{level1.description || level1.title}</p>

                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-3 mb-5">
                  <Calendar className="h-4 w-4 text-[#0037FF]" />
                  <span className="text-sm text-slate-700 font-medium">
                    Duration: {level1.duration}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3 font-medium">{level1.schedule}</p>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {level1.modules.map((mod, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-[#0037FF] flex-shrink-0" />
                      {mod}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  onClick={() => fileUrl && onRequestDownload(fileUrl, level1.ctaLabel)}
                  disabled={!isReady}
                  title={isReady ? `Download ${level1.ctaLabel}` : "PDF not available yet"}
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isReady ? level1.ctaLabel : "Coming Soon"}
                </Button>
              </motion.div>
            );
          })()}

          {/* ── Level 2 ─────────────────────────────────────────────────── */}
          {level2 && (() => {
            const fileUrl = resolveFileUrl(level2);
            const isReady = Boolean(fileUrl);

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl border-2 border-[#0037FF]/30 shadow-xl shadow-[#0037FF]/10 p-7 relative flex flex-col"
              >
                <span className="absolute -top-3 right-6 bg-[#0037FF] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Recommended
                </span>

                <span className="text-xs font-bold tracking-widest text-[#0037FF] uppercase">
                  Level 2
                </span>
                <h3 className="text-3xl font-black text-slate-900 mt-1 mb-1">
                  Expert
                </h3>
                <p className="text-[#0037FF] text-sm font-medium mb-3">
                  AI-Powered Mastery
                </p>
                <p className="text-slate-500 text-sm mb-5">{level2.description || level2.title}</p>

                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-3 mb-5">
                  <Calendar className="h-4 w-4 text-[#0037FF]" />
                  <span className="text-sm text-slate-700 font-medium">
                    Duration: {level2.duration}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3 font-medium">{level2.schedule}</p>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {level2.modules.map((mod, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-[#0037FF] flex-shrink-0" />
                      {mod}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => fileUrl && onRequestDownload(fileUrl, level2.ctaLabel)}
                  disabled={!isReady}
                  title={isReady ? `Download ${level2.ctaLabel}` : "PDF not available yet"}
                  className="w-full bg-[#0037FF] hover:bg-[#4a6ff7] text-white mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isReady ? level2.ctaLabel : "Coming Soon"}
                </Button>
              </motion.div>
            );
          })()}

        </div>
      </div>
    </section>
  );
};

export default ProgramStructure;