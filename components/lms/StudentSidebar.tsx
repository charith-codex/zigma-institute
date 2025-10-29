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
  Home,
  BookOpen,
  Calendar,
  Brain,
  TrendingUp,
  CreditCard,
  LogOut,
} from "lucide-react";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";

interface StudentSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "classes", label: "My Classes", icon: BookOpen },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "study-tools", label: "AI Study Tools", icon: Brain },
  { id: "performance", label: "Student Performance", icon: TrendingUp },
  { id: "payments", label: "Payments", icon: CreditCard },
];

export function StudentSidebar({
  activeModule,
  onModuleChange,
}: StudentSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (moduleId: string) => activeModule === moduleId;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent className="pt-15">
        <SidebarGroup>
          <SidebarGroupLabel>Student Portal Menu</SidebarGroupLabel>
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
