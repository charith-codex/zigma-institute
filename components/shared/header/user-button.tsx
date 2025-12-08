import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import type { ProfileFormValues } from "@/lib/validators/profile";
import UserButtonClient from "./user-button-client";

const UserButton = async () => {
  const session = await auth();

  if (!session) {
    return <UserButtonClient session={null} />;
  }

  const user = session.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
          phone: true,
          address: true,
          dob: true,
          gender: true,
        },
      })
    : null;

  const profileInitialValues: ProfileFormValues = {
    name: user?.name ?? session.user?.name ?? "",
    email: user?.email ?? session.user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
    gender: user?.gender ?? undefined,
  };

  return (
    <UserButtonClient
      session={session}
      profileInitialValues={profileInitialValues}
    />
  );
};

export default UserButton;
