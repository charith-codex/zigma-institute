import CourseList from "@/components/courses/course-list";
import sampleData from "@/db/sample-data";

export default function CoursesPage() {
  return (
    <div>
      <CourseList data={sampleData.classes} title="All Courses" limit={8} />
    </div>
  );
}
