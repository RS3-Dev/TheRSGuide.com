import type { ComponentType, LazyExoticComponent } from 'react'

export type Doc = {
  path: string
  title: string
  navigationTitle: string
  description: string
  section: string
  tableOfContents: readonly GuideTocItem[]
  hasTableOfContents: boolean
  showPageHeader: boolean
  unlisted?: boolean
  requiresPlayerData: boolean
  ogImage: string
  Component: ComponentType | LazyExoticComponent<ComponentType>
}

export type GuideTocItem = {
  id: string
  text: string
  level: 2 | 3
}

export type GuideNavNode = {
  doc: Doc
  label: string
  children: GuideNavNode[]
}

export type GuideSection = {
  id: string
  label: string
  path: string
  index: Doc | null
  documents: readonly Doc[]
  navigation: readonly GuideNavNode[]
}

export type GuideBreadcrumb = {
  path: string
  label: string
  current: boolean
}

export type GuideAdjacent = {
  previous: Doc | null
  next: Doc | null
}

export type GuideDocumentSource = {
  sourcePath: string
  path: string
  title: string
  navigationTitle?: string
  description: string
  section: string
  tableOfContents: readonly GuideTocItem[]
  hasTableOfContents: boolean
  showPageHeader: boolean
  unlisted?: boolean
  requiresPlayerData: boolean
  ogImage: string
  Component: Doc['Component']
}

export type GuideMetadataSource = {
  sourcePath: string
  pages?: readonly string[]
  disabledPages?: readonly string[]
}

export type GuideSectionDefinition = {
  id: string
  label: string
}

type GuideCatalogOptions = {
  documents: readonly GuideDocumentSource[]
  metadata: readonly GuideMetadataSource[]
  sections: readonly GuideSectionDefinition[]
}

const titleFromSlug = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b(?:m{0,3}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3}))\b/gi, (match) => match.toUpperCase()).replace(/\b\w/g, (letter) => letter.toUpperCase())

