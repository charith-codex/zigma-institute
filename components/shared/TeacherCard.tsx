import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { GraduationCap, BookOpen } from "lucide-react";

interface TeacherCardProps {
  teacher: {
    qualification: string | null;
    user: {
      name: string;
      profileImage: string | null;
    };
    courses: {
      name: string;
      slug: string;
    }[];
  };
}

const TeacherCard = ({ teacher }: TeacherCardProps) => {
  const displayedCourses = teacher.courses.slice(0, 3);
  const remainingCoursesCount = teacher.courses.length - 3;

  return (
    <Card className="h-full flex flex-col overflow-hidden bg-card hover:shadow-xl transition-all duration-300 border-border/50 group p-0 gap-0">
      <div className="relative aspect-square overflow-hidden bg-muted/50">
        {teacher.user.profileImage ? (
          <Image
            src={teacher.user.profileImage}
            alt={teacher.user.name}
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/30 text-secondary-foreground">
            <div className="text-4xl font-bold mb-2">
              {teacher.user.name.charAt(0)}
            </div>
            <div className="text-sm font-medium opacity-70">No Image</div>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-base font-bold leading-tight mb-1 drop-shadow-md">
            {teacher.user.name}
          </h3>
          {teacher.qualification && (
            <div className="flex items-center gap-1 text-[10px] text-gray-200 font-medium opacity-90">
              <GraduationCap className="w-3 h-3" />
              <span className="truncate">{teacher.qualification}</span>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-3 grow flex flex-col">
        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-primary/80 uppercase tracking-wider">
          <BookOpen className="w-3 h-3" />
          <span>Teacher</span>
        </div>

        <div className="flex flex-wrap gap-1 align-start">
          {displayedCourses.length > 0 ? (
            <>
              {displayedCourses.map((course) => (
                <Badge
                  key={course.slug}
                  variant="secondary"
                  className="px-1.5 py-0 text-[10px] font-medium bg-secondary/50 hover:bg-secondary text-secondary-foreground border-transparent transition-colors"
                >
                  {course.name}
                </Badge>
              ))}
              {remainingCoursesCount > 0 && (
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 text-[10px] text-muted-foreground border-dashed"
                >
                  +{remainingCoursesCount}
                </Badge>
              )}
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground italic">
              No courses
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCard;
