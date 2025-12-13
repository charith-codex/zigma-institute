import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import {
  EllipsisVertical,
  GraduationCap,
  PanelsTopLeft,
  LayoutDashboard,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
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

const Menu = async () => {
  const session = await auth();
  const role = session?.user?.role;

  const showLms = role === "STUDENT" || role === "ADMIN" || role === "MANAGER";
  const showCms = role === "TEACHER" || role === "ADMIN" || role === "MANAGER";
  const showDashboard =
    role === "ATTENDANCE" || role === "ADMIN" || role === "MANAGER";
  const showStudentRegistration =
    !role || role === "ADMIN" || role === "MANAGER";

  const roleLinks = [
    {
      key: "lms",
      href: "/lms",
      label: "LMS",
      visible: showLms,
      Icon: GraduationCap,
    },
    {
      key: "lms-cms",
      href: "/lms-cms",
      label: "LMS CMS",
      visible: showCms,
      Icon: PanelsTopLeft,
    },
    {
      key: "dashboard",
      href: "/dashboard",
      label: "Dashboard",
      visible: showDashboard,
      Icon: LayoutDashboard,
    },
  ];

  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full items-center gap-4">
        <div className="flex items-center gap-1 text-sm">
          {showcaseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 font-medium text-gray-700 dark:text-white/90 transition hover:bg-primary/60 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {roleLinks
          .filter((link) => link.visible)
          .map(({ key, href, label, Icon }) => (
            <Button
              key={key}
              asChild
              size="sm"
              variant="outline"
              className="gap-2 px-4 text-gray-900 dark:text-white border-gray-300/60 dark:border-white/30 hover:bg-primary/60 dark:hover:bg-white/20"
            >
              <Link href={href}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </Button>
          ))}

        {showStudentRegistration && (
          <Button
            asChild
            size="sm"
            className="bg-primary hover:bg-primary-dark"
          >
            <Link href="/student-registration">Student Registration</Link>
          </Button>
        )}
        <ModeToggle />
        <UserButton />
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle text-gray-900 dark:text-white">
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-4 p-5">
            <SheetTitle>Menu</SheetTitle>
            <div className="flex flex-col gap-2">
              {showcaseLinks.map((link) => (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
            {showStudentRegistration && (
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/student-registration">Student Registration</Link>
                </Button>
              </SheetClose>
            )}

            {roleLinks
              .filter((link) => link.visible)
              .map(({ key, href, label, Icon }) => (
                <SheetClose key={key} asChild>
                  <Button asChild variant="secondary" className="gap-2">
                    <Link href={href}>
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  </Button>
                </SheetClose>
              ))}
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
