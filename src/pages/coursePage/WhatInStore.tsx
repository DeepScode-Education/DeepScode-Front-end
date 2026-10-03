// import { motion } from "framer-motion";
// import { Layers, Search, GitBranch, PenTool, Zap, ClipboardCheck, Bot, Code2 } from "lucide-react";

// const focusAreas = [
//   {
//     icon: Layers,
//     title: "UI Design",
//     desc: "Visual hierarchy, spacing & component systems.",
//   },
//   {
//     icon: Search,
//     title: "UX Fundamentals",
//     desc: "User research, personas & journey mapping.",
//   },
//   {
//     icon: GitBranch,
//     title: "Information Architecture",
//     desc: "Structuring content and navigation.",
//   },
//   {
//     icon: PenTool,
//     title: "Wireframing",
//     desc: "Low and high fidelity wireframes.",
//   },
//   {
//     icon: Zap,
//     title: "Interactive Prototyping",
//     desc: "Build realistic product interactions.",
//   },
//   {
//     icon: ClipboardCheck,
//     title: "Usability Testing",
//     desc: "Test and iterate on real users.",
//   },
//   {
//     icon: Bot,
//     title: "AI-Powered Design",
//     desc: "ChatGPT, Gemini & AI workflows.",
//   },
//   {
//     icon: Code2,
//     title: "Developer Handoff",
//     desc: "Specs, assets and collaboration.",
//   },
// ];

// const WhatInStore = () => {
//   return (
//     <section className="bg-[#f0f0f5] py-16 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
//             What's in Store
//           </span>
//           <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
//             Everything you need to{" "}
//             <span className="text-[#0037FF]">ship great design</span>
//           </h2>
//           <p className="text-slate-500 mt-3 text-base">
//             8 focus areas. Hands-on practice. Built around real-world product
//             workflows.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {focusAreas.map((area, i) => {
//             const Icon = area.icon;
//             return (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.07 }}
//                 className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className="w-11 h-11 rounded-xl bg-[#0037FF] flex items-center justify-center mb-4">
//                   <Icon className="h-5 w-5 text-white" />
//                 </div>
//                 <h3 className="font-bold text-slate-900 text-base mb-1">
//                   {area.title}
//                 </h3>
//                 <p className="text-slate-500 text-sm leading-relaxed">
//                   {area.desc}
//                 </p>
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default WhatInStore;




import { motion } from "framer-motion";
import {
  Layers, Search, GitBranch, PenTool, Zap, ClipboardCheck, Bot, Code2,
  TrendingUp, Megaphone, BarChart3, Globe, Mail, Video, Palette, Star,
  Play, Camera, Mic, Monitor,
} from "lucide-react";

// Icon pool — cycles through for however many items exist
const iconPool = [
  Layers, Search, GitBranch, PenTool, Zap, ClipboardCheck, Bot, Code2,
  TrendingUp, Megaphone, BarChart3, Globe, Mail, Video, Palette, Star,
  Play, Camera, Mic, Monitor,
];

interface WhatInStoreProps {
  items?: readonly string[];
}

const WhatInStore = ({ items = [] }: WhatInStoreProps) => {
  return (
    <section className="bg-[#f0f0f5] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            What's in Store
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Everything you need to{" "}
            <span className="text-[#0037FF]">level up your skills</span>
          </h2>
          <p className="text-slate-500 mt-3 text-base">
            {items.length} focus areas. Hands-on practice. Built around real-world workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => {
            const Icon = iconPool[i % iconPool.length];
            // Split on " — " or " - " to show title + desc if present
            const parts = item.split(/ [—–-] /);
            const title = parts[0];
            const desc = parts[1] ?? "";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0037FF] flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 leading-snug">
                  {title}
                </h3>
                {desc && (
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatInStore;
