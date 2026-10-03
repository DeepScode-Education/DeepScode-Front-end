// import { motion } from "framer-motion";
// import { useRef } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// const phases = [
//   { phase: "Phase 1", title: "Design Foundations" },
//   { phase: "Phase 2", title: "UX Research" },
//   { phase: "Phase 3", title: "Information Architecture" },
//   { phase: "Phase 4", title: "Wireframing" },
//   { phase: "Phase 5", title: "UI Design" },
//   { phase: "Phase 6", title: "Prototyping" },
//   { phase: "Phase 7", title: "AI-Powered Design" },
//   { phase: "Phase 8", title: "Portfolio & Career" },
// ];

// const LearningRoadmap = () => {
//   const scrollRef = useRef<HTMLDivElement>(null);

//   const scroll = (dir: "left" | "right") => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
//     }
//   };

//   return (
//     <section className="bg-white py-16 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
//             Learning Roadmap
//           </span>
//           <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
//             Your 8-Phase Journey to a{" "}
//             <span className="text-[#0037FF]">Design Career</span>
//           </h2>
//           <p className="text-slate-500 mt-3 text-base">
//             A structured path from absolute beginner to portfolio-ready professional.
//           </p>
//         </div>

//         {/* Scrollable phases */}
//         <div className="relative">
//           <button
//             onClick={() => scroll("left")}
//             className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-2 shadow-md hover:bg-slate-50 -ml-4"
//           >
//             <ChevronLeft className="h-4 w-4 text-slate-600" />
//           </button>

//           <div
//             ref={scrollRef}
//             className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-6"
//             style={{ scrollbarWidth: "none" }}
//           >
//             {phases.map((p, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 16 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.07 }}
//                 className="flex-shrink-0 w-52 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-[#0037FF]/30 transition-all duration-200"
//               >
//                 <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
//                   {p.phase}
//                 </span>
//                 <h3 className="font-bold text-slate-900 text-sm mt-2 leading-snug">
//                   {p.title}
//                 </h3>
//                 <div className="h-0.5 w-8 mt-3 rounded-full bg-slate-200" />
//               </motion.div>
//             ))}
//           </div>

//           <button
//             onClick={() => scroll("right")}
//             className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-2 shadow-md hover:bg-slate-50 -mr-4"
//           >
//             <ChevronRight className="h-4 w-4 text-slate-600" />
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default LearningRoadmap;











import { motion } from "framer-motion";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoadmapLevel {
  level    : string;
  tagline  : string;
  duration : string;
  schedule : string;
  modules  : string[];
  ctaLabel : string;
}

interface LearningRoadmapProps {
  roadmap?: readonly RoadmapLevel[];
}

const LearningRoadmap = ({ roadmap = [] }: LearningRoadmapProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
    }
  };

  // Flatten modules across all levels into phase cards for the scrollable strip
  const phases = roadmap.flatMap((lvl) =>
    lvl.modules.map((mod) => ({ phase: lvl.level, title: mod }))
  );

  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Learning Roadmap
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Your Journey to a{" "}
            <span className="text-[#0037FF]">Successful Career</span>
          </h2>
          <p className="text-slate-500 mt-3 text-base">
            A structured path from absolute beginner to portfolio-ready professional.
          </p>
        </div>

        {/* Level summary cards */}
        {roadmap.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {roadmap.map((lvl, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col"
              >
                <div className="flex-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#0037FF]">
                    {lvl.level}
                  </span>
                  <p className="text-slate-500 text-sm mt-1 mb-3 italic">{lvl.tagline}</p>
                  <div className="flex gap-4 text-xs text-slate-500 mb-4">
                    <span>⏱ {lvl.duration}</span>
                    <span>📅 {lvl.schedule}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 w-fit mt-auto">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  {lvl.ctaLabel}
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Scrollable modules strip */}
        {phases.length > 0 && (
          <div className="relative">
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-2 shadow-md hover:bg-slate-50 -ml-4"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-2 px-6"
              style={{ scrollbarWidth: "none" }}
            >
              {phases.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-shrink-0 w-52 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-[#0037FF]/30 transition-all duration-200"
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                    {p.phase.replace("LEVEL ", "L")}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-2 leading-snug">{p.title}</h3>
                  <div className="h-0.5 w-8 mt-3 rounded-full bg-slate-200" />
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-2 shadow-md hover:bg-slate-50 -mr-4"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LearningRoadmap;