import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStudentsWithOverduePayments } from "@/lib/payment-utils";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Only staff can access due payment information." },
      { status: 403 }
    );
  }

  try {
    const overdueStudents = await getStudentsWithOverduePayments();
    return NextResponse.json(overdueStudents);
  } catch (error) {
    console.error("Failed to fetch overdue payments", error);
    return NextResponse.json(
      { error: "Failed to fetch overdue payments" },
      { status: 500 }
    );
  }
}
