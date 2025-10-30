import Image from "next/image";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const gallerySections = [
  {
    category: "Campus Life",
    description:
      "Snapshots from our smart classrooms, collaborative study zones, and weekend bootcamps that keep students inspired.",
    items: [
      {
        title: "STEM Innovation Lab",
        description:
          "Students experimenting with AI-driven robotics challenges.",
        image: "/images/al_physics.jpg",
      },
      {
        title: "Entrepreneurship Clinic",
        description:
          "Business studies cohort pitching finance projects to mentors.",
        image: "/images/al_business_studies.jpg",
      },
      {
        title: "Evening Revision Session",
        description:
          "Focused group study supported by real-time quiz analytics.",
        image: "/images/al_accounting.jpg",
      },
    ],
  },
  {
    category: "Faculty & Mentors",
    description:
      "Meet the teachers and staff who combine academic excellence with personalized coaching.",
    items: [
      {
        title: "Physics Lead Mentor",
        description:
          "Hands-on demos that turn abstract theory into memorable experiments.",
        image: "/images/teacher1.jpg",
      },
      {
        title: "Business Analytics Coach",
        description:
          "Guiding students through data storytelling using LMS dashboards.",
        image: "/images/teacher2.jpg",
      },
      {
        title: "Student Success Advisors",
        description:
          "Management staff reviewing progress reports with parents.",
        image: "/images/al_economics.jpg",
      },
    ],
  },
  {
    category: "Achievements",
    description:
      "Celebrating the milestones our learners reach together across academics, athletics, and leadership.",
    items: [
      {
        title: "A/L High Achievers",
        description:
          "Top scorers honored for results in Bio, Physics, and Commerce streams.",
        image: "/images/al_bio.jpg",
      },
      {
        title: "Community Impact Day",
        description:
          "Students organizing outreach programs with attendance tracking via QR badges.",
        image: "/images/al_physics.jpg",
      },
      {
        title: "Innovation Showcase",
        description:
          "Pitching AI-generated study plans and LMS automations to guests.",
        image: "/images/al_business_studies.jpg",
      },
    ],
  },
];

export default function GalleryPage() {
  return (
    <div className="space-y-16 py-12">
      <section className="space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Gallery
        </p>
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
          A glimpse into life at Zigma Institute
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
          Explore the experiences that define our institute—from dynamic classes
          and AI-enabled study labs to the celebrations that unite our
          community.
        </p>
      </section>

      <div className="space-y-12">
        {gallerySections.map((section) => (
          <section key={section.category} className="space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-semibold">{section.category}</h2>
              <p className="text-muted-foreground">{section.description}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {section.items.map((item) => (
                <Card key={item.title} className="overflow-hidden">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      priority={section.category === "Campus Life"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                  </div>
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card className="bg-muted/40 text-center">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">
            Ready to create your own story at Zigma Institute?
          </CardTitle>
          <CardDescription>
            Start the student registration process or sign in to access your
            personalized dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
