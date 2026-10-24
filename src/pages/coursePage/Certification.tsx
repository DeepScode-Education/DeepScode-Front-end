// import { motion } from "framer-motion";
// import { Shield, Award, BadgeCheck } from "lucide-react";

// const certifications = [
//   {
//     icon: BadgeCheck,
//     title: "deepScode Education Certification",
//     desc: "Verified completion credential with QR validation.",
//   },
//   {
//     icon: Award,
//     title: "Adobe Certification Support",
//     desc: "Prep & guidance for Adobe credentials.",
//   },
//   {
//     icon: Shield,
//     title: "Industry Recognition",
//     desc: "Endorsed by our hiring partner network.",
//   },
// ];

// const Certification = () => {
//   return (
//     <section className="bg-[#f0f0f5] py-16 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex flex-col lg:flex-row items-center gap-12">
//           {/* Certificate visual */}
//           <motion.div
//             initial={{ opacity: 0, x: -24 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             className="lg:w-1/2 w-full"
//           >
//             <div className="relative">
//               <div className="bg-gradient-to-br from-slate-900 to-[#1e1b4b] rounded-3xl p-8 shadow-2xl aspect-[4/3] flex items-center justify-center">
//                 <div className="border-2 border-amber-400/40 rounded-2xl w-full h-full flex flex-col items-center justify-center p-6 relative">
//                   {/* Decorative corners */}
//                   <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400/60 rounded-tl" />
//                   <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400/60 rounded-tr" />
//                   <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400/60 rounded-bl" />
//                   <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400/60 rounded-br" />

//                   <div className="w-12 h-12 rounded-full bg-[#0037FF] flex items-center justify-center mb-4">
//                     <span className="text-white font-black text-lg">SA</span>
//                   </div>
//                   <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">
//                     The deepScode Education
//                   </p>
//                   <p className="text-white font-bold text-xl mb-1">
//                     Course Certificate
//                   </p>
//                   <div className="w-24 h-1 bg-amber-400/60 rounded-full mb-3" />
//                   <p className="text-slate-400 text-xs">
//                     Awarded to outstanding graduates
//                   </p>
//                   {/* Stamp */}
//                   <div className="absolute bottom-8 right-8 w-14 h-14 rounded-full border-2 border-[#0037FF]/60 flex items-center justify-center">
//                     <span className="text-[#0037FF] font-black text-xs">
//                       Slate
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {/* Right content */}
//           <motion.div
//             initial={{ opacity: 0, x: 24 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             className="lg:w-1/2 w-full"
//           >
//             <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5">
//               Certification
//             </span>
//             <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
//               Earn Credentials That{" "}
//               <span className="text-[#0037FF]">Open Doors</span>
//             </h2>
//             <p className="text-slate-500 text-base mb-8">
//               Walk away with industry-recognized certifications that strengthen
//               your resume and signal trust to hiring managers.
//             </p>

//             <div className="space-y-3">
//               {certifications.map((cert, i) => {
//                 const Icon = cert.icon;
//                 return (
//                   <motion.div
//                     key={i}
//                     initial={{ opacity: 0, x: 20 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     viewport={{ once: true }}
//                     transition={{ delay: i * 0.1 }}
//                     className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm hover:border-[#0037FF]/30 hover:shadow-md transition-all"
//                   >
//                     <Icon className="h-5 w-5 text-[#0037FF] flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="font-bold text-slate-900 text-sm">
//                         {cert.title}
//                       </p>
//                       <p className="text-slate-500 text-xs mt-0.5">
//                         {cert.desc}
//                       </p>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Certification;






import { motion } from "framer-motion";
import { Shield, Award, BadgeCheck } from "lucide-react";

interface CertificationData {
  provider?: string;
  name?: string;
  description?: string;
  title?: string;
  image?: string;
}

interface CertificationProps {
  certification?: CertificationData;
}

const Certification = ({ certification }: CertificationProps) => {
  const certCards = [
    {
      icon : BadgeCheck,
      title: "deepScode Education Certification",
      desc : "Verified completion credential with QR validation.",
    },
    {
      icon : Award,
      title: certification?.name ?? "Industry Certification",
      desc : certification?.description ?? "Prep & guidance for industry credentials.",
    },
    {
      icon : Shield,
      title: "Industry Recognition",
      desc : "Endorsed by our hiring partner network.",
    },
  ];

  return (
    <section className="bg-[#f0f0f5] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Certificate visual */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 w-full lg:mt-16"
          >
            <div className="bg-gradient-to-br from-slate-900 to-[#1e1b4b] rounded-3xl p-8 shadow-2xl aspect-[4/3] flex items-center justify-center">
              <div className="border-2 border-amber-400/40 rounded-2xl w-full h-full flex flex-col items-center justify-center p-6 relative">
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400/60 rounded-tl" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400/60 rounded-tr" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400/60 rounded-bl" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400/60 rounded-br" />
                <div className="w-12 h-12 rounded-full bg-[#0037FF] flex items-center justify-center mb-4">
                  <span className="text-white font-black text-lg">SA</span>
                </div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">The deepScode Education</p>
                <p className="text-white font-bold text-xl mb-1">Course Certificate</p>
                <div className="w-24 h-1 bg-amber-400/60 rounded-full mb-3" />
                {certification && (
                  <p className="text-slate-300 text-xs text-center">{certification.provider} Certified</p>
                )}
                <div className="absolute bottom-8 right-8 w-14 h-14 rounded-full border-2 border-[#0037FF]/60 flex items-center justify-center">
                  <span className="text-[#0037FF] font-black text-xs">Slate</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right content */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 w-full"
          >
            <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5">
              Certification
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
              Earn Credentials That{" "}
              <span className="text-[#0037FF]">Open Doors</span>
            </h2>
            <p className="text-slate-500 text-base mb-8">
              Walk away with industry-recognized certifications that strengthen your resume and signal trust to hiring managers.
            </p>
            <div className="space-y-3">
              {certCards.map((cert, i) => {
                const Icon = cert.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm hover:border-[#0037FF]/30 hover:shadow-md transition-all"
                  >
                    <Icon className="h-5 w-5 text-[#0037FF] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{cert.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{cert.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Certification;