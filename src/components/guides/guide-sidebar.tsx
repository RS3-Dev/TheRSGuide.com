import { DesktopGuideNavigation } from "@/components/guides/desktop-guide-navigation"
import { SiteSettingsButton } from "@/components/settings/site-settings-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

function GuideSidebar() {
  return (
    <Sidebar
      collapsible="offcanvas"
      className="top-16 bottom-auto h-[calc(100svh-4rem)] [&_[data-sidebar=group-action]]:border-0 [&_[data-sidebar=group-action]]:shadow-none [&_[data-sidebar=trigger]]:border-0 [&_[data-sidebar=trigger]]:shadow-none"
    >
      <SidebarHeader>
        <div className="flex items-center justify-end py-[.3rem] pr-1 pl-[33.333%]">
          <SidebarTrigger
            aria-label="Collapse guide sidebar"
            title="Collapse sidebar"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <ScrollArea
          type="always"
          className="h-full min-h-0"
          thumbClassName="bg-[color-mix(in_oklch,var(--sidebar-muted-foreground)_55%,transparent)]"
        >
          <DesktopGuideNavigation />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="items-end py-2 pr-3 pb-4 pl-[33.333%]">
        <SiteSettingsButton
          className="text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          label="Open site settings"
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function GuideSidebarExpandTrigger() {
  const { isMobile, state } = useSidebar()
  if (isMobile || state !== "collapsed") return null

  return (
    <SidebarTrigger
      className="fixed top-20 left-5 z-6 border-0 shadow-none"
      aria-label="Expand guide sidebar"
      title="Expand sidebar"
    />
  )
}

export { GuideSidebar, GuideSidebarExpandTrigger }
