import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CmsSidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface CmsSidebarProps {
  items: CmsSidebarItem[];
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
}

const CmsSidebar = ({ items, activeModule, onModuleChange }: CmsSidebarProps) => {
  const { state, isMobile, setOpenMobile } = useSidebar();

  const handleModuleChange = (moduleId: string) => {
    onModuleChange(moduleId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/90"
    >
      <SidebarContent
        className={cn(
          "flex flex-col gap-2 pb-6",
          isMobile ? "pt-6" : "pt-6 mt-14"
        )}
      >
        {/* Navigation */}
        <SidebarGroup>
          {state === "expanded" && (
            <SidebarGroupLabel>Teacher Portal</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleModuleChange(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      activeModule === item.id
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-muted"
                    )}
                    aria-current={activeModule === item.id ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {state === "expanded" && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default CmsSidebar;
