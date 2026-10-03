import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  total_modules: number;
  completed_modules: number;
  category: string;
}

interface CourseProgressProps {
  courses: EnrolledCourse[];
}

const CourseProgress = ({ courses }: CourseProgressProps) => {
  if (courses.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Course Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.completed_modules}/{course.total_modules} modules • {course.category}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#0037FF]">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseProgress;
