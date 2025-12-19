import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CmsSidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface CourseNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface CourseSidebarDetails {
  name: string;
  code: string;
  onBack?: () => void;
}

interface CmsSidebarProps {
  items: CmsSidebarItem[];
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  courseNavItems?: CourseNavItem[];
  activeCourseSection?: string;
  onCourseSectionChange?: (sectionId: string) => void;
  courseDetails?: CourseSidebarDetails;
}

const CmsSidebar = ({
  items,
  activeModule,
  onModuleChange,
  courseNavItems,
  activeCourseSection,
  onCourseSectionChange,
  courseDetails,
}: CmsSidebarProps) => {
  const { state, isMobile, setOpenMobile } = useSidebar();

  const handleModuleChange = (moduleId: string) => {
    onModuleChange(moduleId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleCourseSectionChange = (sectionId: string) => {
    onCourseSectionChange?.(sectionId);
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
      <div className="flex justify-end p-2 lg:hidden">
        <SidebarTrigger className="h-8 w-8 hover:bg-muted" />
      </div>
      <SidebarContent
        className={cn("flex flex-col gap-2 pb-6", !isMobile && "pt-15")}
      >
        {/* Navigation */}
        {items && items.length > 0 && (
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
                      aria-current={
                        activeModule === item.id ? "page" : undefined
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state === "expanded" && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {courseNavItems && courseNavItems.length > 0 && (
          <SidebarGroup>
            {state === "expanded" && (
              <div className="mx-2 mb-4 rounded-xl bg-muted/40 ring-1 ring-border/50">
                <div className="flex flex-col gap-1 overflow-hidden py-3">
                  <div className="flex items-center justify-center gap-2 overflow-hidden">
                    <span className="truncate font-bold uppercase tracking-wider text-primary">
                      {courseDetails?.name ?? "Course"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {courseNavItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleCourseSectionChange(item.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        activeCourseSection === item.id
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "hover:bg-muted"
                      )}
                      aria-current={
                        activeCourseSection === item.id ? "page" : undefined
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state === "expanded" && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {state === "expanded" && courseDetails?.onBack && (
          <div className="flex items-center rounded-xl bg-muted/40 p-2 ring-1 ring-border/50">
            <button
              onClick={courseDetails.onBack}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default CmsSidebar;
