import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Youtube, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 ">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 md:py-8 max-md:flex-col gap-4">
        <div className="flex flex-col gap-4 text-slate-300">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt={`${APP_NAME} logo`}
              height={30}
              width={30}
              priority={true}
            />
            <p className="font-bold">{APP_NAME}</p>
          </div>
          <p className="text-sm max-w-md">
            A unified Education Institutee Management System connecting EIMS,
            LMS, and CMS workflows so administrators, teachers, students, and
            guardians stay aligned every step of the way.
          </p>
        </div>

        <div>
          <ul className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <li>
              <Link
                href="/student-registration"
                className="hover:text-primary transition-colors"
              >
                Student Registration
              </Link>
            </li>
            <li>
              <Link
                href="/courses"
                className="hover:text-primary transition-colors"
              >
                Courses
              </Link>
            </li>
            <li>
              <Link
                href="/gallery"
                className="hover:text-primary transition-colors"
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-primary transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
          <div className="flex items-center justify-end pt-8 gap-6 text-slate-300">
            <Link
              href="https://facebook.com"
              target="_blank"
              className="hover:text-primary transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </Link>

            <Link
              href="https://youtube.com"
              target="_blank"
              className="hover:text-primary transition-colors"
            >
              <Youtube className="w-5 h-5" />
            </Link>

            <Link
              href="https://instagram.com"
              target="_blank"
              className="hover:text-primary transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </Link>

            <Link
              href="https://x.com"
              target="_blank"
              className="hover:text-primary transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="my-5 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
