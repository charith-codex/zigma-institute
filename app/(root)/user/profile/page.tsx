import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { ProfileForm } from "./profile-form";

export default async function UserProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      address: true,
      dob: true,
      gender: true,
      profileImage: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const formattedDob = user.dob
    ? new Date(user.dob).toISOString().split("T")[0]
    : "";

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Update your personal details to keep your account up to date. Your
          sign-in email stays locked for security.
        </p>
      </div>

      <ProfileForm
        initialValues={{
          name: user.name ?? "",
          email: user.email,
          phone: user.phone ?? "",
          address: user.address ?? "",
          dob: formattedDob,
          gender: user.gender ?? undefined,
          profileImage: user.profileImage ?? "",
        }}
      />
    </div>
  );
}
