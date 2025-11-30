import CourseList from "@/components/courses/course-list";
import { getCourses } from "@/lib/actions/course";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CoursesPage() {
  const courses = await getCourses();
  return (
    <div>
      <CourseList data={courses} title="Enrolled Courses" />
    </div>
  );
}
