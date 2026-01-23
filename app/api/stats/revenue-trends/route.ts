import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      session.user.role === "ADMIN" ||
      session.user.role === "MANAGER" ||
      session.user.role === "ATTENDANCE";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get revenue trends for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get payment transactions grouped by month
    const payments = await prisma.paymentTransaction.findMany({
      where: {
        paidAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        paidAt: true,
        amountInCents: true,
      },
    });

    // Group by month and sum revenue
    const monthlyRevenue: { [key: string]: number } = {};
    
    // Initialize months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyRevenue[monthKey] = 0;
    }

    // Sum payments by month
    payments.forEach(payment => {
      const monthKey = payment.paidAt.toLocaleDateString('en-US', { month: 'short' });
      if (monthlyRevenue[monthKey] !== undefined) {
        monthlyRevenue[monthKey] += payment.amountInCents / 100; // Convert cents to dollars
      }
    });

    // Convert to array format expected by charts
    const revenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue),
    }));

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error("Error fetching revenue trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue trends" },
      { status: 500 },
    );
  }
}