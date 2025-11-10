import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { processPendingRegistration } from "@/lib/student-registration/service";

const STAFF_ROLES = new Set(["ADMIN", "MANAGER"]);

function isStaff(role?: string | null) {
  if (!role) return false;
  return STAFF_ROLES.has(role.toUpperCase());
}

interface RouteContext {
  params: {
    registrationId: string;
  };
}

export async function POST(_: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registrationId = context.params.registrationId;

  if (!registrationId) {
    return NextResponse.json(
      { error: "Registration ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await processPendingRegistration(registrationId, {
      sendEmail: true,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Failed to approve offline registration", error);
    return NextResponse.json(
      { error: "Unable to approve the registration" },
      { status: 500 }
    );
  }
}
