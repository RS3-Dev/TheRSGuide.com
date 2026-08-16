// @vitest-environment jsdom

import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getPickStats } from '@/lib/pick-stats-api'
import PickStatsPage from './pick-stats'

vi.mock('@/lib/pick-stats-api', () => ({
  getPickStats: vi.fn(),
}))

const stats = {
  version: 3 as const,
  generatedAt: '2026-08-15T21:00:00.000Z',
  windowStart: '2026-08-08T07:00:00.000Z',
  totalBuilds: 100,
  relics: [
    { id: '1a', tier: 1, count: 25, percentage: 25 },
    { id: '1b', tier: 1, count: 75, percentage: 75 },
    { id: '2a', tier: 2, count: 75, percentage: 75 },
    { id: '3a', tier: 3, count: 75, percentage: 75 },
    { id: '4a', tier: 4, count: 75, percentage: 75 },
    { id: '5a', tier: 5, count: 75, percentage: 75 },
    { id: '6a', tier: 6, count: 75, percentage: 75 },
    { id: '6b', tier: 6, count: 25, percentage: 25 },
    { id: '7a', tier: 7, count: 75, percentage: 75 },
  ],
  blessings: [
    { id: 'a' as const, tier: 1, derived: false, count: 80, percentage: 80 },
    { id: 'b' as const, tier: 4, derived: true, count: 20, percentage: 20 },
  ],
  regions: [
    { id: 'karamja', count: 100, percentage: 100 },
    { id: 'misthalin-havenhythe', count: 100, percentage: 100 },
    { id: 'anachronia', count: 70, percentage: 70 },
  ],
}

describe('PickStatsPage', () => {
  beforeEach(() => {
    vi.mocked(getPickStats).mockResolvedValue(stats)
  })

  it('renders popular picks above the detailed statistics tables', async () => {
    render(<PickStatsPage />)

    expect(screen.getByLabelText('Loading pick statistics')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Most popular picks' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Relics' })).toHaveLength(2)
    expect(screen.getAllByRole('heading', { name: 'Blessings' })).toHaveLength(2)
    expect(screen.getAllByRole('heading', { name: 'Regions' })).toHaveLength(2)
    expect(
      screen.queryByRole('heading', { name: 'Rejuvenated bonus relics' }),
    ).not.toBeInTheDocument()
    const relicPath = screen.getByRole('list', {
      name: 'Most popular relic path picks',
    })
    const relicSlots = within(relicPath).getAllByRole('listitem')
    expect(relicSlots).toHaveLength(7)
    expect(within(relicPath).queryByText(/Bonus:/)).not.toBeInTheDocument()
    expect(within(relicPath).getByText('Golden Touch')).toBeInTheDocument()
    expect(screen.getAllByText('Endless Harvest').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Teragard.+Aegis/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Anachronia/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Karamja/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Misthalin/)).not.toBeInTheDocument()
    expect(screen.getByText(/Based on 100 shared builds/)).toBeInTheDocument()
  })

  it('shows a contained error state when the snapshot cannot be loaded', async () => {
    vi.mocked(getPickStats).mockRejectedValue(new Error('Service unavailable'))

    render(<PickStatsPage />)

    expect(
      await screen.findByText('Pick statistics are unavailable'),
    ).toBeInTheDocument()
    expect(screen.getByText('Service unavailable')).toBeInTheDocument()
  })
})
