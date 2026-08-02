import { describe, expect, it } from 'vitest'
import type { GuideNavNode, GuideSection } from './guide-catalog'
import { createGuideNavigationModel } from './guide-navigation'

const EmptyDocument = () => null
const document = (path: string) => ({
  path,
  title: path,
  navigationTitle: path,
  description: '',
  section: 'guides',
  tableOfContents: [],
  hasTableOfContents: false,
  showPageHeader: true,
  requiresPlayerData: false,
  ogImage: '',
  Component: EmptyDocument,
})
const node = (path: string, children: GuideNavNode[] = []): GuideNavNode => ({
  doc: document(path),
  label: path,
  children,
})
const sections: GuideSection[] = [{
  id: 'guides',
  label: 'Guides',
  path: '/guides',
  index: document('/guides'),
  documents: [],
  navigation: [
    node('/guides/melee', [
      node('/guides/melee/basic-abilities'),
      node('/guides/melee/advanced', [
        node('/guides/melee/advanced/rotation'),
      ]),
    ]),
    node('/guides/magic', [
      node('/guides/magic/basic-abilities'),
    ]),
  ],
}]

describe('guide navigation model', () => {
  it('projects active links and opens every collapsible ancestor', () => {
    const model = createGuideNavigationModel({
      sections,
      pathname: '/guides/melee/advanced/rotation',
      expanded: new Set(),
      flattened: false,
      syncActive: true,
    })

    expect([...model.expanded]).toEqual([
      '/guides',
      '/guides/melee',
      '/guides/melee/advanced',
    ])
    expect(model.sections[0]).toMatchObject({
      key: '/guides',
      open: true,
      flattened: false,
    })
    expect(model.sections[0].nodes[0]).toMatchObject({
      path: '/guides/melee',
      open: true,
    })
    expect(model.sections[0].nodes[0].children[0]).toMatchObject({
      path: '/guides/melee/basic-abilities',
      active: false,
    })
    expect(model.sections[0].nodes[0].children[1]).toMatchObject({
      path: '/guides/melee/advanced',
      open: true,
    })
    expect(model.sections[0].nodes[0].children[1].children[0]).toMatchObject({
      path: '/guides/melee/advanced/rotation',
      active: true,
    })
  })

  it('preserves user expansion while opening a newly active branch', () => {
    const current = new Set(['/guides', '/guides/magic'])
    const model = createGuideNavigationModel({
      sections,
      pathname: '/guides/melee/advanced/rotation',
      expanded: current,
      flattened: false,
      syncActive: true,
    })

    expect([...model.expanded]).toEqual([
      '/guides',
      '/guides/magic',
      '/guides/melee',
      '/guides/melee/advanced',
    ])
    expect([...current]).toEqual(['/guides', '/guides/magic'])
  })

  it('does not activate prefix collisions and projects flattened mode', () => {
    const model = createGuideNavigationModel({
      sections,
      pathname: '/guides/melee-other',
      expanded: new Set(),
      flattened: true,
      syncActive: true,
    })

    expect([...model.expanded]).toEqual(['/guides'])
    expect(model.sections[0].flattened).toBe(true)
    expect(model.sections[0].nodes[0].open).toBe(false)
    expect(model.sections[0].nodes[0].active).toBe(false)
  })
})
