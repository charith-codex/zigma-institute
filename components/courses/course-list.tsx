import CourseCard from "./course-card";
import { Course } from "@/types";

const CourseList = ({
  data,
  title,
  limit,
}: {
  data: Course[];
  title: string;
  limit?: number;
}) => {
  const limitData = limit ? data.slice(0, limit) : data;
  return (
    <div className="my-10">
      <h2 className="h2-bold mb-4">{title}</h2>
      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {limitData.map((course: Course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div>
          <p>No Courses Available</p>
        </div>
      )}
    </div>
  );
};

export default CourseList;
