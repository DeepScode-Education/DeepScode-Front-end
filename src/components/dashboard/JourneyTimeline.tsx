import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const milestones = [
  { label: "Enrolled", done: true },
  { label: "First Module Complete", done: true },
  { label: "Mid-Course Project", done: true },
  { label: "Advanced Modules", done: false, active: true },
  { label: "Final Assessment", done: false },
  { label: "Certificate Earned", done: false },
];

const JourneyTimeline = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
  >
    <Card className="shadow-card h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#0037FF]" /> Learning Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {milestones.map((m, i) => (
            <div key={i} className="flex gap-4 pb-6 last:pb-0">
              <div className="flex flex-col items-center">
                {m.done ? (
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                ) : m.active ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary bg-[#0037FF]/20 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                )}
                {i < milestones.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-1 ${m.done ? "bg-secondary" : "bg-border"}`} />
                )}
              </div>
              <div className="pb-1">
                <p className={`text-sm font-medium ${m.done ? "text-foreground" : m.active ? "text-[#0037FF] font-semibold" : "text-muted-foreground"}`}>
                  {m.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default JourneyTimeline;
