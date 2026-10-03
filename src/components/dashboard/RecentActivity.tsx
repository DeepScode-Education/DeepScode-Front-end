import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Play, Trophy, BarChart3, BookOpen, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface ActivityItem {
  action: string;
  icon: string;
  created_at: string;
}

const iconMap: Record<string, React.ElementType> = {
  CheckCircle2, Play, Trophy, BarChart3, BookOpen, Clock,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface RecentActivityProps {
  activity: ActivityItem[];
}

const RecentActivity = ({ activity }: RecentActivityProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.4 }}
  >
    <Card className="shadow-card h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-secondary" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet. Start a course to see your progress here!</p>
        ) : (
          activity.map((item, i) => {
            const Icon = iconMap[item.icon] || CheckCircle2;
            return (
              <div key={i} className="flex items-start gap-3 group cursor-default">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent group-hover:bg-[#0037FF]/10 transition-colors">
                  <Icon className="h-4 w-4 text-[#0037FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default RecentActivity;
