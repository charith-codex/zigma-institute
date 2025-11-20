"use client";

import { LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ClassSummary } from "@/hooks/useData";

export type CmsModule =
  | "dashboard"
  | "my-classes"
  | "notifications"
  | "exams"
  | "student-analytics"
  | "content-library"
  | "schedule"
  | "class-content";

export type SidebarNavItem = {
  id: CmsModule;
  label: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
};

interface CourseSidebarProps {
  activeModule: CmsModule;
  menuItems: SidebarNavItem[];
  classes: ClassSummary[];
  selectedCourseId?: string;
  onModuleSelect: (moduleId: CmsModule) => void;
  onSelectClass: (courseId: string) => void;
  teacherInfo: {
    name: string;
    department: string;
    totalStudents: number;
    activeClasses: number;
  };
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

export function CourseSidebar({
  activeModule,
  classes,
  menuItems,
  onModuleSelect,
  onSelectClass,
  selectedCourseId,
  teacherInfo,
}: CourseSidebarProps) {
  return (
    <SidebarContent className="border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/60 p-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(teacherInfo.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">
              {teacherInfo.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {teacherInfo.department}
            </p>
          </div>
          <Badge variant="outline" className="ml-auto text-[11px]">
            {teacherInfo.activeClasses} courses
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activeModule === item.id}
                  onClick={() => onModuleSelect(item.id)}
                  className="justify-between"
                  tooltip={item.description ?? item.label}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarGroupLabel>Courses</SidebarGroupLabel>
        <SidebarGroupContent>
          <ScrollArea className="h-[260px] pr-1">
            <SidebarMenu>
              {classes.map((course) => (
                <SidebarMenuItem key={course.id}>
                  <SidebarMenuButton
                    isActive={selectedCourseId === course.id}
                    onClick={() => onSelectClass(course.id)}
                    className="items-start gap-2"
                    tooltip={course.name}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-semibold text-primary">
                      {course.code?.slice(0, 3).toUpperCase() ?? "CLS"}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-medium leading-tight truncate">
                        {course.name}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {course.enrolled_students} students
                      </p>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {classes.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled className="justify-start text-left">
                    <span className="text-sm text-muted-foreground">
                      No courses available yet
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </ScrollArea>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarFooter>
        <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Enrolled</span>
            <span className="font-semibold">{teacherInfo.totalStudents}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Keep track of course progress and student activity.
          </div>
        </div>
      </SidebarFooter>
    </SidebarContent>
  );
}

