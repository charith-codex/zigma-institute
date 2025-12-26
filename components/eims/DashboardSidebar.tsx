import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Users,
  User,
  UserCog,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  DollarSign,
  QrCode,
  UserPlus,
  MessageSquare,
  ClipboardList,
  Megaphone,
  Settings,
  Bell,
  Globe,
  ChevronRight,
  Tag,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DashboardSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  menuEntries?: MenuEntry[];
}

type MenuEntry = {
  id: string;
  label: string;
  icon: LucideIcon;
  items?: Array<{ id: string; label: string; icon: LucideIcon }>;
};

const baseMenuEntries: MenuEntry[] = [
  { id: "overview", label: "Dashboard", icon: BarChart3 },
  {
    id: "user-management",
    label: "User Management",
    icon: Users,
    items: [
      { id: "students", label: "Students", icon: User },
      { id: "teachers", label: "Teachers", icon: GraduationCap },
      { id: "staff-management", label: "Staff", icon: UserCog },
    ],
  },
  {
    id: "course-operations",
    label: "Course Operations",
    icon: BookOpen,
    items: [
      { id: "course-categories", label: "Categories", icon: Tag },
      { id: "classes", label: "Courses", icon: BookOpen },
      {
        id: "course-access",
        label: "Course Access",
        icon: UserCog,
      },
      { id: "scheduling", label: "Scheduling", icon: Calendar },
      {
        id: "material-distribution",
        label: "Material Distribution",
        icon: FileText,
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    icon: ClipboardList,
    items: [
      { id: "fees", label: "Fee Management", icon: DollarSign },
      { id: "attendance-qr", label: "QR Attendance", icon: QrCode },
      {
        id: "inquiry-management",
        label: "Inquiries",
        icon: MessageSquare,
      },
    ],
  },
  {
    id: "communications",
    label: "Communications",
    icon: Megaphone,
    items: [
      {
        id: "showcase-management",
        label: "Website Management",
        icon: Globe,
      },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
  },
];

export const getMenuEntriesForRole = (role?: string | null): MenuEntry[] => {
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  return baseMenuEntries
    .map((entry) => {
      if (entry.id !== "user-management" || !entry.items) {
        return entry;
      }

      const filteredItems = entry.items.filter((item) => {
        if (item.id === "staff-management") {
          return isAdmin;
        }

        if (item.id === "students" || item.id === "teachers") {
          return isAdmin || isManager;
        }

        return true;
      });

      return { ...entry, items: filteredItems };
    })
    .filter((entry) => entry.items == null || entry.items.length > 0);
};

export function DashboardSidebar({
  activeModule,
  onModuleChange,
  menuEntries,
}: DashboardSidebarProps) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (moduleId: string) => activeModule === moduleId;

  const handleModuleChange = (moduleId: string) => {
    onModuleChange(moduleId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent className="pt-3">
        <SidebarGroup>
          <SidebarGroupLabel>Staff Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(menuEntries ?? baseMenuEntries).map((entry) => {
                // No sub-items → simple button
                if (!entry.items || entry.items.length === 0) {
                  return (
                    <SidebarMenuItem key={entry.id}>
                      <SidebarMenuButton
                        asChild
                        tooltip={entry.label}
                        className={cn(
                          isActive(entry.id)
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleModuleChange(entry.id)}
                          className="flex w-full items-center gap-3"
                        >
                          <entry.icon className="h-4 w-4" />
                          {!collapsed && <span>{entry.label}</span>}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Has sub-items → collapsible section
                const sectionActive = entry.items.some((item) =>
                  isActive(item.id)
                );

                return (
                  <Collapsible
                    key={entry.id}
                    defaultOpen={sectionActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={entry.label}
                          className={cn(
                            sectionActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted/50"
                          )}
                        >
                          <entry.icon className="h-4 w-4" />
                          {!collapsed && <span>{entry.label}</span>}
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {entry.items.map((item) => (
                            <SidebarMenuSubItem key={item.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(item.id)}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleModuleChange(item.id)}
                                  className="flex w-full items-center gap-2"
                                >
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
