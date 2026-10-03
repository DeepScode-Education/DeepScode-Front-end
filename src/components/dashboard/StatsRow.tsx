import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Clock, TrendingUp, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface StatsRowProps {
  coursesEnrolled: number;
  modulesCompleted: number;
  hoursLearned: number;
  avgScore: number | null;
  streak: number;
}

const StatsRow = ({ coursesEnrolled, modulesCompleted, hoursLearned, avgScore, streak }: StatsRowProps) => {
  const stats = [
    { label: "Courses Enrolled", value: String(coursesEnrolled), icon: BookOpen, color: "text-[#0037FF]" },
    { label: "Modules Completed", value: String(modulesCompleted), icon: CheckCircle2, color: "text-secondary" },
    { label: "Hours Learned", value: String(hoursLearned), icon: Clock, color: "text-[#0037FF]" },
    { label: "Avg. Score", value: avgScore !== null ? `${avgScore}%` : "—", icon: TrendingUp, color: "text-secondary" },
    { label: "Day Streak", value: String(streak), icon: Flame, color: "text-destructive" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
};

export default StatsRow;
