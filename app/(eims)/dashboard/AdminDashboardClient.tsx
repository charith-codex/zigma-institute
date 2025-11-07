"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, PieChart, UserCheck } from "lucide-react";
import { AdminSidebar } from "@/components/eims/AdminSidebar";
import { DashboardContent } from "@/components/eims/DashboardContent";
import { cn } from "@/lib/utils";

type SessionLike = {
  user?: {
    name?: string | null;
    role?: string | null;
  } | null;
} | null;

const portalColorStyles = {
  primary: {
    iconWrapper: "bg-primary/10 text-primary",
    button:
      "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
  },
  secondary: {
    iconWrapper: "bg-secondary/10 text-secondary-foreground",
    button:
      "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary",
  },
  accent: {
    iconWrapper: "bg-accent/10 text-accent",
    button:
      "bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent",
  },
  success: {
    iconWrapper: "bg-success/10 text-success",
    button:
      "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success",
  },
} as const;

export function AdminDashboardClient({ session }: { session: SessionLike }) {
  const [activeModule, setActiveModule] = useState("overview");
  const router = useRouter();

  const getPortalButtons = () => {
    const role = session?.user?.role;
    const buttons: Array<{
      title: string;
      description: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon: any;
      path: string;
      color: "primary" | "secondary" | "accent" | "success";
    }> = [];

    switch (role) {
      case "student":
        buttons.push({
          title: "Student LMS",
          description: "Access your courses, assignments, and materials",
          icon: BookOpen,
          path: "/lms",
          color: "primary",
        });
        break;
      case "teacher":
        buttons.push({
          title: "Teacher CMS",
          description: "Manage your courses, students, and content",
          icon: Users,
          path: "/lms-cms",
          color: "secondary",
        });
        break;
      case "management_staff":
        buttons.push(
          {
            title: "Student LMS",
            description: "View student portal and courses",
            icon: BookOpen,
            path: "/lms",
            color: "primary",
          },
          {
            title: "Teacher CMS",
            description: "Manage courses and faculty content",
            icon: Users,
            path: "/lms-cms",
            color: "secondary",
          },
          {
            title: "EIMS Dashboard",
            description: "Administrative management tools",
            icon: PieChart,
            path: "/dashboard",
            color: "accent",
          }
        );
        break;
      case "attendance_staff":
        buttons.push({
          title: "Attendance Management",
          description: "Track and manage student attendance",
          icon: UserCheck,
          path: "/dashboard",
          color: "success",
        });
        break;
      case "it_admin":
        buttons.push(
          {
            title: "Student LMS",
            description: "Full access to student portal",
            icon: BookOpen,
            path: "/lms",
            color: "primary",
          },
          {
            title: "Teacher CMS",
            description: "Full access to teacher tools",
            icon: Users,
            path: "/lms-cms",
            color: "secondary",
          },
          {
            title: "EIMS Dashboard",
            description: "Complete administrative control",
            icon: PieChart,
            path: "/dashboard",
            color: "accent",
          }
        );
        break;
      default:
        break;
    }

    return buttons;
  };

  const portalButtons = getPortalButtons();

  const normalizedSession = session
    ? {
        user:
          session.user == null
            ? undefined
            : {
                name: session.user.name ?? undefined,
                email: undefined,
                role: session.user.role ?? undefined,
              },
      }
    : undefined;

  return (
    <div className="flex w-full pr-4 pb-4 flex-col min-h-[calc(100vh-3.5rem)] lg:flex-row">
      <AdminSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />

      <main className="mx-auto flex h-full w-full max-w-7xl flex-col rounded-2xl border border-border bg-background shadow-sm">
        {activeModule === "overview" ? (
          <div className="px-4 pt-6 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Welcome, {session?.user?.name}!
              </h1>
              <p className="text-muted-foreground">
                Role: {session?.user?.role?.replace("_", " ").toUpperCase()}
              </p>
            </div>

            {portalButtons.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Portal Access</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {portalButtons.map((portal, index) => {
                    const colorStyles = portalColorStyles[portal.color];

                    return (
                      <Card
                        key={index}
                        className="edu-card-hover flex h-full cursor-pointer flex-col transition-all duration-300 hover:-translate-y-1"
                        onClick={() => router.push(portal.path)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-lg",
                                colorStyles.iconWrapper
                              )}
                            >
                              <portal.icon className="h-5 w-5" />
                            </div>
                            <span className="text-left font-semibold">
                              {portal.title}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col justify-between gap-4">
                          <p className="text-sm text-muted-foreground">
                            {portal.description}
                          </p>
                          <Button
                            type="button"
                            className={cn("mt-auto w-full", colorStyles.button)}
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(portal.path);
                            }}
                          >
                            Access Portal
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            <DashboardContent
              activeModule={activeModule}
              session={normalizedSession}
            />
          </div>
        ) : (
          <DashboardContent
            activeModule={activeModule}
            session={normalizedSession}
          />
        )}
      </main>
    </div>
  );
}
