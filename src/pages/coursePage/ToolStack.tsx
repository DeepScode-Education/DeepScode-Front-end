// import { motion } from "framer-motion";

// const toolCategories = [
//   {
//     title: "Design Tools",
//     tools: ["Adobe Figma", "Adobe FigJam", "Balsamiq", "ProtoPie", "Framer", "Notion", "Miro", "Marvel", "Figma Dev Mode"],
//   },
//   {
//     title: "AI Tools",
//     tools: ["ChatGPT", "Google Gemini", "Visily AI"],
//   },
//   {
//     title: "Portfolio Platforms",
//     tools: ["Behance"],
//   },
// ];

// const ToolStack = () => {
//   return (
//     <section className="bg-[#f0f0f5] py-16 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
//             Toolstack
//           </span>
//           <h2 className="text-4xl md:text-5xl font-black text-slate-900">
//             Tools You'll{" "}
//             <span className="text-[#0037FF]">Master</span>
//           </h2>
//           <p className="text-slate-500 mt-3 text-base">
//             Industry-standard design, AI and collaboration tools — fluently.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//           {toolCategories.map((cat, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.1 }}
//               className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
//             >
//               <h3 className="font-bold text-slate-900 text-base mb-4">
//                 {cat.title}
//               </h3>
//               <div className="flex flex-wrap gap-2">
//                 {cat.tools.map((tool, j) => (
//                   <span
//                     key={j}
//                     className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 font-medium bg-slate-50 hover:bg-[#0037FF]/10 hover:border-[#0037FF]/30 hover:text-[#0037FF] transition-colors cursor-default"
//                   >
//                     {tool}
//                   </span>
//                 ))}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ToolStack;




import { motion } from "framer-motion";

const AI_KEYWORDS = ["chatgpt", "gemini", "midjourney", "firefly", "visily", "ai", "copilot", "bandera", "meta ai"];
const PORTFOLIO_KEYWORDS = ["behance", "dribbble", "portfolio"];

interface ToolStackProps {
  tools?: readonly string[];
}

const ToolStack = ({ tools = [] }: ToolStackProps) => {
  // Auto-bucket tools into categories
  const aiTools        = tools.filter((t) => AI_KEYWORDS.some((k) => t.toLowerCase().includes(k)));
  const portfolioTools = tools.filter((t) => PORTFOLIO_KEYWORDS.some((k) => t.toLowerCase().includes(k)));
  const mainTools      = tools.filter((t) => !aiTools.includes(t) && !portfolioTools.includes(t));

  const categories = [
    mainTools.length      && { title: "Core Tools",         tools: mainTools },
    aiTools.length        && { title: "AI Tools",           tools: aiTools },
    portfolioTools.length && { title: "Portfolio Platforms", tools: portfolioTools },
  ].filter(Boolean) as { title: string; tools: string[] }[];

  return (
    <section className="bg-[#f0f0f5] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Toolstack
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900">
            Tools You'll{" "}
            <span className="text-[#0037FF]">Master</span>
          </h2>
          <p className="text-slate-500 mt-3 text-base font-medium">
            Industry-standard tools — fluently.
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-5 ${categories.length === 3 ? "md:grid-cols-3" : categories.length === 2 ? "md:grid-cols-2" : ""}`}>
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <h3 className="font-bold text-slate-900 text-base mb-4">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.tools.map((tool, j) => (
                  <span
                    key={j}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 font-medium bg-slate-50 hover:bg-[#0037FF]/10 hover:border-[#0037FF]/30 hover:text-[#0037FF] transition-colors cursor-default"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolStack;
