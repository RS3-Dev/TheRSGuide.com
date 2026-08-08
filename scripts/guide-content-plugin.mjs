import { promises as fs } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import {
  generateOpenGraphImage,
  OPEN_GRAPH_IMAGE_HEIGHT,
  openGraphImagePath,
  OPEN_GRAPH_IMAGE_WIDTH,
} from './open-graph-image.mjs'

const MANIFEST_ID = 'virtual:guide-manifest'
const SEARCH_ID = 'virtual:guide-search-corpus'
const RESOLVED_MANIFEST_ID = `\0${MANIFEST_ID}`
const RESOLVED_SEARCH_ID = `\0${SEARCH_ID}`
const DEFAULT_SITE_URL = 'https://thersguide.com'
const DEFAULT_OG_IMAGE = openGraphImagePath('/')
const PLAYER_DATA_COMPONENTS = [
  'PlayerSearch',
  'QuestRequirements',
  'SkillTrainingLookup',
  'EfficiencyGuideTool',
]

const normalizeSlashes = (value) => value.replaceAll('\\', '/')

const titleFromSlug = (value) =>
  value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

const socialSection = (parts) => {
  if (parts[0] === 'getting-started') return 'Getting Started'
  if (parts[0] === 'setup') return 'Setup Guide'
  if (parts[0] === 'leagues') return 'Leagues'
  if (parts[0] === 'extras') return 'Extras'
  if (parts[0] === 'guides' && parts[1]) return titleFromSlug(parts[1])
  return 'RuneScape Guides'
}

const normalizeRoute = (route) => {
  const withLeadingSlash = route.startsWith('/') ? route : `/${route}`
  return withLeadingSlash === '/' ? '/' : withLeadingSlash.replace(/\/+$/, '')
}

const routeFromRelativeFile = (relativeFile) =>
  normalizeRoute(`/${normalizeSlashes(relativeFile).replace(/\.mdx$/, '').replace(/\/index$/, '')}`)

const headingText = (value) =>
  value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+#+\s*$/, '')
    .trim()

const headingId = (text, index) =>
  `${text.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'section'}-${index}`

