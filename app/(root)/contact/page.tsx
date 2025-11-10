import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const contactChannels = [
  {
    title: "Admissions & Student Success",
    description:
      "Questions about registration, class placement, or student progress reporting? Our admissions mentors are ready to help.",
    email: "admissions@zigmainstitute.lk",
    phone: "+94 11 222 3344",
    response: "Replies within one business day",
  },
  {
    title: "Technical Support",
    description:
      "Need help accessing the LMS, resetting a password, or using QR attendance? Reach our IT administrators directly.",
    email: "support@zigmainstitute.lk",
    phone: "+94 11 555 6677",
    response: "Live support 8.00 AM – 6.00 PM (GMT+5:30)",
  },
  {
    title: "Partnerships & Media",
    description:
      "Collaborate on events, sponsorships, or academic initiatives that amplify student success across Sri Lanka.",
    email: "partnerships@zigmainstitute.lk",
    phone: "+94 77 123 4567",
    response: "We respond within two business days",
  },
];

const visitDetails = [
  {
    label: "Head Office",
    value: "Colombo Innovation Hub, 512 Galle Road, Colombo 03",
  },
  {
    label: "Operating Hours",
    value: "Monday – Saturday: 8.00 AM to 6.30 PM",
  },
  {
    label: "Hotline",
    value: "+94 11 777 8899",
  },
  {
    label: "WhatsApp",
    value: "+94 76 555 8899",
  },
];

export default function ContactPage() {
  return (
    <div className="space-y-16 py-12">
      <section className="grid gap-10 lg:grid-cols-[3fr_2fr] items-start">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Contact
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            We are here to support your journey from admission to alumni.
          </h1>
          <p className="text-lg text-muted-foreground">
            Reach the right team for student enrollment, classroom experience,
            or enterprise partnerships. We respond quickly and route requests to
            the experts that can help you move forward.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="tel:+94117778899">Call our hotline</Link>
            </Button>
          </div>
        </div>
        <Card className="bg-linear-to-br from-secondary/20 via-background to-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Visit our institute</CardTitle>
            <CardDescription>
              Drop by to experience our smart classrooms, meet instructors, and
              preview the LMS in action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {visitDetails.map((item) => (
              <div key={item.label}>
                <p className="font-medium text-foreground">{item.label}</p>
                <p>{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">Talk with the right team</h2>
          <p className="text-muted-foreground">
            Every inquiry is tracked in our EIMS so the right staff member can
            respond with context.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {contactChannels.map((channel) => (
            <Card key={channel.title}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">{channel.title}</CardTitle>
                <CardDescription>{channel.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <Link
                    href={`mailto:${channel.email}`}
                    className="text-primary hover:underline"
                  >
                    {channel.email}
                  </Link>
                </div>
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <Link
                    href={`tel:${channel.phone.replace(/[^0-9+]/g, "")}`}
                    className="text-primary hover:underline"
                  >
                    {channel.phone}
                  </Link>
                </div>
                <p>{channel.response}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Send us a message</CardTitle>
            <CardDescription>
              Our team will reply with guidance tailored to your role—student,
              parent, teacher, or partner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" placeholder="Amaya Perera" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(+94) 77 555 8899"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="message">How can we help?</Label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  placeholder="Share your questions, goals, or the support you need."
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full md:w-auto">
                  Submit inquiry
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle className="text-2xl">Stay connected</CardTitle>
            <CardDescription>
              Join our community updates and receive event invites for students
              and parents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Email newsletter</p>
              <p>
                Get monthly updates on new classes, webinars, and scholarships.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Social channels</p>
              <p>
                Follow us on Instagram, Facebook, and YouTube for behind-the-
                scenes moments from classes and events.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Parent meetups</p>
              <p>Quarterly sessions to review progress dashboards and goals.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="mailto:hello@zigmainstitute.lk">Join the list</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
