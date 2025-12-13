import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export default function ContactPage() {
  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-3 py-2">📞 Contact Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl leading-relaxed text-muted-foreground">
              We are here to support your journey. Reach out to us for any
              inquiries or assistance.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Side - Contact Form */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="mx-2">
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Have a question? Fill out the form below and we will get back
                  to you shortly.
                </p>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Map & Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Address Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Visit Us</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  Colombo Innovation Hub
                </p>
                <p>512 Galle Road, Colombo 03</p>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Call Us</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Hotline: +94 11 777 8899</p>
                <p>WhatsApp: +94 76 555 8899</p>
              </CardContent>
            </Card>

            {/* Hours Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Opening Hours</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Monday – Saturday</p>
                <p>8.00 AM to 6.30 PM</p>
              </CardContent>
            </Card>

            {/* Map */}
            <div className="rounded-xl overflow-hidden h-[250px] w-full border shadow-sm">
              <iframe
                width="100%"
                height="100%"
                src="https://maps.google.com/maps?q=512%20Galle%20Road%2C%20Colombo%2003&t=&z=15&ie=UTF8&iwloc=&output=embed"
                title="Location Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
