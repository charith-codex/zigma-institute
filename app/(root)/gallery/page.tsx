import {
  Award,
  Medal,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/db/prisma";
import type { InstituteAchievement, ShowcaseStudent } from "@/types";

const achievementIcons: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  Trophy,
  Zap,
  Target,
  Award,
  Users,
  TrendingUp,
  Medal,
  Star,
};

const achievementColors: Record<string, { text: string; background: string }> =
  {
    yellow: { text: "text-yellow-600", background: "bg-yellow-50" },
    blue: { text: "text-blue-600", background: "bg-blue-50" },
    green: { text: "text-green-600", background: "bg-green-50" },
    purple: { text: "text-purple-600", background: "bg-purple-50" },
    orange: { text: "text-orange-600", background: "bg-orange-50" },
    emerald: { text: "text-emerald-600", background: "bg-emerald-50" },
    pink: { text: "text-pink-600", background: "bg-pink-50" },
  };

const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

const StudentCard = ({ student }: { student: ShowcaseStudent }) => (
  <Card className="h-full min-h-[460px] transition-shadow hover:shadow-lg">
    <CardHeader className="space-y-4">
      <div className="relative h-64 w-full overflow-hidden rounded-xl border">
        {student.avatarUrl ? (
          <Image
            src={student.avatarUrl}
            alt={student.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-primary text-3xl font-semibold">
            {getInitials(student.name)}
          </div>
        )}
      </div>
      <div className="space-y-1 text-center">
        <CardTitle className="text-xl">{student.name}</CardTitle>
        <CardDescription className="text-sm">
          {student.grade} • {student.subject}
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          <Trophy className="mr-1 h-3 w-3" />
          {student.position}
        </Badge>
        {student.score ? (
          <span className="text-lg font-bold text-primary">
            {student.score}
          </span>
        ) : null}
      </div>

      <div className="flex items-center text-sm text-muted-foreground">
        {student.district ? (
          <>
            <Users className="mr-1 h-4 w-4" />
            <span>{student.district}</span>
          </>
        ) : null}
        <Badge className="ml-auto" variant="outline">
          {student.year}
        </Badge>
      </div>
    </CardContent>
  </Card>
);

const AchievementCard = ({
  achievement,
}: {
  achievement: InstituteAchievement;
}) => {
  const IconComponent = achievementIcons[achievement.icon] ?? Award;
  const colors =
    achievementColors[achievement.accentColor] ?? achievementColors.yellow;

  return (
    <Card className="h-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${colors.background}`}>
            <IconComponent className={`h-6 w-6 ${colors.text}`} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{achievement.title}</CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <Badge variant="secondary">{achievement.category}</Badge>
              <span className="text-sm">{achievement.year}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{achievement.description}</p>
      </CardContent>
    </Card>
  );
};

async function getShowcaseEntries() {
  const [students, achievements] = await Promise.all([
    prisma.showcaseStudent.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.instituteAchievement.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return { students, achievements };
}

const Gallery = async () => {
  const { students, achievements } = await getShowcaseEntries();
  const islandTopStudents = students
    .filter((student) => student.category === "ISLAND")
    .slice(0, 3);
  const districtTopStudents = students
    .filter((student) => student.category === "DISTRICT")
    .slice(0, 3);
  const featuredAchievements = achievements.slice(0, 4);

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              Gallery of Excellence
            </h1>
            <p className="text-xl text-muted-foreground md:text-2xl">
              Celebrating Outstanding Achievements and Academic Excellence
            </p>
            <div className="flex items-center justify-center space-x-8 pt-3 text-primary">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Top Performers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Medal className="h-5 w-5" />
                <span>District Champions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Institute Awards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">
                Island Top Ranking Students
              </h2>
            </div>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Celebrating our students who achieved top positions in island-wide
              examinations and competitions.
            </p>
          </div>
          {islandTopStudents.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No island rankings published yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {islandTopStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <Medal className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">
                District Top Ranking Students
              </h2>
            </div>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Outstanding students who secured first positions in their
              respective district examinations.
            </p>
          </div>
          {districtTopStudents.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No district rankings published yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {districtTopStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <Award className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Institute Achievements</h2>
            </div>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Recognition and awards received by ZIGMA Institute for excellence
              in education and innovation.
            </p>
          </div>
          {featuredAchievements.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No achievements published yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {featuredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
