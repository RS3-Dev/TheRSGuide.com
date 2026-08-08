import { afterEach, describe, expect, it, vi } from 'vitest'

import { handlePlayerApi } from './player-api.mjs'
import { recordingResponse, responseJson } from './http-test-utils.mjs'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('player API', () => {
  it('rejects an empty username before making an upstream request', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const response = recordingResponse()

    await handlePlayerApi({ url: '/api/player/%20' }, response)

    expect(fetch).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    expect(responseJson(response)).toEqual({ error: 'Username is required' })
  })

  it('combines successful profile and quest responses', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ name: 'The RS Guy' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        quests: [{ title: 'The World Wakes', status: 'COMPLETED' }],
      })))
    vi.stubGlobal('fetch', fetch)
    const response = recordingResponse()

    await handlePlayerApi(
      { url: '/api/player/The%20RS%20Guy?source=test' },
      response,
    )

    expect(response.status).toBe(200)
    expect(responseJson(response)).toMatchObject({
      name: 'The RS Guy',
      quests: [{ title: 'The World Wakes', status: 'COMPLETED' }],
    })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('user=The%20RS%20Guy'),
      expect.objectContaining({ headers: { accept: 'application/json' } }),
    )
  })

  it('contains upstream failures behind a stable gateway response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const response = recordingResponse()

    await handlePlayerApi({ url: '/api/player/Player' }, response)

    expect(response.status).toBe(500)
    expect(responseJson(response)).toEqual({ error: 'Failed to fetch player data' })
  })
})
