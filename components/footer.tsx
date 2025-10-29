import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

const footerLinks = [
  {
    title: "Institute",
    links: [
      { label: "About", href: "/about" },
      { label: "Courses", href: "/courses" },
      { label: "Gallery", href: "/gallery" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { label: "Student Registration", href: "/student-register" },
      { label: "Sign In", href: "/dashboard" },
      { label: "LMS", href: "/lms" },
      { label: "LMS-CMS", href: "/lms-cms" },
    ],
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-slate-950 text-slate-100">
      <div className="wrapper grid gap-10 py-12 md:grid-cols-[1.2fr_repeat(2,1fr)]">
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {APP_NAME}
            </span>
            <p className="text-sm text-slate-300">
              A unified Education Institute Management System connecting EIMS,
              LMS, and CMS workflows so administrators, teachers, students, and
              guardians stay aligned every step of the way.
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <span>
                221 Knowledge Avenue,
                <br />
                Colombo, Sri Lanka
              </span>
            </div>
            <Link
              href="tel:+94112233445"
              className="flex items-center gap-3 text-slate-300 transition hover:text-primary"
            >
              <Phone className="h-5 w-5 text-primary" />
              +94 11 223 3445
            </Link>
            <Link
              href="mailto:hello@zigmainstitute.com"
              className="flex items-center gap-3 text-slate-300 transition hover:text-primary"
            >
              <Mail className="h-5 w-5 text-primary" />
              hello@zigmainstitute.com
            </Link>
          </div>
        </div>

        {footerLinks.map((section) => (
          <div key={section.title} className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              {section.title}
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800">
        <div className="wrapper flex flex-col items-center justify-between gap-4 py-6 text-xs text-slate-500 md:flex-row">
          <p>
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="transition hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/contact" className="transition hover:text-primary">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
