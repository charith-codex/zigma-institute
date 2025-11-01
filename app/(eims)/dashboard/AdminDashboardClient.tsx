"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, PieChart, UserCheck } from "lucide-react";
import { AdminSidebar } from "@/components/eims/AdminSidebar";
import { DashboardContent } from "@/components/eims/DashboardContent";

type SessionLike = {
  user?: {
    name?: string | null;
    role?: string | null;
  } | null;
} | null;

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
    <div className="min-h-screen flex w-full">
      <AdminSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />

      <main className="flex-1 pt-12 bg-background">
        {activeModule === "overview" ? (
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome, {session?.user?.name}!
              </h1>
              <p className="text-muted-foreground">
                Role: {session?.user?.role?.replace("_", " ").toUpperCase()}
              </p>
            </div>

            {portalButtons.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Portal Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portalButtons.map((portal, index) => (
                    <Card
                      key={index}
                      className="edu-card-hover cursor-pointer"
                      onClick={() => router.push(portal.path)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-${portal.color}/10 flex items-center justify-center`}
                          >
                            <portal.icon
                              className={`w-5 h-5 text-${portal.color}`}
                            />
                          </div>
                          {portal.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">
                          {portal.description}
                        </p>
                        <Button
                          className="w-full mt-4"
                          onClick={() => router.push(portal.path)}
                        >
                          Access Portal
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
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
