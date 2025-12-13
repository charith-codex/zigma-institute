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
import Image from "next/image";

const About = () => {
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

  const achievements = [
    { number: "50,000+", label: "Students Educated" },
    { number: "1,200+", label: "Expert Faculty" },
    { number: "98%", label: "Graduate Success Rate" },
    { number: "25+", label: "Years of Excellence" },
  ];

  const team = [
    {
      name: "Dr. Sarah Wilson",
      role: "Chief Technology Officer",
      image: "👩‍💼",
      description:
        "Leading our AI integration and educational technology initiatives.",
    },
    {
      name: "Prof. Michael Chen",
      role: "Director of Academic Excellence",
      image: "👨‍🏫",
      description:
        "Overseeing curriculum development and faculty training programs.",
    },
    {
      name: "Dr. Emily Davis",
      role: "Head of Student Success",
      image: "👩‍🎓",
      description:
        "Ensuring comprehensive student support and career development.",
    },
    {
      name: "Alex Johnson",
      role: "Innovation Manager",
      image: "👨‍💻",
      description: "Driving digital transformation and platform development.",
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
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are pioneering the future of education with our comprehensive
              management system that seamlessly integrates traditional learning
              with cutting-edge technology.
            </p>
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

      {/* Courses in Action Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Our Courses in Action
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              See how our students engage with cutting-edge learning
              environments designed to foster creativity, collaboration, and
              academic excellence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?fm=jpg&q=80&w=1600"
                    alt="Modern classroom with students learning"
                    width={1600}
                    height={900}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Interactive Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Modern classrooms equipped with smart boards, collaborative
                    workspaces, and technology that enhances the learning
                    experience.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1758685734470-a75109299497?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fA%3D%3D&auto=format&fit=crop&q=80&w=1600"
                    alt="Students conducting science experiments"
                    width={1600}
                    height={900}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Hands-on Science</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    State-of-the-art laboratories where students conduct real
                    experiments and explore scientific concepts through
                    practical application.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?fm=jpg&q=80&w=1600"
                    alt="Programming class with students coding"
                    width={1600}
                    height={900}
                    className="w-full h-full object-cover hover:scale-105transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Technology Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cutting-edge computer labs where students learn programming,
                    web development, and emerging technologies for the digital
                    future.
                  </p>
                </CardContent>
              </Card>
            </div>
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
