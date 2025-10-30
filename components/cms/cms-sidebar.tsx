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

const TeacherSidebar = ({
  sidebarItems,
  activeModule,
  setActiveModule,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) => {
  const { state } = useSidebar();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent className="pt-15">
        {/* Navigation */}
        <SidebarGroup>
          {state === "expanded" && (
            <SidebarGroupLabel>Teacher Portal</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {sidebarItems.map((item: any) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveModule(item.id)}
                    className={
                      activeModule === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/50"
                    }
                  >
                    <item.icon className="w-4 h-4" />
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

export default TeacherSidebar;
