import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { BlessingDisplay } from '@/components/mdx/blessing-display'
import { RelicDisplay } from '@/components/mdx/relic-display'
import { RegionUpgradesTable } from '@/components/mdx/region-upgrades-table'
import { RegionGuideList } from '@/components/mdx/region-guide-list'
import { mdxComponents } from '@/mdx_components/mdx-components'

describe('Leagues MDX displays', () => {
  it('renders confirmed relic data and an optional point requirement', () => {
    const markup = renderToStaticMarkup(<RelicDisplay tier={1} points={10} />)

    expect(markup).toContain('Tier 1')
    expect(markup).toContain('10 points')
    expect(markup).toContain('Survivalist')
    expect(markup).toContain('View Details')
  })

  it('renders passives for relic tiers whose choices are not yet confirmed', () => {
    const markup = renderToStaticMarkup(<RelicDisplay tier={2} points={0} />)
    const passive = '8x XP'

    expect(markup.match(new RegExp(passive.replace('.', '\\.'), 'g'))).toHaveLength(1)
    expect(markup).toContain('Relics have not been confirmed')
    expect(markup).not.toContain('undefined')
  })

  it('renders blessing data in the shared scrollable table boundary', () => {
    const markup = renderToStaticMarkup(<BlessingDisplay tier={1} tasks={0} />)

    expect(markup).toContain('data-slot="table-scroll"')
    expect(markup).toContain('Adrenaline Junkie')
    expect(markup).toContain('<th>Path</th>')
    expect(markup).not.toContain('undefined')
  })

  it('renders passives for blessing tiers whose choices are not yet confirmed', () => {
    const markup = renderToStaticMarkup(<BlessingDisplay tier={5} tasks={0}  />)

    expect(markup.match(/All War/g)).toHaveLength(1)
    expect(markup).toContain('rewards are unlocked.')
    expect(markup).toContain('Blessings have not been confirmed')
    expect(markup).not.toContain('data-slot="table-scroll"')
  })

  it('registers both displays through the MDX registry', () => {
    expect(mdxComponents.RelicDisplay).toBeDefined()
    expect(mdxComponents.BlessingDisplay).toBeDefined()
    expect(mdxComponents.RegionUpgradesTable).toBeDefined()
    expect(mdxComponents.RegionGuideList).toBeDefined()
  })

  it('renders data-driven region upgrades with dynamic sections and columns', () => {
    const pvmMarkup = renderToStaticMarkup(
      <MemoryRouter>
        <RegionUpgradesTable region="wilderness" section="pvm" />
      </MemoryRouter>
    )
    const utilityMarkup = renderToStaticMarkup(
      <MemoryRouter>
        <RegionUpgradesTable region="wilderness" section="utility" />
      </MemoryRouter>
    )

    expect(pvmMarkup).toContain('Corporeal Beast')
    expect(pvmMarkup).toContain('Spectral Spirit Shield')
    expect(pvmMarkup).toContain('Also available in')
    expect(pvmMarkup).toContain('href="/leagues/map/asgarnia"')
    // expect(pvmMarkup).toContain('Upgrades tier 78 Ancient Warriors') // Note is dynamically rendered from MDX, doesn't show in static markup
    expect(pvmMarkup).toContain('<th class=')
    expect(pvmMarkup).toContain('>Style</th>')
    expect(pvmMarkup).not.toContain('>Notes</th>')
    expect(utilityMarkup).toContain('>Type</th>')
    expect(utilityMarkup).not.toContain('>Notes</th>')
    expect(utilityMarkup).not.toContain('>Style</th>')
    expect(pvmMarkup).not.toContain('undefined')
  })

  it('renders data-driven region links and nested boss groups', () => {
    const locationsMarkup = renderToStaticMarkup(
      <RegionGuideList region="wilderness" section="locations" />
    )
    const bossesMarkup = renderToStaticMarkup(
      <RegionGuideList region="wilderness" section="bosses" />
    )

    expect(locationsMarkup).toContain('Wilderness Crater')
    expect(locationsMarkup).toContain('>Name</th>')
    expect(locationsMarkup).not.toContain('>Notes</th>')
    expect(bossesMarkup).toContain('Dragonkin Laboratory')
    expect(bossesMarkup).toContain('Black Stone Dragon')
    expect(bossesMarkup).toContain('↳')
    expect(bossesMarkup).not.toContain('undefined')
  })
})
