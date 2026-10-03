// import { motion } from "framer-motion";
// import { CheckCircle2 } from "lucide-react";

// const outcomes = [
//   "Industry-Ready Portfolio",
//   "Adobe Certifications",
//   "Real Client Projects",
//   "AI Design Skills",
//   "Product Design Thinking",
//   "Placement Preparation",
//   "Guaranteed Internship",
//   "100% Placement Guarantee",
// ];

// const IncludedOutcomes = () => {
//   return (
//     <section className="bg-white py-16 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
//             Included Outcomes
//           </span>
//           <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
//             What You{" "}
//             <span className="text-[#0037FF]">Walk Away With</span>
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {outcomes.map((item, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, scale: 0.95 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.06 }}
//               className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm hover:border-[#0037FF]/30 hover:shadow-md transition-all"
//             >
//               <span className="w-8 h-8 rounded-full bg-[#0037FF] flex items-center justify-center flex-shrink-0">
//                 <CheckCircle2 className="h-4 w-4 text-white" />
//               </span>
//               <span className="text-sm font-semibold text-slate-800">{item}</span>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default IncludedOutcomes;




import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface IncludedOutcomesProps {
  outcomes?: readonly string[];
}

const IncludedOutcomes = ({ outcomes = [] }: IncludedOutcomesProps) => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Included Outcomes
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
            What You{" "}
            <span className="text-[#0037FF]">Walk Away With</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {outcomes.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm hover:border-[#0037FF]/30 hover:shadow-md transition-all"
            >
              <span className="w-8 h-8 rounded-full bg-[#0037FF] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </span>
              <span className="text-sm font-semibold text-slate-600 leading-snug">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IncludedOutcomes;