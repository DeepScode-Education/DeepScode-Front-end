// import { motion } from "framer-motion";

// const projects = [
//   {
//     title: "Food Delivery App",
//     tags: ["Figma · ProtoPie", "Intermediate", "FoodTech"],
//     image: null,
//     bg: "from-violet-100 to-blue-100",
//   },
//   {
//     title: "E-Commerce Platform",
//     tags: ["Figma · Framer", "Advanced", "Retail"],
//     image: null,
//     bg: "from-blue-100 to-indigo-100",
//   },
//   {
//     title: "Healthcare Dashboard",
//     tags: ["Figma · Miro", "Advanced", "HealthTech"],
//     image: null,
//     bg: "from-emerald-100 to-teal-100",
//     featured: true,
//   },
//   {
//     title: "Travel Booking App",
//     tags: ["Figma · ProtoPie", "Intermediate", "Travel"],
//     image: null,
//     bg: "from-amber-100 to-orange-100",
//   },
//   {
//     title: "Fintech Mobile App",
//     tags: ["Figma · Framer", "Advanced", "Fintech"],
//     image: null,
//     bg: "from-pink-100 to-rose-100",
//   },
//   {
//     title: "SaaS Admin Dashboard",
//     tags: ["Figma · Dev Mode", "Pro", "SaaS"],
//     image: null,
//     bg: "from-purple-100 to-violet-100",
//   },
// ];

// const tagColors: Record<string, string> = {
//   Intermediate: "bg-blue-50 text-[#0037FF] border-blue-100",
//   Advanced: "bg-violet-50 text-violet-600 border-violet-100",
//   Pro: "bg-emerald-50 text-emerald-600 border-emerald-100",
//   FoodTech: "bg-orange-50 text-orange-600 border-orange-100",
//   Retail: "bg-pink-50 text-pink-600 border-pink-100",
//   HealthTech: "bg-teal-50 text-teal-600 border-teal-100",
//   Travel: "bg-sky-50 text-sky-600 border-sky-100",
//   Fintech: "bg-indigo-50 text-indigo-600 border-indigo-100",
//   SaaS: "bg-purple-50 text-purple-600 border-purple-100",
// };

// const PortfolioProjects = () => {
//   return (
//     <section className="bg-white py-16 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
//             Portfolio Projects
//           </span>
//           <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
//             Ship 6{" "}
//             <span className="text-[#0037FF]">Real-World Projects</span>
//           </h2>
//           <p className="text-slate-500 mt-3 text-base">
//             Each project is a polished case study you can show to recruiters and
//             clients.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//           {projects.map((project, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.08 }}
//               className={`rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${
//                 project.featured
//                   ? "border-[#0037FF]/30 ring-1 ring-[#0037FF]/20"
//                   : "border-slate-100"
//               }`}
//             >
//               {/* Mock project preview */}
//               <div
//                 className={`h-44 bg-gradient-to-br ${project.bg} flex items-center justify-center`}
//               >
//                 <div className="w-3/4 h-3/4 bg-white/60 rounded-xl backdrop-blur-sm flex items-center justify-center border border-white/80 shadow-sm">
//                   <span className="text-slate-400 text-xs font-medium">
//                     {project.title}
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-white p-5">
//                 <h3 className="font-bold text-slate-900 text-base mb-3">
//                   {project.title}
//                 </h3>
//                 <div className="flex flex-wrap gap-1.5">
//                   {project.tags.map((tag, j) => (
//                     <span
//                       key={j}
//                       className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
//                         tagColors[tag] ||
//                         "bg-slate-50 text-slate-500 border-slate-100"
//                       }`}
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PortfolioProjects;









import { motion } from "framer-motion";

const gradients = [
  "from-violet-100 to-blue-100",
  "from-blue-100 to-indigo-100",
  "from-emerald-100 to-teal-100",
  "from-amber-100 to-orange-100",
  "from-pink-100 to-rose-100",
  "from-purple-100 to-violet-100",
];

interface Project {
  title       : string;
  description : string;
}

interface PortfolioProjectsProps {
  projects?: readonly Project[];
}

const PortfolioProjects = ({ projects = [] }: PortfolioProjectsProps) => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Portfolio Projects
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
            Ship{" "}
            <span className="text-[#0037FF]">Real-World Projects</span>
          </h2>
          <p className="text-slate-500 mt-3 text-base font-medium">
            Each project is a polished case study you can show to recruiters and clients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Mock preview */}
              <div className={`h-44 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                <div className="w-3/4 h-3/4 bg-white/60 rounded-xl backdrop-blur-sm flex items-center justify-center border border-white/80 shadow-sm">
                  <span className="text-slate-400 text-xs font-medium text-center px-3">{project.title}</span>
                </div>
              </div>

              <div className="bg-white p-5">
                <h3 className="font-bold text-slate-900 text-base mb-2">{project.title}</h3>
                {project.description && (
                  <p className="text-slate-500 text-sm leading-relaxed">{project.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioProjects;
