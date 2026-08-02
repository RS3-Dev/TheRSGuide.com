import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { BlessingDisplay } from '@/components/mdx/blessing-display'
import { RelicDisplay } from '@/components/mdx/relic-display'
import { mdxComponents } from '@/mdx_components/mdx-components'

describe('Leagues MDX displays', () => {
  it('renders confirmed relic data and an optional point requirement', () => {
    const markup = renderToStaticMarkup(<RelicDisplay tier={1} points={10} />)

    expect(markup).toContain('Tier 1')
    expect(markup).toContain('10 points')
    expect(markup).toContain('Survivalist')
    expect(markup).toContain('View details')
  })

  it('renders passives for relic tiers whose choices are not yet confirmed', () => {
    const markup = renderToStaticMarkup(<RelicDisplay tier={2} points={0} />)
    const passive = 'Experience is scaled at 8x the normal rate.'

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
  })
})
