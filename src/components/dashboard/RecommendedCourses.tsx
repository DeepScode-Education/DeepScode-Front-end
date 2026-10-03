import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  id: string;
  title: string;
  category: string;
  level: string | null;
  duration: string | null;
}

interface RecommendedCoursesProps {
  courses: Course[];
}

const RecommendedCourses = ({ courses }: RecommendedCoursesProps) => {
  if (courses.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" /> Recommended For You
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/courses">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group rounded-lg border border-border p-4 hover:shadow-card-hover hover:border-primary/30 transition-all"
            >
              <p className="font-medium text-foreground group-hover:text-[#0037FF] transition-colors">{course.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {course.category} • {course.level ?? "All Levels"} {course.duration ? `• ${course.duration}` : ""}
              </p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecommendedCourses;
