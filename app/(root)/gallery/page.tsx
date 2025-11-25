import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Star,
  Medal,
  Award,
  Users,
  MapPin,
  Calendar,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";

const Gallery = () => {
  // Mock data for Island Top Ranking Students
  const islandTopStudents = [
    {
      id: 1,
      name: "Aisha Patel",
      grade: "Grade 12",
      subject: "Mathematics",
      position: "1st Island Wide",
      score: "98.5%",
      year: "2024",
      district: "Colombo",
      avatar: "/placeholder.svg",
      achievements: ["National Olympiad Winner", "Science Fair Champion"],
    },
    {
      id: 2,
      name: "Kamal Silva",
      grade: "Grade 11",
      subject: "Physics",
      position: "2nd Island Wide",
      score: "97.8%",
      year: "2024",
      district: "Gampaha",
      avatar: "/placeholder.svg",
      achievements: ["Research Project Award", "STEM Excellence"],
    },
    {
      id: 3,
      name: "Nimal Fernando",
      grade: "Grade 10",
      subject: "Chemistry",
      position: "3rd Island Wide",
      score: "96.9%",
      year: "2024",
      district: "Kandy",
      avatar: "/placeholder.svg",
      achievements: ["Lab Innovation Award", "Young Scientist"],
    },
  ];

  // Mock data for District Top Ranking Students
  const districtTopStudents = [
    {
      id: 1,
      name: "Saman Wijesinghe",
      grade: "Grade 12",
      subject: "Biology",
      position: "1st in Colombo District",
      score: "95.2%",
      year: "2024",
      district: "Colombo",
      avatar: "/placeholder.svg",
      achievements: ["Medical Entrance Top Score", "Research Excellence"],
    },
    {
      id: 2,
      name: "Priya Jayawardena",
      grade: "Grade 11",
      subject: "English",
      position: "1st in Gampaha District",
      score: "94.8%",
      year: "2024",
      district: "Gampaha",
      avatar: "/placeholder.svg",
      achievements: ["Debate Champion", "Literature Award"],
    },
    {
      id: 3,
      name: "Tharindu Perera",
      grade: "Grade 10",
      subject: "Mathematics",
      position: "1st in Kandy District",
      score: "93.5%",
      year: "2024",
      district: "Kandy",
      avatar: "/placeholder.svg",
      achievements: ["Math Olympiad", "Problem Solving Excellence"],
    },
  ];

  // Mock data for Institute Achievements
  const instituteAchievements = [
    {
      id: 1,
      title: "National Education Excellence Award",
      category: "Institutional Recognition",
      year: "2024",
      description:
        "Recognized for outstanding contribution to quality education and student development.",
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      id: 2,
      title: "Best Digital Learning Platform",
      category: "Technology Innovation",
      year: "2023",
      description:
        "Award for implementing cutting-edge LMS and digital education solutions.",
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: 3,
      title: "100% Pass Rate Achievement",
      category: "Academic Excellence",
      year: "2024",
      description:
        "Achieved 100% pass rate in Advanced Level examinations for the third consecutive year.",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: 4,
      title: "Outstanding Teacher Development",
      category: "Faculty Excellence",
      year: "2023",
      description:
        "Recognition for comprehensive teacher training and professional development programs.",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: 5,
      title: "Student Success Rate Recognition",
      category: "Student Achievement",
      year: "2024",
      description:
        "95% of graduates secured admission to leading universities and career opportunities.",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      id: 6,
      title: "Community Impact Award",
      category: "Social Responsibility",
      year: "2023",
      description:
        "Recognition for educational outreach programs and community development initiatives.",
      icon: Award,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const StudentCard = ({ student }: { student: any }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={student.avatar} alt={student.name} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-primary">
              {student.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{student.name}</CardTitle>
            <CardDescription className="text-sm">
              {student.grade} • {student.subject}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Trophy className="w-3 h-3 mr-1" />
            {student.position}
          </Badge>
          <span className="text-lg font-bold text-primary">
            {student.score}
          </span>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{student.district}</span>
          <Calendar className="w-4 h-4 ml-3 mr-1" />
          <span>{student.year}</span>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Achievements:</h4>
          <div className="space-y-1">
            {student.achievements.map((achievement: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                {achievement}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AchievementCard = ({ achievement }: { achievement: any }) => {
    const IconComponent = achievement.icon;
    return (
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full ${achievement.bgColor}`}>
              <IconComponent className={`w-6 h-6 ${achievement.color}`} />
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Gallery of Excellence
            </h1>
            <p className="text-xl md:text-2xl">
              Celebrating Outstanding Achievements and Academic Excellence
            </p>
            <div className="flex items-center justify-center space-x-8 pt-3 text-primary">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Top Performers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Medal className="w-5 h-5" />
                <span>District Champions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Institute Awards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Island Top Ranking Students */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Trophy className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">
                Island Top Ranking Students
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Celebrating our students who achieved top positions in island-wide
              examinations and competitions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {islandTopStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        </div>
      </section>

      {/* District Top Ranking Students */}
      <section className="py-16 bg-muted/50 rounded-xl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Medal className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">
                District Top Ranking Students
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Outstanding students who secured first positions in their
              respective district examinations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {districtTopStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        </div>
      </section>

      {/* Institute Achievements */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Award className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Institute Achievements</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Recognition and awards received by ZIGMA Institute for excellence
              in education and innovation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instituteAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
