"use client";

import Link from "next/link";
import { useState } from "react";
import type { Session } from "next-auth";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ProfileForm,
  type ProfileFormValues,
} from "@/app/(root)/user/profile/profile-form";
import { signOutUser } from "@/lib/actions/user";

type UserButtonClientProps = {
  session: Session | null;
  profileInitialValues?: ProfileFormValues;
};

const UserButtonClient = ({
  session,
  profileInitialValues,
}: UserButtonClientProps) => {
  const [profileOpen, setProfileOpen] = useState(false);

  if (!session) {
    return (
      <Button asChild>
        <Link href="/sign-in">
          <UserIcon /> Sign In
        </Link>
      </Button>
    );
  }

  return (
    <>
      <div className="flex gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-primary"
              >
                <UserIcon className="w-5 h-5 text-white" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session.user?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>

            {profileInitialValues && (
              <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
                User Profile
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="p-0 mb-1">
              <form action={signOutUser} className="w-full">
                <Button
                  className="w-full py-4 px-2 h-4 justify-start"
                  variant="ghost"
                >
                  Sign Out
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {profileInitialValues && (
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent size="wide" className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>
            <ProfileForm initialValues={profileInitialValues} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default UserButtonClient;
