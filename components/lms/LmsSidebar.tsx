import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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
  Paperclip,
  SquarePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LmsSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "classes", label: "My Courses", icon: BookOpen },
  { id: "enroll", label: "Enroll", icon: SquarePlus },
  { id: "exams", label: "Exams", icon: Paperclip },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "study-tools", label: "AI Study Tools", icon: Brain },
  { id: "performance", label: "Student Performance", icon: TrendingUp },
  { id: "payments", label: "Payments", icon: CreditCard },
];

export function LmsSidebar({ activeModule, onModuleChange }: LmsSidebarProps) {
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
    <Sidebar
      className={cn(
        collapsed ? "w-14" : "w-60",
        "border-r border-border bg-sidebar"
      )}
      collapsible="icon"
    >
      <div className="flex justify-end p-2 lg:hidden">
        <SidebarTrigger className="h-8 w-8 hover:bg-muted" />
      </div>
      <SidebarContent
        className={cn("pb-6", !isMobile && "pt-15", isMobile && "pt-2")}
      >
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
                      onClick={() => handleModuleChange(item.id)}
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
