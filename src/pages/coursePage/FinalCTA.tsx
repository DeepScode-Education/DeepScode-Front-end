import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GraduationCap, Play, Download, Phone, Shield, Award, Sparkles } from "lucide-react";

const guarantees = [
  { icon: Shield, label: "7-day money-back" },
  { icon: Award, label: "Certification included" },
  { icon: Sparkles, label: "AI-empowered curriculum" },
];

interface FinalCTAProps {
  courseTitle?: string;
  price?: number;
}

const FinalCTA = ({ courseTitle = "UI/UX Design", price = 0 }: FinalCTAProps) => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
       <div className="bg-white border border-slate-100 rounded-3xl shadow-xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0037FF]/10 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-7 w-7 text-[#0037FF]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
            Start Your{" "}
            <span className="text-[#0037FF]">{courseTitle} Career</span> Today
          </h2>
          <p className="text-slate-500 text-base mb-8 max-w-xl mx-auto">
            Learn industry-standard design skills, build an impressive portfolio,
            gain AI-powered design expertise, and become job-ready with Slate
            Academy.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button className="bg-[#0037FF] hover:bg-[#4a6ff7] text-white px-6 py-3 rounded-xl font-semibold">
              <Play className="h-4 w-4 mr-2" />
              Enroll Now →
            </Button>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold">
              <Download className="h-4 w-4 mr-2" />
              Download Curriculum
            </Button>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold">
              <Phone className="h-4 w-4 mr-2" />
              Talk to a Counsellor
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {guarantees.map((g, i) => {
              const Icon = g.icon;
              return (
                <div key={i} className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{g.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
