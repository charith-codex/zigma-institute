import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Heart,
  Target,
  Zap,
  Shield,
  Brain,
  CheckCircle,
} from "lucide-react";
import TeacherCard from "@/components/shared/TeacherCard";
import { Pagination } from "@/components/shared/Pagination";
import { getTeachersWithCourses } from "@/lib/actions/teacher.actions";

interface SearchParamsProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const About = async ({ searchParams }: SearchParamsProps) => {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const { teachers, metadata } = await getTeachersWithCourses(page, 8);

  const values = [
    {
      icon: Heart,
      title: "Student-Centered",
      description:
        "Every decision we make prioritizes student success and learning outcomes.",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "We strive for the highest standards in education and institutional management.",
    },
    {
      icon: Globe,
      title: "Innovation",
      description:
        "Embracing cutting-edge technology to enhance the educational experience.",
    },
    {
      icon: Shield,
      title: "Integrity",
      description:
        "Building trust through transparency, security, and ethical practices.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-3 py-2">🏛️ About Modern EIMS</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transforming Education Through Innovation
            </h1>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  To revolutionize educational institutions by providing a
                  comprehensive, AI-powered management system that enhances
                  learning outcomes, streamlines administrative processes, and
                  creates meaningful connections between students, educators,
                  and administrators.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Empowering educators with advanced tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Enhancing student learning experiences</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Streamlining institutional operations</span>
                  </div>
                </div>
              </div>
              <div className="bg-linear-to-br from-primary/10 to-accent/10 rounded-2xl p-8">
                <div className="text-6xl mb-4 text-center">🎯</div>
                <h3 className="text-xl font-semibold mb-4 text-center">
                  Vision 2030
                </h3>
                <p className="text-muted-foreground text-center">
                  To become the global standard for educational institution
                  management, making quality education accessible and efficient
                  for institutions worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30 rounded-xl">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">
              Meet Our Experts
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              Learn from industry experts and experienced educators dedicated to
              your success.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <TeacherCard key={teacher.userId} teacher={teacher} />
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground">
                  No teachers found.
                </div>
              )}
            </div>

            <Pagination
              totalPages={metadata.totalPages}
              currentPage={metadata.currentPage}
            />
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Powered by Advanced Technology
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our platform leverages cutting-edge technologies to deliver a
                seamless, secure, and intelligent educational management
                experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Integration</h3>
                <p className="text-muted-foreground">
                  Advanced AI algorithms for personalized learning, automated
                  assessment, and intelligent analytics.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-linear-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Enterprise Security
                </h3>
                <p className="text-muted-foreground">
                  Bank-level security with end-to-end encryption, secure
                  authentication, and comprehensive data protection.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Real-time Performance
                </h3>
                <p className="text-muted-foreground">
                  Lightning-fast performance with real-time updates, instant
                  notifications, and seamless synchronization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
