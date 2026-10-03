// import { motion } from "framer-motion";
// import { Compass, PenTool, Bot, FolderKanban, Rocket, Briefcase } from "lucide-react";

// const outcomes = [
//   {
//     icon: Compass,
//     title: "End-to-End Product Design",
//     desc: "Design complete digital products from research to prototype.",
//   },
//   {
//     icon: PenTool,
//     title: "Figma Expertise",
//     desc: "Master Figma and industry-standard workflows.",
//   },
//   {
//     icon: Bot,
//     title: "AI-Powered Design",
//     desc: "Use AI to accelerate ideation, research and content.",
//   },
//   {
//     icon: FolderKanban,
//     title: "Portfolio Development",
//     desc: "Build real-world case studies that impress recruiters.",
//   },
//   {
//     icon: Rocket,
//     title: "Product Thinking",
//     desc: "Design, technology and business — in one playbook.",
//   },
//   {
//     icon: Briefcase,
//     title: "Career Readiness",
//     desc: "UI, UX, Product, Research and App Designer roles.",
//   },
// ];

// const WhatYouMaster = () => {
//   return (
//     <section className="bg-[#f0f0f5] py-16 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
//             Outcomes
//           </span>
//           <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
//             What You'll{" "}
//             <span className="text-[#0037FF]">Master</span>
//           </h2>
//           <p className="text-slate-500 mt-3 text-base">
//             Skills that translate directly into design jobs and freelance work.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//           {outcomes.map((item, i) => {
//             const Icon = item.icon;
//             return (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 16 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.08 }}
//                 className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow group"
//               >
//                 <Icon className="h-6 w-6 text-[#0037FF] mb-4 group-hover:scale-110 transition-transform" />
//                 <h3 className="font-bold text-slate-900 text-base mb-2">
//                   {item.title}
//                 </h3>
//                 <p className="text-slate-500 text-sm leading-relaxed">
//                   {item.desc}
//                 </p>
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default WhatYouMaster;




import { motion } from "framer-motion";
import {
  Compass, PenTool, Bot, FolderKanban, Rocket, Briefcase,
  TrendingUp, Globe, BarChart3, Megaphone, CheckCircle2, Star,
  Play, Camera, Layers, Zap,
} from "lucide-react";

const iconPool = [
  Compass, PenTool, Bot, FolderKanban, Rocket, Briefcase,
  TrendingUp, Globe, BarChart3, Megaphone, CheckCircle2, Star,
  Play, Camera, Layers, Zap,
];

interface WhatYouMasterProps {
  outcomes?: readonly string[];
}

const WhatYouMaster = ({ outcomes = [] }: WhatYouMasterProps) => {
  return (
    <section className="bg-[#f0f0f5] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Outcomes
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            What You'll{" "}
            <span className="text-[#0037FF]">Master</span>
          </h2>
          <p className="text-slate-500 mt-3 text-base">
            Skills that translate directly into jobs and freelance work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {outcomes.map((item, i) => {
            const Icon = iconPool[i % iconPool.length];
            const parts = item.split(/ [—–-] /);
            const title = parts[0];
            const desc  = parts[1] ?? "";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow group"
              >
                <Icon className="h-6 w-6 text-[#0037FF] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">{title}</h3>
                {desc && <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatYouMaster;
