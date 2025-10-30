import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import { EllipsisVertical } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UserButton from "./user-button";

const showcaseLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

const Menu = () => {
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full items-center gap-4">
        <div className="flex items-center gap-1 text-sm">
          {showcaseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/lms">LMS</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/lms-cms">LMS CMS</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>

        <Button asChild size="sm">
          <Link href="/student-registration">Student Registration</Link>
        </Button>
        <ModeToggle />
        <UserButton />
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-4 p-5">
            <SheetTitle>Menu</SheetTitle>
            <div className="flex flex-col gap-2">
              {showcaseLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Button asChild>
              <Link href="/student-registration">Student Registration</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/lms">LMS</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/lms-cms">LMS CMS</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <ModeToggle />
            <UserButton />

            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
