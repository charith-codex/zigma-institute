import CourseCard from "./course-card";
import { Course } from "@/types";
import { formatCurrency } from "@/lib/utils";

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
  const hasCourses = limitData.length > 0;
  const lowestPricedCourse = hasCourses
    ? limitData.reduce(
        (currentLowest, course) =>
          course.priceInCents < currentLowest.priceInCents
            ? course
            : currentLowest,
        limitData[0]
      )
    : null;

  return (
    <div className="my-10">
      <h2 className="h2-bold mb-2">{title}</h2>
      {hasCourses && lowestPricedCourse ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Courses starting at{" "}
          {formatCurrency(
            lowestPricedCourse.priceInCents,
            lowestPricedCourse.currency
          )}
          .
        </p>
      ) : null}
      {hasCourses ? (
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
