import type { GuideNavNode, GuideSection } from "@/lib/guide-catalog"

type GuideNavigationNodeModel = {
  key: string
  path: string
  title: string
  label: string
  active: boolean
  open: boolean
  children: readonly GuideNavigationNodeModel[]
}

type GuideNavigationSectionModel = {
  key: string
  label: string
  open: boolean
  flattened: boolean
  index: { path: string; title: string; active: boolean } | null
  nodes: readonly GuideNavigationNodeModel[]
}

type GuideNavigationModel = {
  sections: readonly GuideNavigationSectionModel[]
  expanded: ReadonlySet<string>
}

const branchIsActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`)

function collectActiveKeys(
  nodes: readonly GuideNavNode[],
  pathname: string,
  keys: Set<string>
) {
  for (const node of nodes) {
    if (!branchIsActive(pathname, node.doc.path)) continue
    if (node.children.length) keys.add(node.doc.path)
    collectActiveKeys(node.children, pathname, keys)
  }
}

function activeKeys(sections: readonly GuideSection[], pathname: string) {
  const keys = new Set<string>()
  for (const section of sections) {
    if (!branchIsActive(pathname, section.path)) continue
    keys.add(section.path)
    collectActiveKeys(section.navigation, pathname, keys)
  }
  return keys
}

function projectNode(
  node: GuideNavNode,
  pathname: string,
  expanded: ReadonlySet<string>
): GuideNavigationNodeModel {
  return {
    key: node.doc.path,
    path: node.doc.path,
    title: node.doc.title,
    label: node.label,
    active: pathname === node.doc.path,
    open: expanded.has(node.doc.path),
    children: node.children.map((child) =>
      projectNode(child, pathname, expanded)
    ),
  }
}

function createGuideNavigationModel({
  sections,
  pathname,
  expanded,
  flattened,
  syncActive = false,
}: {
  sections: readonly GuideSection[]
  pathname: string
  expanded: ReadonlySet<string>
  flattened: boolean
  syncActive?: boolean
}): GuideNavigationModel {
  const active = syncActive ? activeKeys(sections, pathname) : new Set<string>()
  const nextExpanded = active.size
    ? new Set([...expanded, ...active])
    : expanded

  return {
    expanded: nextExpanded,
    sections: sections.map((section) => ({
      key: section.path,
      label: section.label,
      open: nextExpanded.has(section.path),
      flattened,
      index: section.index
        ? {
            path: section.path,
            title: section.index.title,
            active: pathname === section.path,
          }
        : null,
      nodes: section.navigation.map((node) =>
        projectNode(node, pathname, nextExpanded)
      ),
    })),
  }
}

export {
  createGuideNavigationModel,
  type GuideNavigationModel,
  type GuideNavigationNodeModel,
  type GuideNavigationSectionModel,
}
