import {
  normalizeUsername,
  type PlayerProfile,
  type PlayerProfileAdapter,
} from '@/lib/player-profile'
import type { PlayerStorage } from '@/lib/player-storage'

export type PlayerControllerState = {
  playerData: PlayerProfile | null
  loading: boolean
  error: string | null
  lastSearch: string
}

type Listener = () => void

const initialState: PlayerControllerState = {
  playerData: null,
  loading: false,
  error: null,
  lastSearch: '',
}

export class PlayerController {
  readonly #adapter: PlayerProfileAdapter
  readonly #storage: PlayerStorage
  readonly #listeners = new Set<Listener>()

  #state = initialState
  #active = false
  #requestId = 0
  #abortController: AbortController | null = null

  constructor(adapter: PlayerProfileAdapter, storage: PlayerStorage) {
    this.#adapter = adapter
    this.#storage = storage
  }

  getSnapshot = () => this.#state

  subscribe = (listener: Listener) => {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  start = (requestedUsername = '') => {
    if (this.#active) return
    this.#active = true
    const lastSearch = this.#storage.loadLastSearch()
    if (lastSearch !== this.#state.lastSearch) {
      this.#update({ lastSearch })
    }
    const username = normalizeUsername(requestedUsername) || lastSearch
    if (username) void this.search(username)
  }

  stop = () => {
    this.#active = false
    this.#requestId += 1
    this.#abortController?.abort()
    this.#abortController = null
    if (this.#state.loading) this.#update({ loading: false })
  }

  search = async (username: string): Promise<PlayerProfile | null> => {
    const normalizedUsername = normalizeUsername(username)
    if (!normalizedUsername) return null

    const requestId = ++this.#requestId
    this.#abortController?.abort()
    const abortController = new AbortController()
    this.#abortController = abortController
    this.#update({ playerData: null, loading: true, error: null })

    try {
      const playerData = await this.#adapter.load(normalizedUsername, abortController.signal)
      if (requestId !== this.#requestId || abortController.signal.aborted) return null
      this.#storage.saveLastSearch(playerData.username)
      this.#update({
        playerData,
        lastSearch: playerData.username,
        loading: false,
        error: null,
      })
      return playerData
    } catch (error) {
      if (requestId !== this.#requestId || abortController.signal.aborted) return null
      this.#update({
        playerData: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    } finally {
      if (requestId === this.#requestId) this.#abortController = null
    }
  }

  #update(patch: Partial<PlayerControllerState>) {
    this.#state = { ...this.#state, ...patch }
    for (const listener of this.#listeners) listener()
  }
}
