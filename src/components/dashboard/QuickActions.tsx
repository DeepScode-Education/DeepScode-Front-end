import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, MessageSquare, Award, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  { label: "Browse Courses", icon: BookOpen, path: "/courses", variant: "hero" as const },
  { label: "AI Assistant", icon: MessageSquare, path: "/ai-chat", variant: "orange" as const },
  { label: "My Portfolio", icon: Award, path: "/portfolio", variant: "heroOutline" as const },
  { label: "Get Support", icon: HelpCircle, path: "/support", variant: "orangeOutline" as const },
];

const QuickActions = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.5 }}
  >
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((a) => (
          <Button key={a.label} variant={a.variant} className="h-auto flex-col gap-2 py-4" asChild>
            <Link to={a.path}>
              <a.icon className="h-5 w-5" />
              <span className="text-xs">{a.label}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  </motion.div>
);

export default QuickActions;
