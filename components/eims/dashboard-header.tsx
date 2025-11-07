import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOutIcon, User } from "lucide-react";
import { Button } from "../ui/button";
import { signOutUser } from "@/lib/actions/user";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { NotificationDropdown } from "../lms/NotificationDropdown";
import { auth } from "@/auth";
import ModeToggle from "../shared/header/mode-toggle";

const DashboardHeader = async ({ title }: { title: string }) => {
  const session = await auth();
  return (
    <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between bg-background border-b border-border px-4 z-50">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover:bg-muted rounded-md p-1" />
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

        <NotificationDropdown />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft hover:shadow-medium transition-all duration-300">
                <User className="w-5 h-5 text-white" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="end">
            <div className="space-y-3">
              <div className="border-b border-border pb-3">
                <p className="font-medium text-foreground">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.role}
                </p>
              </div>

              <div className="space-y-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full justify-start h-10 rounded-xl hover:bg-primary/5 transition-all duration-300"
                >
                  <User className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="font-medium">Profile</span>
                </Button>

                <form action={signOutUser} className="w-full">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start h-10 rounded-xl hover:bg-destructive/5 text-destructive hover:text-destructive transition-all duration-300"
                  >
                    <LogOutIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                    Sign Out
                  </Button>
                </form>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};

export default DashboardHeader;
