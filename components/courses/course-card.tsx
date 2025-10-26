import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const CourseCard = ({ course }: { course: any }) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0 items-center">
        <Link href={`/course/${course.slug}`}>
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
        <div className="text-xs">{course.brand}</div>
        <Link href={`/course/${course.slug}`}>
          <h2 className="font-bold">{course.name}</h2>
        </Link>
        <div className="flex-between gap-4">
          <p className="text-sm font-medium">{course.teacherName}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
