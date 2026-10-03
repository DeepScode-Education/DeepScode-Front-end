// import { motion } from "framer-motion";
// import { CheckCircle } from "lucide-react";

// interface CourseOverviewProps {
//   category?: string;
// }

// const stats = [
//   { value: "5,000+", label: "Students Trained" },
//   { value: "120+", label: "Real Projects" },
//   { value: "87%", label: "Placed in 6 Months" },
//   { value: "4.9★", label: "Avg. Rating" },
// ];

// const highlights = [
//   "Researching users",
//   "Mapping journeys",
//   "Building wireframes",
//   "Crafting interfaces",
//   "Designing real-world products",
//   "Working with AI tools",
// ];

// const CourseOverview = ({ category = "UI/UX" }: CourseOverviewProps) => {
//   return (
//     <section className="bg-[#f0f0f5] py-16 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex flex-col lg:flex-row items-start gap-12">
//           {/* Left */}
//           <motion.div
//             initial={{ opacity: 0, x: -24 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6 }}
//             className="flex-1"
//           >
//             <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5">
//               Course Overview
//             </span>
//             <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
//               Become a{" "}
//               <span className="text-[#0037FF]">Job-Ready</span>{" "}
//               {category} Designer
//             </h2>
//             <p className="text-slate-500 text-base mb-8 max-w-md">
//               Learn to design digital experiences from the ground up at the best
//               UI/UX design institute in Delhi.
//             </p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {highlights.map((item, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.1 + i * 0.06 }}
//                   className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium shadow-sm"
//                 >
//                   <CheckCircle className="h-4 w-4 text-[#0037FF] flex-shrink-0" />
//                   {item}
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>

//           {/* Right - Stats Card */}
//           <motion.div
//             initial={{ opacity: 0, x: 24 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//             className="lg:w-[420px] w-full"
//           >
//             <div className="bg-white rounded-3xl shadow-xl p-2">
//               <div className="grid grid-cols-2 gap-2">
//                 {stats.map((stat, i) => (
//                   <div
//                     key={i}
//                     className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl bg-white border border-slate-100"
//                   >
//                     <span className="text-3xl font-black text-[#0037FF]">
//                       {stat.value}
//                     </span>
//                     <span className="text-xs text-slate-400 mt-1 font-medium">
//                       {stat.label}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CourseOverview;





import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface CourseOverviewProps {
  category?: string;
  overview?: string;
  highlights?: readonly string[];
}



const stats = [
  { value: "5,000+", label: "Students Trained" },
  { value: "120+", label: "Real Projects" },
  { value: "87%", label: "Placed in 6 Months" },
  { value: "4.9★", label: "Avg. Rating" },
];

const CourseOverview = ({
  category = "Design",
  overview,
  highlights = [],
}: CourseOverviewProps) => {
  return (
    <section className="bg-[#f0f0f5] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-8">
          {/* Top - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5">
              Course Overview
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
              Become a{" "}
              <span className="text-[#0037FF]">Job-Ready</span>{" "}
              {category} Professional
            </h2>
            {overview && (
              <p className="text-slate-500 text-base mb-8 w-full leading-relaxed">
                {overview}
              </p>
            )}
            {highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="flex items-center gap-2 bg-white border border-transparent hover:border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium shadow-sm transition-colors duration-200"
                  >
                    <CheckCircle className="h-4 w-4 text-[#0037FF] flex-shrink-0" />
                    {item}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Bottom - Stats Card full width */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center py-10 px-4 rounded-2xl bg-[#f8f8fc]"
                  >
                    <span className="text-3xl font-black text-[#0037FF]">
                      {stat.value}
                    </span>
                    <span className="text-xs text-slate-400 mt-1.5 font-medium text-center">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CourseOverview;