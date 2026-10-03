import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Form from "@/form/Form"; // ✅ Form component import

const benefits = [
  "Free 1-on-1 career counselling",
  "Personalized learning roadmap",
  "Detailed curriculum walkthrough",
  "Scholarship & EMI guidance",
];

interface CounsellorFormProps {
  courseTitle?: string;
}

const CounsellorForm = ({ courseTitle }: CounsellorFormProps) => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 w-full"
          >
            <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5">
              Talk to a Counsellor
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
              Not Sure Yet?{" "}
              <span className="text-[#0037FF]">Let's Chat.</span>
            </h2>
            <p className="text-slate-500 text-base mb-6">
              Free 1-on-1 counselling, personalized career roadmap, and a detailed curriculum walkthrough — no obligations.
            </p>
            <ul className="space-y-3">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-[#0037FF] flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 w-full"
          >
            {/* ✅ Form component directly render */}
            <Form />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CounsellorForm;