const tableOfContents = (body) => {
  const items = []
  for (const line of body.split(/\r?\n/)) {
    const match = /^(##|###)\s+(.+)$/.exec(line)
    if (!match) continue
    const text = headingText(match[2])
    if (!text) continue
    items.push({
      id: headingId(text, items.length),
      text,
      level: match[1].length,
    })
  }
  return items
}

const searchableText = (body) =>
  body
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`>|[\](){}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const requiresPlayerData = (body, override) => {
  if (typeof override === 'boolean') return override
  return PLAYER_DATA_COMPONENTS.some((component) =>
    new RegExp(`<${component}(?:\\s|/|>)`).test(body)
  )
}

const walk = async (directory, filename) => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) return walk(absolute, filename)
    return entry.isFile() && (!filename || entry.name === filename) ? [absolute] : []
  }))
  return nested.flat()
}

export async function buildGuideContent(root) {
  const contentDirectory = path.join(root, 'content')
  const mdxFiles = (await walk(contentDirectory))
    .filter((file) => file.endsWith('.mdx'))
    .sort()
  const metaFiles = (await walk(contentDirectory, 'meta.json')).sort()

  const documents = await Promise.all(mdxFiles.map(async (absoluteFile) => {
    const relativeFile = normalizeSlashes(path.relative(contentDirectory, absoluteFile))
    const sourcePath = `../../content/${relativeFile}`
    const raw = await fs.readFile(absoluteFile, 'utf8')
    const parsed = matter(raw)
    const route = routeFromRelativeFile(relativeFile)
    const parts = route.split('/').filter(Boolean)
    const title = typeof parsed.data.title === 'string'
      ? parsed.data.title.trim()
      : ''
    if (!title) {
      throw new Error(`${sourcePath} must define a non-empty frontmatter title`)
    }
    const toc = tableOfContents(parsed.content)
    const tocOverride = typeof parsed.data.toc === 'boolean' ? parsed.data.toc : undefined
    const headerOverride = typeof parsed.data.header === 'boolean' ? parsed.data.header : undefined
    const customOgImage = typeof parsed.data.ogImage === 'string'
      ? parsed.data.ogImage
      : typeof parsed.data.image === 'string'
        ? parsed.data.image
        : ''

    return {
      sourcePath,
      path: route,
      title,
      navigationTitle: typeof parsed.data.navigationTitle === 'string'
        && parsed.data.navigationTitle.trim()
        ? parsed.data.navigationTitle.trim()
        : title,
      description: typeof parsed.data.description === 'string'
        ? parsed.data.description.trim()
        : '',
      section: parts[0] ?? '',
      tableOfContents: toc,
      hasTableOfContents: tocOverride ?? toc.length > 0,
      showPageHeader: headerOverride ?? true,
      requiresPlayerData: requiresPlayerData(parsed.content, parsed.data.playerData),
      ogImage: customOgImage || openGraphImagePath(route),
      ogImageAlt: typeof parsed.data.ogImageAlt === 'string'
        ? parsed.data.ogImageAlt.trim()
        : `${title} guide preview`,
      generatedOgImage: !customOgImage,
      socialSection: socialSection(parts),
      socialDetail: toc.length
        ? `RuneScape guide · ${toc.length} section${toc.length === 1 ? '' : 's'}`
        : 'RuneScape guide · Practical account progression',
      searchText: searchableText(parsed.content),
    }
  }))

  const documentRoutes = new Set()
  for (const document of documents) {
    if (documentRoutes.has(document.path)) {
      throw new Error(`Duplicate guide route: ${document.path}`)
    }
    documentRoutes.add(document.path)
  }

  const metadata = await Promise.all(metaFiles.map(async (absoluteFile) => {
    const relativeFile = normalizeSlashes(path.relative(root, absoluteFile))
    const parsed = JSON.parse(await fs.readFile(absoluteFile, 'utf8'))
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.pages)) {
      throw new Error(`${relativeFile} must define a pages array`)
    }
    const pages = parsed.pages
    if (pages.some((page) => typeof page !== 'string' || !page.trim())) {
      throw new Error(`${relativeFile} pages must contain non-empty strings`)
    }
    const duplicatePages = pages.filter(
      (page, index) => pages.indexOf(page) !== index,
    )
    if (duplicatePages.length) {
      throw new Error(`${relativeFile} lists duplicate page "${duplicatePages[0]}"`)
    }
    const relativeDirectory = normalizeSlashes(
      path.relative(contentDirectory, path.dirname(absoluteFile)),
    )
    const baseRoute = normalizeRoute(`/${relativeDirectory}`)

    for (const page of pages) {
      const pageRoute = page === 'index'
        ? baseRoute
        : normalizeRoute(`${baseRoute}/${page}`)
      if (!documentRoutes.has(pageRoute)) {
        throw new Error(
          `${relativeFile} references "${page}", but ${pageRoute} has no MDX document`,
        )
      }
    }

    return {
      sourcePath: `../../${relativeFile}`,
      pages,
    }
  }))

  return { documents, metadata }
}

const browserGuideContent = ({ documents, metadata }) => ({
  guideManifest: documents.map((document) => {
    const browserDocument = Object.fromEntries(Object.entries(document).filter(([key]) =>
      !['generatedOgImage', 'ogImageAlt', 'searchText', 'socialDetail', 'socialSection'].includes(key)
    ))
    browserDocument.ogImage = document.generatedOgImage ? '' : document.ogImage
    return browserDocument
  }),
  guideMetadata: metadata,
})

export const guideContentForMode = ({ documents, metadata }, leaguesEnabled) => {
  return leaguesEnabled
    ? { documents, metadata }
    : {
        documents: documents.filter((document) => document.section !== 'leagues'),
        metadata: metadata.filter((entry) =>
          !normalizeSlashes(entry.sourcePath).includes('/content/leagues/')
        ),
      }
}

export const validatePublishedGuideContent = (content) => {
  const missingDescription = content.documents.find(
    (document) => !document.description,
  )
  if (missingDescription) {
    throw new Error(
      `${missingDescription.sourcePath} must define a non-empty frontmatter description`,
    )
  }

  return content
}

const isGuideContentFile = (root, file) => {
  const relativeFile = path.relative(path.join(root, 'content'), file)
  const outsideContent = relativeFile === '..'
    || relativeFile.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativeFile)
  return !outsideContent
    && (relativeFile.endsWith('.mdx') || relativeFile.endsWith('meta.json'))
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const absoluteUrl = (value, siteUrl) => new URL(value, `${siteUrl}/`).href

export const metadataHtml = (metadata, siteUrl) => {
  const title = escapeHtml(metadata.title)
  const description = escapeHtml(metadata.description)
  const canonical = escapeHtml(absoluteUrl(metadata.path, siteUrl))
  const image = escapeHtml(absoluteUrl(metadata.ogImage || DEFAULT_OG_IMAGE, siteUrl))
  const imageAlt = escapeHtml(metadata.ogImageAlt || `${metadata.title} preview`)
  const type = metadata.type || 'website'
  const imageDimensions = metadata.generatedOgImage !== false
    ? `
    <meta property="og:image:width" content="${OPEN_GRAPH_IMAGE_WIDTH}" />
    <meta property="og:image:height" content="${OPEN_GRAPH_IMAGE_HEIGHT}" />`
    : ''
  const articleMetadata = type === 'article'
    ? `
    <meta property="article:section" content="${escapeHtml(metadata.section || 'RuneScape Guides')}" />
    ${(metadata.tags || []).map((tag) =>
      `<meta property="article:tag" content="${escapeHtml(tag)}" />`
    ).join('\n    ')}`
    : ''

  return `<!-- page-metadata:start -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="author" content="The RS Guide" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:site_name" content="The RS Guide" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:type" content="image/png" />${imageDimensions}
    <meta property="og:image:alt" content="${imageAlt}" />${articleMetadata}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:domain" content="thersguide.com" />
    <meta name="twitter:url" content="${canonical}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${imageAlt}" />
    <!-- page-metadata:end -->`
}

const replaceMetadata = (html, metadata, siteUrl) => {
  const replacement = metadataHtml(metadata, siteUrl)
  const marker = /<!-- page-metadata:start -->[\s\S]*?<!-- page-metadata:end -->/
  return marker.test(html)
    ? html.replace(marker, replacement)
    : html.replace('</head>', `${replacement}\n  </head>`)
}

export const documentPageMetadata = (document) => {
  return {
    path: document.path,
    title: `${document.title} | The RS Guide`,
    cardTitle: document.title,
    description: document.description || `Read ${document.title} on The RS Guide.`,
    ogImage: document.ogImage,
    ogImageAlt: document.ogImageAlt,
    generatedOgImage: document.generatedOgImage,
    section: document.socialSection,
    detail: document.socialDetail,
    type: 'article',
    tags: ['RuneScape', document.socialSection, 'Guide'],
  }
}

export function guideContentPlugin({
  siteUrl = DEFAULT_SITE_URL,
  leaguesEnabled = false,
  validatePublishedContent = true,
} = {}) {
  let root = process.cwd()
  let outputDirectory = path.join(root, 'dist')
  let manifestSnapshot = ''

  return {
    name: 'guide-content',
    enforce: 'pre',
    async buildStart() {
      if (!validatePublishedContent) return
      validatePublishedGuideContent(guideContentForMode(
        await buildGuideContent(root),
        leaguesEnabled,
      ))
    },
    configResolved(config) {
      root = config.root
      outputDirectory = path.resolve(root, config.build.outDir)
    },
    resolveId(id) {
      if (id === MANIFEST_ID) return RESOLVED_MANIFEST_ID
      if (id === SEARCH_ID) return RESOLVED_SEARCH_ID
      return null
    },
    async load(id) {
      if (id !== RESOLVED_MANIFEST_ID && id !== RESOLVED_SEARCH_ID) return null
      const guideContent = guideContentForMode(
        await buildGuideContent(root),
        leaguesEnabled,
      )
      if (id === RESOLVED_SEARCH_ID) {
        const corpus = Object.fromEntries(guideContent.documents.map((document) => [
          document.path,
          document.searchText,
        ]))
        return `export const guideSearchCorpus = ${JSON.stringify(corpus)}`
      }
      const browserContent = browserGuideContent(guideContent)
      manifestSnapshot = JSON.stringify(browserContent)
      return `export const guideManifest = ${JSON.stringify(browserContent.guideManifest)}
export const guideMetadata = ${JSON.stringify(browserContent.guideMetadata)}`
    },
    async handleHotUpdate({ file, server }) {
      if (!isGuideContentFile(root, file)) return

      const browserContent = browserGuideContent(guideContentForMode(
        await buildGuideContent(root),
        leaguesEnabled,
      ))
      const nextSnapshot = JSON.stringify(browserContent)
      if (!manifestSnapshot || nextSnapshot === manifestSnapshot) return

      manifestSnapshot = nextSnapshot
      const manifestModule = server.moduleGraph.getModuleById(RESOLVED_MANIFEST_ID)
      if (manifestModule) server.moduleGraph.invalidateModule(manifestModule)
      server.ws.send({ type: 'full-reload' })
      return []
    },
    async closeBundle() {
      const indexPath = path.join(outputDirectory, 'index.html')
      try {
        const baseHtml = await fs.readFile(indexPath, 'utf8')
        const { documents } = guideContentForMode(
          await buildGuideContent(root),
          leaguesEnabled,
        )
        const pages = [
          {
            path: '/',
            title: 'The RS Guide | Practical RuneScape Guides',
            cardTitle: 'The RS Guide',
            description: 'Practical RuneScape guides for combat, progression, setup, and account planning.',
            ogImage: openGraphImagePath('/'),
            ogImageAlt: 'The RS Guide homepage preview',
            generatedOgImage: true,
            section: 'The RS Guide',
            detail: 'Combat · Progression · Setup · Account planning',
            type: 'website',
            tags: ['RuneScape', 'RuneScape 3', 'Guides'],
          },
          ...documents.map(documentPageMetadata),
          {
            path: '/extras/player',
            title: 'Player Progression | The RS Guide',
            cardTitle: 'Player Progression',
            description: 'Compare a RuneScape profile with early, mid, and late game progression recommendations.',
            ogImage: openGraphImagePath('/extras/player'),
            ogImageAlt: 'RuneScape player progression preview',
            generatedOgImage: true,
            section: 'Player Tools',
            detail: 'Personalized early · mid · late game recommendations',
            type: 'website',
            tags: ['RuneScape', 'Player Progression'],
          },
        ]

        await Promise.all(pages.map(async (page) => {
          if (page.generatedOgImage) {
            await generateOpenGraphImage({
              root,
              outputDirectory: path.join(
                outputDirectory,
                page.ogImage.replace(/^\/+/, ''),
              ),
              title: page.cardTitle,
              description: page.description,
              section: page.section,
              detail: page.detail,
            })
          }
          const routeDirectory = path.join(outputDirectory, ...page.path.split('/').filter(Boolean))
          await fs.mkdir(routeDirectory, { recursive: true })
          const routeIndex = page.path === '/'
            ? indexPath
            : path.join(routeDirectory, 'index.html')
          await fs.writeFile(
            routeIndex,
            replaceMetadata(baseHtml, page, siteUrl),
          )
        }))
      } catch (error) {
        this.error(`Unable to generate route metadata: ${error instanceof Error ? error.message : error}`)
      }
    },
  }
}
