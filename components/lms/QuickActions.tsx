"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  Brain,
  CreditCard,
  FileText,
  Users,
  ArrowRight,
  CardSim,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
  href?: string;
  badge?: string;
}

interface QuickActionsProps {
  onActionClick?: (actionId: string) => void;
  upcomingExams?: number;
  pendingPayments?: number;
  newNotifications?: number;
}

export function QuickActions({
  onActionClick,
  pendingPayments = 0,
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: "courses",
      title: "My Courses",
      description: "Continue where you left off",
      icon: BookOpen,
      color: "bg-primary/10 text-primary hover:bg-primary/20",
      onClick: () => onActionClick?.("classes"),
    },
    {
      id: "exams",
      title: "Take an Exam",
      description: "View available exams",
      icon: FileText,
      color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
      onClick: () => onActionClick?.("exams"),
    },
    {
      id: "schedule",
      title: "View Schedule",
      description: "Check your class timetable",
      icon: Calendar,
      color: "bg-sky-500/10 text-sky-600 hover:bg-sky-500/20",
      onClick: () => onActionClick?.("schedule"),
    },
    {
      id: "study-tools",
      title: "AI Study Tools",
      description: "Get AI-powered study help",
      icon: Brain,
      color: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
      onClick: () => onActionClick?.("study-tools"),
    },
    {
      id: "enroll",
      title: "Enroll in Course",
      description: "Browse available courses",
      icon: Users,
      color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
      onClick: () => onActionClick?.("enroll"),
    },
    {
      id: "payments",
      title: "Payments",
      description: "View payment history",
      icon: CreditCard,
      color: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20",
      badge: pendingPayments > 0 ? `${pendingPayments}` : undefined,
      onClick: () => onActionClick?.("payments"),
    },
    {
      id: "id-card",
      title: "Student ID",
      description: "View your digital ID card",
      icon: CardSim,
      color: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
      onClick: () => onActionClick?.("id-card"),
    },
    {
      id: "performance",
      title: "Performance",
      description: "Track your progress",
      icon: TrendingUp,
      color: "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20",
      onClick: () => onActionClick?.("performance"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <div className="relative">
                {action.badge && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                    {action.badge}
                  </span>
                )}
                <Button
                  variant="outline"
                  className={`w-full h-auto flex flex-col items-start gap-3 p-4 ${action.color} border-2 transition-all duration-200`}
                  onClick={() => action.onClick?.()}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className="w-6 h-6" />
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </div>
                  <div className="text-left space-y-1 w-full">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs opacity-80 font-normal">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </div>
            );

            if (action.href) {
              return (
                <Link key={action.id} href={action.href}>
                  {content}
                </Link>
              );
            }

            return <div key={action.id}>{content}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
