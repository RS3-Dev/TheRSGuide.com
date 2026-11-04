import { describe, expect, it } from 'vitest'
import { PlayerController } from './player-controller'
import type { PlayerProfile, PlayerProfileAdapter } from './player-profile'
import type { PlayerStorage } from './player-storage'

const profile = (username: string): PlayerProfile => ({
  username,
  totalLevel: 1,
  skills: [],
  quests: [],
})

const memoryPlayerStorage = (lastSearch = ''): PlayerStorage => {
  let savedSearch = lastSearch
  const manual = new Map<string, ReadonlySet<string>>()
  return {
    loadLastSearch: () => savedSearch,
    saveLastSearch: (username) => { savedSearch = username },
    loadManualCompletions: (username) => manual.get(username) ?? new Set(),
    saveManualCompletions: (username, paths) => { manual.set(username, new Set(paths)) },
  }
}

describe('PlayerController', () => {
  it('loads an explicit player instead of the saved search on start', async () => {
    const loaded: string[] = []
    const controller = new PlayerController({
      load: async (username) => { loaded.push(username); return profile(username) },
    }, memoryPlayerStorage("I'm Josh J"))

    controller.start('GIM Chronic')
    await Promise.resolve()

    expect(loaded).toEqual(['GIM Chronic'])
    expect(controller.getSnapshot().playerData?.username).toBe('GIM Chronic')
  })

  it('clears previous player data while a new player is loading', async () => {
    const controller = new PlayerController({
      load: async (username) => profile(username),
    }, memoryPlayerStorage())
    await controller.search("I'm Josh J")

    const next = controller.search('GIM Chronic')
    expect(controller.getSnapshot()).toMatchObject({ playerData: null, loading: true })
    await next
    expect(controller.getSnapshot().playerData?.username).toBe('GIM Chronic')
  })

  it('keeps only the latest lookup result even when an adapter resolves out of order', async () => {
    const pending = new Map<string, (value: PlayerProfile) => void>()
    const adapter: PlayerProfileAdapter = {
      load: (username) => new Promise((resolve) => pending.set(username, resolve)),
    }
    const controller = new PlayerController(adapter, memoryPlayerStorage())

    const first = controller.search('first')
    const second = controller.search('second')
    pending.get('first')?.(profile('first'))
    await first
    expect(controller.getSnapshot().playerData).toBeNull()
    expect(controller.getSnapshot().loading).toBe(true)

    pending.get('second')?.(profile('Second'))
    await second
    expect(controller.getSnapshot()).toMatchObject({
      playerData: { username: 'Second' },
      lastSearch: 'Second',
      loading: false,
      error: null,
    })
  })

  it('hydrates and refreshes the last successful player on start', async () => {
    const adapter: PlayerProfileAdapter = {
      load: async (username) => profile(username),
    }
    const controller = new PlayerController(adapter, memoryPlayerStorage('Saved Player'))

    controller.start()
    await Promise.resolve()
    await Promise.resolve()

    expect(controller.getSnapshot()).toMatchObject({
      playerData: { username: 'Saved Player' },
      lastSearch: 'Saved Player',
      loading: false,
    })
  })

  it('contains adapter failures in stable controller state', async () => {
    const adapter: PlayerProfileAdapter = {
      load: async () => { throw new Error('Profile is private') },
    }
    const controller = new PlayerController(adapter, memoryPlayerStorage())

    await controller.search('private')

    expect(controller.getSnapshot()).toMatchObject({
      playerData: null,
      loading: false,
      error: 'Profile is private',
    })
  })
})
