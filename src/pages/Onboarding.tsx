import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Palette, Code, Megaphone, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const interests = [
  { id: "design", label: "Design", description: "UI/UX, Graphics, Motion", icon: Palette, color: "bg-purple-50 border-purple-200 text-purple-600", activeColor: "bg-purple-100 border-purple-500 ring-2 ring-purple-500/20" },
  { id: "coding", label: "Coding", description: "MERN, Full Stack, Web Dev", icon: Code, color: "bg-blue-50 border-blue-200 text-[#0037FF]", activeColor: "bg-blue-100 border-blue-500 ring-2 ring-blue-500/20" },
  { id: "marketing", label: "Marketing", description: "Digital, Social, SEO", icon: Megaphone, color: "bg-orange-50 border-orange-200 text-orange-600", activeColor: "bg-orange-100 border-orange-500 ring-2 ring-orange-500/20" },
  { id: "data", label: "Data", description: "Analytics, Excel, SQL", icon: BarChart3, color: "bg-emerald-50 border-emerald-200 text-emerald-600", activeColor: "bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500/20" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <GraduationCap className="h-5 w-5 text-[#0037FF]-foreground" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">What do you want to learn? 🎯</h1>
        <p className="text-muted-foreground mb-10">Pick one or more to personalize your experience</p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {interests.map((item, i) => {
            const isActive = selected.includes(item.id);
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                onClick={() => toggle(item.id)}
                className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer ${
                  isActive ? item.activeColor : `${item.color} hover:shadow-card-hover`
                }`}
              >
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#0037FF] flex items-center justify-center"
                  >
                    <svg className="h-3 w-3 text-[#0037FF]-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                  <item.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="hero"
            size="lg"
            className="w-full h-12 rounded-xl text-base font-semibold"
            onClick={() => navigate("/dashboard")}
            disabled={selected.length === 0}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
