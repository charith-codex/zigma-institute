import { MouseEvent } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Course } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const CourseCard = ({
  course,
  showPrice = true,
  showDescription = false,
  href,
  onClick,
}: {
  course: Course;
  showPrice?: boolean;
  showDescription?: boolean;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) => {
  const courseLink = href ?? `/lms/courses/${course.slug}`;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
  };

  const cardContent = (
    <Card className="h-full overflow-hidden transition hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full">
          <Image
            src={course.coverImage}
            alt={course.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={true}
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 grid gap-3">
        <h2 className="font-semibold leading-tight line-clamp-2">
          {course.name}
        </h2>
        {showDescription ? (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {course.description}
          </p>
        ) : null}
        <div className="flex-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            {course.teacherName}
          </p>
          {showPrice ? (
            <p className="text-sm font-semibold text-primary">
              {formatCurrency(course.priceInCents, course.currency)}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Link
      href={courseLink}
      prefetch={false}
      className="block h-full"
      onClick={handleClick}
      aria-label={`Open ${course.name}`}
    >
      {cardContent}
    </Link>
  );
};

export default CourseCard;
