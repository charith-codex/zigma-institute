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

const Menu = () => {
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-3">
        <ModeToggle />
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>

        <UserButton />
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className="flex flex-col p-5">
            <SheetTitle>Menu</SheetTitle>
            <ModeToggle />
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/lms">LMS</Link>
            </Button>
            <Button asChild>
              <Link href="/lms-cms">CMS</Link>
            </Button>
            <UserButton />

            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
