import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Users,
  BookOpen,
  DollarSign,
  QrCode,
  MessageSquare,
  Calendar,
  GraduationCap,
  Settings,
  Bell,
  Globe,
  FileText,
} from "lucide-react";

interface AdminSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const menuItems = [
  { id: "overview", label: "Dashboard", icon: BarChart3 },
  { id: "students", label: "Students", icon: Users },
  { id: "teachers", label: "Teachers", icon: GraduationCap },
  { id: "classes", label: "Courses", icon: BookOpen },
  { id: "scheduling", label: "Scheduling", icon: Calendar },
  {
    id: "material-distribution",
    label: "Material Distribution",
    icon: FileText,
  },
  { id: "fees", label: "Fee Management", icon: DollarSign },
  { id: "attendance-qr", label: "QR Attendance", icon: QrCode },
  { id: "student-registration", label: "Student Registration", icon: Users },
  { id: "staff-management", label: "Staff Management", icon: GraduationCap },
  {
    id: "inquiry-management",
    label: "Inquiry Management",
    icon: MessageSquare,
  },
  { id: "showcase-management", label: "Website Management", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  activeModule,
  onModuleChange,
}: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (moduleId: string) => activeModule === moduleId;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent className="pt-3">
        <SidebarGroup>
          <SidebarGroupLabel>Staff Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    className={
                      isActive(item.id)
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/50"
                    }
                  >
                    <button
                      onClick={() => onModuleChange(item.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-md"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
