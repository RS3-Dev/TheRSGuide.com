import { describe, expect, it } from 'vitest'
import { createGuideCatalog, type GuideDocumentSource } from './guide-catalog'

const EmptyDocument = () => null

const pathFromSource = (sourcePath: string) =>
  `/${sourcePath.replaceAll('\\', '/').replace(/^.*\/content\//, '').replace(/\.mdx$/, '').replace(/\/index$/, '')}`

const document = (
  sourcePath: string,
  title: string,
  description = '',
  content = `${title} content`,
): GuideDocumentSource => ({
  sourcePath,
  path: pathFromSource(sourcePath),
  title,
  description,
  section: pathFromSource(sourcePath).split('/')[1],
  tableOfContents: [{
    id: `${content.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-0`,
    text: content,
    level: 2,
  }],
  hasTableOfContents: true,
  showPageHeader: true,
  requiresPlayerData: false,
  ogImage: '',
  Component: EmptyDocument,
})

const catalog = createGuideCatalog({
  documents: [
    document('../../content/guides/magic/basic-abilities.mdx', 'Magic Basic Abilities'),
    document('../../content/guides/melee/basic-abilities.mdx', 'Melee Basic Abilities'),
    document('../../content/guides/magic/index.mdx', 'Magic Abilities Guide'),
    document('../../content/guides/index.mdx', 'Guides'),
    document('../../content/guides/melee/index.mdx', 'Melee Abilities Guide'),
  ],
  metadata: [
    { sourcePath: '../../content/guides/meta.json', pages: ['index', 'melee', 'magic'] },
    { sourcePath: '../../content/guides/melee/meta.json', pages: ['index', 'basic-abilities'] },
    { sourcePath: '../../content/guides/magic/meta.json', pages: ['index', 'basic-abilities'] },
  ],
  sections: [{ id: 'guides', label: 'Guides' }],
})

describe('GuideCatalog', () => {
  it('owns deterministic depth-first navigation order and adjacency', () => {
    const section = catalog.section('guides')

    expect(section?.documents.map((item) => item.path)).toEqual([
      '/guides',
      '/guides/melee',
      '/guides/melee/basic-abilities',
      '/guides/magic',
      '/guides/magic/basic-abilities',
    ])
    expect(section?.navigation.map((node) => ({
      path: node.doc.path,
      children: node.children.map((child) => child.doc.path),
    }))).toEqual([
      { path: '/guides/melee', children: ['/guides/melee/basic-abilities'] },
      { path: '/guides/magic', children: ['/guides/magic/basic-abilities'] },
    ])

    expect(catalog.adjacent(catalog.get('/guides/melee')!)).toEqual({
      previous: catalog.get('/guides'),
      next: catalog.get('/guides/melee/basic-abilities'),
    })
  })

  it('owns breadcrumb labels and normalizes trailing slashes', () => {
    expect(catalog.get('/guides/melee/basic-abilities/')).toBe(
      catalog.get('/guides/melee/basic-abilities'),
    )
    expect(catalog.breadcrumbs('/guides/melee/basic-abilities')).toEqual([
      { path: '/guides', label: 'Guides', current: false },
      { path: '/guides/melee', label: 'Melee', current: false },
      { path: '/guides/melee/basic-abilities', label: 'Melee Basic Abilities', current: true },
    ])
  })

  it('uses the configured route section label instead of the section index title', () => {
    const gettingStartedCatalog = createGuideCatalog({
      documents: [
        document('../../content/getting-started/index.mdx', 'Keybinds'),
        document('../../content/getting-started/damage.mdx', 'Damage'),
      ],
      metadata: [{
        sourcePath: '../../content/getting-started/meta.json',
        pages: ['index', 'damage'],
      }],
      sections: [{ id: 'getting-started', label: 'Getting Started' }],
    })

    expect(gettingStartedCatalog.breadcrumbs('/getting-started/damage')).toEqual([
      { path: '/getting-started', label: 'Getting Started', current: false },
      { path: '/getting-started/damage', label: 'Damage', current: true },
    ])
  })

  it('precomputes the table of contents before a lazy guide component loads', () => {
    const guide = catalog.get('/guides/melee/basic-abilities')!

    expect(guide.hasTableOfContents).toBe(true)
    expect(guide.tableOfContents).toEqual([{
      id: 'melee-basic-abilities-content-0',
      text: 'Melee Basic Abilities content',
      level: 2,
    }])
  })

  it('allows component-driven pages to reserve a table-of-contents column', () => {
    const componentCatalog = createGuideCatalog({
      documents: [{
        sourcePath: '../../content/guides/skill-training.mdx',
        path: '/guides/skill-training',
        title: 'Skill Training',
        description: '',
        section: 'guides',
        tableOfContents: [],
        hasTableOfContents: true,
        showPageHeader: true,
        requiresPlayerData: true,
        ogImage: '',
        Component: EmptyDocument,
      }],
      metadata: [],
      sections: [{ id: 'guides', label: 'Guides' }],
    })

    expect(componentCatalog.get('/guides/skill-training')).toMatchObject({
      hasTableOfContents: true,
      tableOfContents: [],
      requiresPlayerData: true,
    })
  })

  it('excludes pages disabled by section metadata', () => {
    const disabledPageCatalog = createGuideCatalog({
      documents: [
        document('../../content/guides/index.mdx', 'Guides'),
        document('../../content/guides/similarities.mdx', 'Similarities'),
        document('../../content/guides/differences.mdx', 'Differences'),
      ],
      metadata: [{
        sourcePath: '../../content/guides/meta.json',
        pages: ['index', 'differences'],
        disabledPages: ['similarities'],
      }],
      sections: [{ id: 'guides', label: 'Guides' }],
    })

    expect(disabledPageCatalog.get('/guides/similarities')).toBeUndefined()
    expect(disabledPageCatalog.section('guides')?.documents.map((item) => item.path)).toEqual([
      '/guides',
      '/guides/differences',
    ])
  })

  it('rejects duplicate route identities', () => {
    expect(() => createGuideCatalog({
      documents: [
        document('../../content/guides/duplicate.mdx', 'First'),
        document('C:\\copy\\content\\guides\\duplicate.mdx', 'Second'),
      ],
      metadata: [],
      sections: [{ id: 'guides', label: 'Guides' }],
    })).toThrow('Duplicate guide route: /guides/duplicate')
  })
})
