import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOutIcon, User } from "lucide-react";
import { Button } from "../ui/button";
import { signOutUser } from "@/lib/actions/user";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import ModeToggle from "../shared/header/mode-toggle";
import { NotificationDropdown } from "../lms/NotificationDropdown";
import UserButton from "../shared/header/user-button";

const CmsHeader = ({ title }: { title: string }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between bg-background border-b border-border px-12 z-50">
      <div className="flex items-center gap-3">
        <div className="flex-start">
          <Link href="/" className="flex-start">
            <Image
              src="/logo.png"
              alt={`${APP_NAME} logo`}
              height={25}
              width={25}
              priority={true}
            />
            <span className="hidden lg:block font-bold text-lg ml-3">
              {APP_NAME}
            </span>
          </Link>
        </div>
      </div>

      <div className="flex-1 text-center hidden md:block">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>

      {/* Right side - Notifications and Profile */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        <NotificationDropdown channel="cms" />
        <UserButton />
      </div>
    </header>
  );
};

export default CmsHeader;