const normalizeRoute = (path: string) => {
  if (path === '/') return path
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`
  return withLeadingSlash.replace(/\/+$/, '')
}

const directoryFromMetadataSource = (sourcePath: string) => {
  const relative = sourcePath
    .replaceAll('\\', '/')
    .replace(/^.*\/content/, '')
    .replace(/\/meta\.json$/, '')
  return normalizeRoute(relative || '/')
}

const groupLabel = (path: string) => {
  const slug = path.split('/').filter(Boolean).at(-1) ?? path
  return titleFromSlug(slug)
}

const parentPath = (path: string) => path.slice(0, path.lastIndexOf('/')) || '/'

export class GuideCatalog {
  readonly documents: readonly Doc[]
  readonly sections: readonly GuideSection[]

  readonly #documentsByPath: ReadonlyMap<string, Doc>
  readonly #sectionsById: ReadonlyMap<string, GuideSection>

  constructor(options: GuideCatalogOptions) {
    const orderByPath = new Map<string, number>()
    const disabledPaths = new Set<string>()
    for (const metadata of options.metadata) {
      const directory = directoryFromMetadataSource(metadata.sourcePath)
      metadata.pages?.forEach((page, index) => {
        if (page === 'index') return
        const path = normalizeRoute(`${directory === '/' ? '' : directory}/${page}`)
        orderByPath.set(path, index)
      })
      metadata.disabledPages?.forEach((page) => {
        const path = page === 'index'
          ? directory
          : normalizeRoute(`${directory === '/' ? '' : directory}/${page}`)
        disabledPaths.add(path)
      })
    }

    const documents = options.documents
      .filter((source) => !disabledPaths.has(normalizeRoute(source.path)))
      .map((source) => ({
        path: normalizeRoute(source.path),
        title: source.title,
        navigationTitle: source.navigationTitle ?? source.title,
        description: source.description,
        section: source.section,
        tableOfContents: source.tableOfContents,
        hasTableOfContents: source.hasTableOfContents,
        showPageHeader: source.showPageHeader,
        unlisted: source.unlisted ?? false,
        requiresPlayerData: source.requiresPlayerData,
        ogImage: source.ogImage,
        Component: source.Component,
      } satisfies Doc))

    const documentsByPath = new Map<string, Doc>()
    for (const document of documents) {
      if (documentsByPath.has(document.path)) {
        throw new Error(`Duplicate guide route: ${document.path}`)
      }
      documentsByPath.set(document.path, document)
    }

    const compareDocuments = (a: Doc, b: Doc) => {
      if (a.path === b.path) return 0
      if (b.path.startsWith(`${a.path}/`)) return -1
      if (a.path.startsWith(`${b.path}/`)) return 1

      const aParts = a.path.split('/').filter(Boolean)
      const bParts = b.path.split('/').filter(Boolean)
      const length = Math.max(aParts.length, bParts.length)
      for (let index = 1; index <= length; index += 1) {
        const aPrefix = `/${aParts.slice(0, index).join('/')}`
        const bPrefix = `/${bParts.slice(0, index).join('/')}`
        if (aPrefix === bPrefix) continue
        const difference = (orderByPath.get(aPrefix) ?? Number.MAX_SAFE_INTEGER)
          - (orderByPath.get(bPrefix) ?? Number.MAX_SAFE_INTEGER)
        if (difference) return difference
        return aPrefix.localeCompare(bPrefix)
      }
      return a.title.localeCompare(b.title)
    }

    const sections = options.sections.map((definition) => {
      const path = `/${definition.id}`
      const sectionDocuments = documents
        .filter((document) => document.section === definition.id)
        .sort(compareDocuments)
      const navigationDocuments = sectionDocuments.filter(
        (document) => document.path !== path && !document.unlisted,
      )
      const nodes: GuideNavNode[] = navigationDocuments.map((doc) => ({
        doc,
        label: doc.section === 'leagues' && doc.path.split('/').filter(Boolean).length === 2
          ? doc.navigationTitle
          : groupLabel(doc.path),
        children: [],
      }))
      const nodesByPath = new Map(nodes.map((node) => [node.doc.path, node]))
      const navigation: GuideNavNode[] = []

      for (const node of nodes) {
        const parent = nodesByPath.get(parentPath(node.doc.path))
        if (parent) parent.children.push(node)
        else navigation.push(node)
      }

      return {
        id: definition.id,
        label: definition.label,
        path,
        index: documentsByPath.get(path) ?? null,
        documents: sectionDocuments,
        navigation,
      } satisfies GuideSection
    })

    const configuredSections = new Set(sections.map((section) => section.id))
    this.documents = [
      ...sections.flatMap((section) => section.documents),
      ...documents
        .filter((document) => !configuredSections.has(document.section))
        .sort((a, b) => a.path.localeCompare(b.path)),
    ]
    this.sections = sections
    this.#documentsByPath = documentsByPath
    this.#sectionsById = new Map(sections.map((section) => [section.id, section]))
  }

  get(path: string) {
    return this.#documentsByPath.get(normalizeRoute(path))
  }

  section(id: string) {
    return this.#sectionsById.get(id)
  }

  sectionLabel(id: string) {
    return this.section(id)?.label ?? titleFromSlug(id)
  }

  breadcrumbs(path: string): GuideBreadcrumb[] {
    const normalizedPath = normalizeRoute(path)
    const parts = normalizedPath.split('/').filter(Boolean)
    return parts.map((part, index) => {
      const breadcrumbPath = `/${parts.slice(0, index + 1).join('/')}`
      const current = index === parts.length - 1
      return {
        path: breadcrumbPath,
        label: index === 0
          ? this.section(part)?.label ?? titleFromSlug(part)
          : current
            ? this.get(breadcrumbPath)?.title ?? titleFromSlug(part)
            : titleFromSlug(part),
        current,
      }
    })
  }

  adjacent(document: Doc): GuideAdjacent {
    const documents = (this.section(document.section)?.documents ?? [])
      .filter((candidate) => !candidate.unlisted)
    const index = documents.findIndex((candidate) => candidate.path === document.path)
    return {
      previous: index > 0 ? documents[index - 1] : null,
      next: index >= 0 && index < documents.length - 1 ? documents[index + 1] : null,
    }
  }
}

export const createGuideCatalog = (options: GuideCatalogOptions) => new GuideCatalog(options)
