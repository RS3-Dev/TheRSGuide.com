// @vitest-environment jsdom

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PlayerDataProvider } from './player-data-provider'
import { usePlayerData } from './player-data-context'
import { PlayerSearch } from '@/components/mdx/player-search'
import { platformPlayerAdapter } from '@/lib/platform-player-adapter'
import { browserPlayerStorage } from '@/lib/player-storage'
import type { PlayerProfile } from '@/lib/player-profile'

vi.mock('@/lib/platform-player-adapter', () => ({ platformPlayerAdapter: { load: vi.fn() } }))

const profile = (username: string, level = 99): PlayerProfile => ({
  username, totalLevel: level, skills: [{ name: 'Attack', level, xp: 1, rank: 1 }], quests: [],
})

function Guide() {
  const { playerData, getSkillLevel } = usePlayerData()
  return <>
    <PlayerSearch />
    <output aria-label="Loaded player">{playerData?.username ?? 'No player'}</output>
    <output aria-label="Attack level">{getSkillLevel('Attack') ?? 'Unknown'}</output>
    <Link to="/">Home</Link>
    <Link to="/guides/skill-training?username=GIM%20Chronic">Switch player</Link>
  </>
}

function App({ path = '/guides/skill-training?username=GIM%20Chronic' }: { path?: string }) {
  return <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/" element={<Link to="/guides/skill-training?username=GIM%20Chronic">Look up GIM Chronic</Link>} />
      <Route path="/guides/skill-training" element={<PlayerDataProvider><Guide /></PlayerDataProvider>} />
    </Routes>
  </MemoryRouter>
}

beforeEach(() => {
  vi.spyOn(browserPlayerStorage, 'loadLastSearch').mockReturnValue("I'm Josh J")
  vi.spyOn(browserPlayerStorage, 'saveLastSearch').mockImplementation(() => {})
  vi.mocked(platformPlayerAdapter.load).mockImplementation(async (username) => profile(username))
})
afterEach(() => { vi.restoreAllMocks(); vi.mocked(platformPlayerAdapter.load).mockReset() })

describe('player lookup navigation', () => {
  it('automatically loads the URL player rather than the previously saved player', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Loaded player')).toHaveTextContent('GIM Chronic'))
    expect(screen.getByPlaceholderText('Load your stats...')).toHaveValue('GIM Chronic')
    expect(platformPlayerAdapter.load).toHaveBeenCalledTimes(1)
    expect(platformPlayerAdapter.load).toHaveBeenCalledWith('GIM Chronic', expect.any(AbortSignal))
  })

  it('replaces the previous profile after returning through the homepage', async () => {
    render(<App path="/guides/skill-training" />)
    await waitFor(() => expect(screen.getByLabelText('Loaded player')).toHaveTextContent("I'm Josh J"))
    fireEvent.click(screen.getByRole('link', { name: 'Home' }))
    fireEvent.click(screen.getByRole('link', { name: 'Look up GIM Chronic' }))
    await waitFor(() => expect(screen.getByLabelText('Loaded player')).toHaveTextContent('GIM Chronic'))
    expect(screen.getByPlaceholderText('Load your stats...')).toHaveValue('GIM Chronic')
    expect(platformPlayerAdapter.load).toHaveBeenCalledTimes(2)
  })

  it('updates a mounted guide and clears old requirements while the new lookup is pending', async () => {
    render(<App path="/guides/skill-training" />)
    await waitFor(() => expect(screen.getByLabelText('Loaded player')).toHaveTextContent("I'm Josh J"))
    let resolve!: (value: PlayerProfile) => void
    vi.mocked(platformPlayerAdapter.load).mockImplementationOnce(() => new Promise((done) => { resolve = done }))
    fireEvent.click(screen.getByRole('link', { name: 'Switch player' }))
    await waitFor(() => expect(screen.getByLabelText('Loaded player')).toHaveTextContent('No player'))
    expect(screen.getByLabelText('Attack level')).toHaveTextContent('Unknown')
    expect(screen.getByPlaceholderText('Load your stats...')).toHaveValue('GIM Chronic')
    await act(async () => resolve(profile('GIM Chronic', 50)))
    expect(screen.getByLabelText('Loaded player')).toHaveTextContent('GIM Chronic')
    expect(screen.getByLabelText('Attack level')).toHaveTextContent('50')
  })
})
