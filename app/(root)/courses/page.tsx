import CourseList from "@/components/courses/course-list";
import { getCourses } from "@/lib/actions/course";

export default async function CoursesPage() {
  const courses = await getCourses();
  return (
    <div>
      <CourseList data={courses} title="Latest Courses" limit={8} />
    </div>
  );
}
