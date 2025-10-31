import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Course } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const CourseCard = ({
  course,
  showPrice = true,
}: {
  course: Course;
  showPrice?: boolean;
}) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0 items-center">
        <Link href={`/lms/courses/${course.slug}`}>
          <Image
            src={course.coverImage}
            alt={course.name}
            height={300}
            width={300}
            priority={true}
            className="px-3"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-4">
        <Link href={`/lms/courses/${course.slug}`}>
          <h2 className="font-bold">{course.name}</h2>
        </Link>
        <div className="flex-between gap-4">
          <p className="text-sm font-medium">{course.teacherName}</p>
          {showPrice ? (
            <p className="text-sm font-semibold text-primary">
              {formatCurrency(course.priceInCents, course.currency)}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
