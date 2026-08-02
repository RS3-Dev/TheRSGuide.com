import { lazy, type ComponentType } from 'react'
import { guideManifest, guideMetadata } from 'virtual:guide-manifest'
import {
  createGuideCatalog,
  type GuideDocumentSource,
} from '@/lib/guide-catalog'
import { createGuideSearchIndex } from '@/lib/guide-search'
import { isGuideSectionEnabled } from '@/lib/homepage-mode'

type MdxModule = {
  default: ComponentType
  frontmatter?: { title?: string; navigationTitle?: string; description?: string }
}

const modules = import.meta.glob<MdxModule>('../../content/**/*.mdx')

const allGuideSectionDefinitions = [
  { id: 'setup', label: 'Setup' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'guides', label: 'Guides' },
  { id: 'extras', label: 'Extras' },
  { id: 'leagues', label: 'Leagues' },
]

export const guideSectionDefinitionsForMode = (value?: string) =>
  allGuideSectionDefinitions.filter((section) =>
    isGuideSectionEnabled(section.id, value)
  )

const homepageMode = import.meta.env.VITE_HOMEPAGE_MODE
const visibleGuideManifest = guideManifest.filter((document) =>
  isGuideSectionEnabled(document.section, homepageMode)
)

const documentSources: GuideDocumentSource[] = visibleGuideManifest.map((document) => {
  const loader = modules[document.sourcePath]
  if (!loader) throw new Error(`Missing MDX module for ${document.sourcePath}`)
  return {
    ...document,
    Component: lazy(loader),
  }
})

export const guideCatalog = createGuideCatalog({
  documents: documentSources,
  metadata: guideMetadata,
  sections: guideSectionDefinitionsForMode(homepageMode),
})

export type PrimaryNavigationLink = {
  id: string
  label: string
  path: string
}

export const guideSections = guideCatalog.sections

export const primaryNavigation: readonly PrimaryNavigationLink[] = guideCatalog.sections
  .map((section) => ({
    id: section.id,
    label: section.label,
    path: section.path,
  }))

export const guideSearch = createGuideSearchIndex(guideCatalog)

let fullGuideSearch: ReturnType<typeof createGuideSearchIndex> | null = null
let guideSearchPromise: Promise<ReturnType<typeof createGuideSearchIndex>> | null = null

export const loadGuideSearch = () => {
  if (fullGuideSearch) return Promise.resolve(fullGuideSearch)
  guideSearchPromise ??= import('virtual:guide-search-corpus').then(({ guideSearchCorpus }) => {
    fullGuideSearch = createGuideSearchIndex(guideCatalog, guideSearchCorpus)
    return fullGuideSearch
  })
  return guideSearchPromise
}

export type {
  Doc,
  GuideAdjacent,
  GuideBreadcrumb,
  GuideNavNode,
  GuideSection,
  GuideTocItem,
} from '@/lib/guide-catalog'
