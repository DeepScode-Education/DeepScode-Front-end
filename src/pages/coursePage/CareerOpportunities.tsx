

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const careerSupport = [
  "Placement Support",
  "Resume Building",
  "LinkedIn Optimization",
  "Mock Interviews",
  "Portfolio Reviews",
];

interface CareerOpportunitiesProps {
  careers?: readonly string[];
}

const CareerOpportunities = ({ careers = [] }: CareerOpportunitiesProps) => {
  return (
    <section className="bg-[#f0f0f5] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Career Opportunities
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
            Roles You'll Be{" "}
            <span className="text-[#0037FF]">Ready For</span>
          </h2>
          <p className="text-slate-500 mt-3 text-base font-medium">
            100% Placement Guarantee — we don't stop until you land the role.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {careers.map((role, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm hover:border-[#0037FF]/30 hover:shadow-md transition-all group"
            >
              <span className="w-9 h-9 rounded-xl bg-[#0037FF] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4 text-white" />
              </span>
              <span className="font-semibold text-slate-800 text-sm">{role}</span>
            </motion.div>
          ))}
        </div>

        {/* Career Support */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm"
        >
          <p className="text-xs font-bold tracking-widest text-[#0037FF] uppercase mb-3">
            Career Support
          </p>
          <div className="flex flex-wrap gap-2">
            {careerSupport.map((item, i) => (
              <span
                key={i}
                className="text-sm px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-slate-50 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CareerOpportunities;
