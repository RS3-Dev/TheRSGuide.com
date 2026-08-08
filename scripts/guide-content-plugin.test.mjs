import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buildGuideContent,
  documentPageMetadata,
  guideContentForMode,
  metadataHtml,
} from './guide-content-plugin.mjs'

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) =>
    fs.rm(directory, { recursive: true, force: true })
  ))
})

async function fixtureContent() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'rs-guide-content-'))
  temporaryDirectories.push(root)
  const guidesDirectory = path.join(root, 'content', 'guides')
  const leaguesDirectory = path.join(root, 'content', 'leagues')
  await fs.mkdir(guidesDirectory, { recursive: true })
  await fs.mkdir(leaguesDirectory, { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(guidesDirectory, 'index.mdx'), `---
title: Fixture Guide
navigationTitle: Fixture Navigation
description: A fixture guide used to verify manifest behavior.
header: false
---
## First heading

Searchable fixture prose.

<PlayerSearch />

### Second heading
`),
    fs.writeFile(path.join(guidesDirectory, 'meta.json'), JSON.stringify({
      pages: ['index'],
    })),
    fs.writeFile(path.join(leaguesDirectory, 'index.mdx'), `---
title: Fixture League
description: A fixture League guide.
---
League content.
`),
    fs.writeFile(path.join(leaguesDirectory, 'meta.json'), JSON.stringify({
      pages: ['index'],
    })),
  ])
  return buildGuideContent(root)
}

describe('guide content build manifest', () => {
  it('precomputes route behavior from frontmatter and MDX', async () => {
    const { documents, metadata } = await fixtureContent()

    expect(documents.find((document) => document.path === '/guides')).toMatchObject({
      title: 'Fixture Guide',
      navigationTitle: 'Fixture Navigation',
      requiresPlayerData: true,
      hasTableOfContents: true,
      showPageHeader: false,
      ogImage: '/og/guides.png',
      ogImageAlt: 'Fixture Guide guide preview',
      socialSection: 'RuneScape Guides',
      searchText: expect.stringContaining('Searchable fixture prose'),
    })
    expect(metadata).toEqual([
      { sourcePath: '../../content/guides/meta.json', pages: ['index'] },
      { sourcePath: '../../content/leagues/meta.json', pages: ['index'] },
    ])
  })

  it('renders complete social metadata for guide links', () => {
    const html = metadataHtml({
      path: '/guides/mid-game/invention',
      title: 'Invention | The RS Guide',
      description: 'The elite skill that enhances your gear with powerful perks',
      ogImage: '/og/guides-mid-game-invention.png',
      ogImageAlt: 'Invention guide preview',
      generatedOgImage: true,
      section: 'Mid Game',
      type: 'article',
      tags: ['RuneScape', 'Mid Game', 'Guide'],
    }, 'https://thersguide.com')

    expect(html).toContain('property="og:image:width" content="1200"')
    expect(html).toContain('property="og:image:alt" content="Invention guide preview"')
    expect(html).toContain('property="article:section" content="Mid Game"')
    expect(html).toContain('property="article:tag" content="RuneScape"')
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
  })

  it('creates fallback preview metadata when a description is omitted', () => {
    expect(documentPageMetadata({
      path: '/fixture',
      title: 'Fixture',
      ogImage: '/fixture.png',
      ogImageAlt: 'Fixture preview',
      generatedOgImage: true,
      socialSection: 'Fixtures',
      socialDetail: 'Fixture detail',
    })).toMatchObject({
      path: '/fixture',
      title: 'Fixture | The RS Guide',
      cardTitle: 'Fixture',
      description: 'Read Fixture on The RS Guide.',
      type: 'article',
      section: 'Fixtures',
    })
  })

  it('excludes Leagues documents and metadata outside Leagues mode', async () => {
    const content = await fixtureContent()
    const normalContent = guideContentForMode(content, false)
    const leaguesContent = guideContentForMode(content, true)

    expect(normalContent.documents.some((document) => document.section === 'leagues')).toBe(false)
    expect(normalContent.metadata.some((entry) => entry.sourcePath.includes('/leagues/'))).toBe(false)
    expect(leaguesContent.documents.some((document) => document.section === 'leagues')).toBe(true)
  })

})
