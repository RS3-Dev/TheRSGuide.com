// @vitest-environment jsdom

import { render, screen, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { TooltipProvider } from '@/components/ui/tooltip'

import { StaticBlessingPicks } from './static-blessing-picks'
import { StaticRelicPicks } from './static-relic-picks'

function renderWithTooltipProvider(component: ReactElement) {
  return render(<TooltipProvider>{component}</TooltipProvider>)
}

describe('static Leagues picks', () => {
  it('shows only the configured relic path in a compact grid', () => {
    renderWithTooltipProvider(
      <StaticRelicPicks
        picks={{
          1: 'Endless Harvest',
          2: 'Superheated',
          3: 'Voidwalker',
          4: 'Crystal Grace',
          5: 'Devout',
          6: 'Rejuvenated',
          7: 'Infernal Fire',
        }}
        rejuvenatedRelic="Assassin's Insight"
      />,
    )

    const relicGrid = screen.getByRole('list', {
      name: 'Recommended relic path picks',
    })
    expect(within(relicGrid).getAllByRole('listitem')).toHaveLength(8)
    expect(
      within(relicGrid).getByRole('button', {
        name: /Tier 1, Endless Harvest, selected/,
      }),
    ).toBeInTheDocument()
    expect(
      within(relicGrid).getByRole('button', {
        name: /Assassin's Insight, selected as the Rejuvenated bonus relic/,
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Reset relic picks'),
    ).not.toBeInTheDocument()
  })

  it('derives God Tier blessings and shows only the eight selected picks', () => {
    renderWithTooltipProvider(
      <StaticBlessingPicks
        picks={{
          1: 'Order',
          2: 'Chaos',
          3: 'Balance',
          5: 'Order',
          6: 'Chaos',
          7: 'Balance',
        }}
      />,
    )

    const blessingGrid = screen.getByRole('list', {
      name: 'Recommended blessing path picks',
    })
    expect(within(blessingGrid).getAllByRole('listitem')).toHaveLength(8)
    expect(
      within(blessingGrid).getByRole('button', {
        name: /God Tier 4, Splash Zone, selected/,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Reset blessing tree')).not.toBeInTheDocument()
  })
})
