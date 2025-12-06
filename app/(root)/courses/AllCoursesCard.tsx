import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Course } from "@/types";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

const AllCoursesCard = ({ data }: { data: Course[] }) => {
  const hasCourses = data.length > 0;

  return (
    <div className="my-10">
      {hasCourses ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((course: Course) => (
            <Card key={course.slug} className="w-full max-w-sm">
              <CardHeader className="p-0 items-center">
                <Image
                  src={course.coverImage}
                  alt={course.name}
                  height={300}
                  width={300}
                  priority={true}
                  className="px-3"
                />
              </CardHeader>
              <CardContent className="p-4 grid gap-4">
                <h2 className="font-bold">{course.name}</h2>
                <div className="flex-between gap-4">
                  <p className="text-sm font-medium text-primary">{course.teacherName}</p>
                  <p className="text-sm font-semibold text-red-400">
                    {formatCurrency(course.priceInCents, course.currency)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
              </CardContent>
            </Card>
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

export default AllCoursesCard;
