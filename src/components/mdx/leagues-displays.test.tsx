import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { BlessingDisplay } from '@/components/mdx/blessing-display'
import { RelicDisplay } from '@/components/mdx/relic-display'
import { mdxComponents } from '@/mdx_components/mdx-components'
import blessingData from '@/data/leagues-ii/blessings.json'
import relicData from '@/data/leagues-ii/relics.json'

describe('Leagues MDX displays', () => {
  it('renders confirmed relic data with an optional point requirement', () => {
    const confirmed = relicData.Relics.find((relic) => relic.tier > 0)
    expect(confirmed).toBeDefined()
    const markup = renderToStaticMarkup(
      <RelicDisplay tier={confirmed!.tier} points={10} />,
    )

    expect(markup).toContain(`Tier ${confirmed!.tier}`)
    expect(markup).toContain('10 points')
    expect(markup).toContain(confirmed!.name)
    expect(markup).toContain('View Details')
    expect(markup).not.toContain('undefined')
  })

  it('renders a useful fallback for a relic tier without choices', () => {
    const markup = renderToStaticMarkup(
      <RelicDisplay tier={Number.MAX_SAFE_INTEGER} points={0} />,
    )

    expect(markup).toContain('Relics have not been confirmed')
    expect(markup).not.toContain('undefined')
  })

  it('renders confirmed blessing data with an optional task requirement', () => {
    const confirmed = blessingData.Blessings.find((blessing) => blessing.tier > 0)
    expect(confirmed).toBeDefined()
    const markup = renderToStaticMarkup(
      <BlessingDisplay tier={confirmed!.tier} tasks={10} />,
    )

    expect(markup).toContain(`Tier ${confirmed!.tier}`)
    expect(markup).toContain('10 tasks')
    expect(markup).toContain(confirmed!.name)
    expect(markup).toContain('View Details')
    expect(markup).not.toContain('undefined')
  })

  it('renders a useful fallback for a blessing tier without choices', () => {
    const markup = renderToStaticMarkup(
      <BlessingDisplay tier={Number.MAX_SAFE_INTEGER} tasks={0} />,
    )

    expect(markup).toContain('Blessings have not been confirmed')
    expect(markup).not.toContain('undefined')
  })

  it('registers the Leagues displays through the MDX registry', () => {
    expect(mdxComponents.RelicDisplay).toBeDefined()
    expect(mdxComponents.BlessingDisplay).toBeDefined()
    expect(mdxComponents.StaticRelicPicks).toBeDefined()
    expect(mdxComponents.StaticBlessingPicks).toBeDefined()
  })
})
