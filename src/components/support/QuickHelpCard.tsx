import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface QuickHelpCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

const QuickHelpCard = ({ icon: Icon, title, description, index = 0 }: QuickHelpCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08, duration: 0.3 }}
    className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
      <Icon className="h-5 w-5 text-[#0037FF]" />
    </div>
    <h3 className="mt-3 font-semibold text-foreground text-sm">{title}</h3>
    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

export default QuickHelpCard;
