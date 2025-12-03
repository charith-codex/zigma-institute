import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { fetchShowcasePage } from "@/lib/showcase-data";
import type { ShowcaseContent } from "@/lib/generated/prisma";

const sortContent = (items: ShowcaseContent[]) =>
  [...items].sort(
    (a, b) =>
      a.order - b.order ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

export default async function ContactPage() {
  const { contents } = await fetchShowcasePage("CONTACT");
  const selectBlocks = (section: string) =>
    sortContent(contents.filter((item) => item.section === section));

  const heroBlock = contents.find((item) => item.section === "hero");
  const infoCards = selectBlocks("contact-info");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6">{heroBlock?.subtitle ?? "📞 Contact Us"}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {heroBlock?.title ?? "Get in Touch"}
            </h1>
            <p className="text-xl leading-relaxed text-muted-foreground">
              {heroBlock?.body ??
                "We are here to support your journey. Reach out to us for any inquiries or assistance."}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(infoCards.length ? infoCards : [
              { id: "location", title: "Visit Us", body: "Colombo Innovation Hub", subtitle: "512 Galle Road, Colombo 03" },
              { id: "phone", title: "Call Us", body: "Hotline: +94 11 777 8899", subtitle: "WhatsApp: +94 76 555 8899" },
              { id: "hours", title: "Opening Hours", body: "Monday – Saturday", subtitle: "8.00 AM to 6.30 PM" },
            ]).map((card) => (
              <Card key={card.id} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {card.title?.toLowerCase().includes("visit") ? (
                      <MapPin className="w-8 h-8 text-primary" />
                    ) : card.title?.toLowerCase().includes("call") ? (
                      <Phone className="w-8 h-8 text-primary" />
                    ) : (
                      <Clock className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-1">
                  <p>{card.body}</p>
                  {card.subtitle ? <p>{card.subtitle}</p> : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-muted/30 rounded-xl border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Send us a Message</h2>
              <p className="text-muted-foreground">
                Have a question? Fill out the form below and we will get back
                to you shortly.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 md:p-8">
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
