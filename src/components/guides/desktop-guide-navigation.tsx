import { NavLink } from "react-router"
import { ChevronDown, ChevronRight } from "lucide-react"

import { useGuideNavigation } from "@/components/guides/use-guide-navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type {
  GuideNavigationNodeModel,
  GuideNavigationSectionModel,
} from "@/lib/guide-navigation"
import { cn } from "@/lib/utils"

const menuButtonClassName =
  "rounded-none bg-transparent text-sidebar-foreground shadow-none hover:bg-sidebar-accent hover:text-sidebar-foreground data-active:bg-transparent! data-active:font-bold! data-active:text-sidebar-primary!"

function DesktopNavigationSubNode({
  node,
  navigation,
}: {
  node: GuideNavigationNodeModel
  navigation: ReturnType<typeof useGuideNavigation>
}) {
  const hasChildren = node.children.length > 0
  const open = node.open

  if (!hasChildren) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          className={menuButtonClassName}
          asChild
          isActive={node.active}
        >
          <NavLink to={node.path}>{node.title}</NavLink>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={(nextOpen) =>
        navigation.setOpen(node.key, nextOpen)
      }
    >
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(menuButtonClassName, "justify-between font-bold")}
            aria-label={`${open ? "Collapse" : "Expand"} ${node.label}`}
          >
            <span>{node.label}</span>
            {open ? <ChevronDown /> : <ChevronRight />}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                className={menuButtonClassName}
                asChild
                isActive={node.active}
              >
                <NavLink to={node.path}>{node.title}</NavLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            {node.children.map((child) => (
              <DesktopNavigationSubNode
                key={child.key}
                node={child}
                navigation={navigation}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  )
}

function DesktopNavigationNode({
  node,
  navigation,
}: {
  node: GuideNavigationNodeModel
  navigation: ReturnType<typeof useGuideNavigation>
}) {
  const hasChildren = node.children.length > 0
  const open = node.open

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          className={menuButtonClassName}
          asChild
          isActive={node.active}
        >
          <NavLink to={node.path}>{node.title}</NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={(nextOpen) =>
        navigation.setOpen(node.key, nextOpen)
      }
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(menuButtonClassName, "justify-between font-bold")}
            aria-label={`${open ? "Collapse" : "Expand"} ${node.label}`}
          >
            <span>{node.label}</span>
            {open ? <ChevronDown /> : <ChevronRight />}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                className={menuButtonClassName}
                asChild
                isActive={node.active}
              >
                <NavLink to={node.path}>{node.title}</NavLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            {node.children.map((child) => (
              <DesktopNavigationSubNode
                key={child.key}
                node={child}
                navigation={navigation}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function DesktopNavigationSection({
  section,
  navigation,
}: {
  section: GuideNavigationSectionModel
  navigation: ReturnType<typeof useGuideNavigation>
}) {
  const open = section.open

  return (
    <Collapsible
      open={open}
      onOpenChange={(nextOpen) =>
        navigation.setOpen(section.key, nextOpen)
      }
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger
            className="w-full justify-between border-0 bg-transparent font-display font-bold tracking-[.08em] text-sidebar-foreground/70 uppercase hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label={`${open ? "Collapse" : "Expand"} ${section.label}`}
          >
            <span>{section.label}</span>
            {open ? <ChevronDown /> : <ChevronRight />}
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.index && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={menuButtonClassName}
                    asChild
                    isActive={section.index.active}
                  >
                    <NavLink to={section.index.path}>{section.index.title}</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {section.nodes.map((node) => (
                <DesktopNavigationNode
                  key={node.key}
                  node={node}
                  navigation={navigation}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

function DesktopGuideNavigation() {
  const navigation = useGuideNavigation()

  return (
    <nav className="py-4 pr-0 pb-8 pl-[20%]" aria-label="Guide navigation">
      {navigation.sections.map((section) =>
        section.flattened ? (
          <SidebarGroup key={section.key}>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.nodes.map((node) => (
                  <DesktopNavigationNode
                    key={node.key}
                    node={node}
                    navigation={navigation}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <DesktopNavigationSection
            key={section.key}
            section={section}
            navigation={navigation}
          />
        )
      )}
    </nav>
  )
}

export { DesktopGuideNavigation }
