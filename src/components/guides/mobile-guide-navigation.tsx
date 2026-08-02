import { NavLink } from "react-router"
import { ChevronDown, ChevronRight } from "lucide-react"

import { useGuideNavigation } from "@/components/guides/use-guide-navigation"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type {
  GuideNavigationNodeModel,
  GuideNavigationSectionModel,
} from "@/lib/guide-navigation"
import { cn } from "@/lib/utils"

const mobileLinkClassName =
  "border-l border-transparent px-[.65rem] py-[.38rem] text-[.84rem] leading-[1.3] transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"

function getMobileLinkClassName(isActive: boolean) {
  return cn(
    mobileLinkClassName,
    isActive
      ? "border-sidebar-primary bg-[color-mix(in_oklch,var(--sidebar-primary)_9%,transparent)] text-sidebar-primary"
      : "text-sidebar-muted-foreground"
  )
}

function MobileNavigationNode({
  node,
  navigation,
  close,
}: {
  node: GuideNavigationNodeModel
  navigation: ReturnType<typeof useGuideNavigation>
  close?: () => void
}) {
  const hasChildren = node.children.length > 0
  const open = node.open

  if (!hasChildren) {
    return (
      <NavLink
        to={node.path}
        onClick={close}
        className={({ isActive }) => getMobileLinkClassName(isActive)}
      >
        {node.title}
      </NavLink>
    )
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={(nextOpen) =>
        navigation.setOpen(node.key, nextOpen)
      }
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between bg-transparent font-bold text-sidebar-foreground shadow-none hover:text-sidebar-foreground"
          aria-label={`${open ? "Collapse" : "Expand"} ${node.label}`}
        >
          <span>{node.label}</span>
          {open ? <ChevronDown /> : <ChevronRight />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-[.15rem] overflow-hidden pl-[.65rem]">
        <NavLink
          to={node.path}
          onClick={close}
          className={({ isActive }) => getMobileLinkClassName(isActive)}
        >
          {node.title}
        </NavLink>
        {node.children.map((child) => (
          <MobileNavigationNode
            key={child.key}
            node={child}
            navigation={navigation}
            close={close}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function MobileNavigationSection({
  section,
  navigation,
  close,
}: {
  section: GuideNavigationSectionModel
  navigation: ReturnType<typeof useGuideNavigation>
  close?: () => void
}) {
  const open = section.open

  return (
    <Collapsible
      className="flex flex-col"
      open={open}
      onOpenChange={(nextOpen) =>
        navigation.setOpen(section.key, nextOpen)
      }
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between bg-transparent font-display text-[.78rem] font-bold tracking-[.08em] text-sidebar-foreground shadow-none uppercase hover:text-sidebar-foreground"
          aria-label={`${open ? "Collapse" : "Expand"} ${section.label}`}
        >
          <span>{section.label}</span>
          {open ? <ChevronDown /> : <ChevronRight />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <div className="flex flex-col gap-[.15rem] pt-[.6rem]">
          {section.index && (
            <NavLink
              to={section.index.path}
              onClick={close}
              className={({ isActive }) => getMobileLinkClassName(isActive)}
            >
              {section.index.title}
            </NavLink>
          )}
          {section.nodes.map((node) => (
            <MobileNavigationNode
              key={node.key}
              node={node}
              navigation={navigation}
              close={close}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function MobileGuideNavigation({ close }: { close?: () => void }) {
  const navigation = useGuideNavigation()

  return (
    <nav
      className="flex flex-col gap-[1.8rem] py-4 pr-2 pb-8"
      aria-label="Guide navigation"
    >
      {navigation.sections.map((section) =>
        section.flattened ? (
          <div
            key={section.key}
            className="flex flex-col gap-[.15rem] pt-[.6rem]"
          >
            {section.nodes.map((node) => (
              <MobileNavigationNode
                key={node.key}
                node={node}
                navigation={navigation}
                close={close}
              />
            ))}
          </div>
        ) : (
          <MobileNavigationSection
            key={section.key}
            section={section}
            navigation={navigation}
            close={close}
          />
        )
      )}
    </nav>
  )
}

export { MobileGuideNavigation }
