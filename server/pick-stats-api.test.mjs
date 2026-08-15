import { afterEach, describe, expect, it, vi } from 'vitest'

import { recordingResponse, responseJson } from './http-test-utils.mjs'
import { handlePickStatsApi } from './pick-stats-api.mjs'

afterEach(() => {
  vi.unstubAllGlobals()
})
describe('pick statistics API', () => {
  it('rejects invalid paths and non-GET methods before proxying', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const pathResponse = recordingResponse()
    await handlePickStatsApi(
      { method: 'GET', url: '/api/pick-stats/extra' },
      pathResponse,
    )
    expect(pathResponse.status).toBe(404)

    const methodResponse = recordingResponse()
    await handlePickStatsApi(
      { method: 'POST', url: '/api/pick-stats' },
      methodResponse,
    )
    expect(methodResponse.status).toBe(405)
    expect(methodResponse.headers.get('allow')).toBe('GET')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('preserves the upstream snapshot and cache headers', async () => {
    const upstreamBody = JSON.stringify({ totalBuilds: 4615 })
    const fetch = vi.fn().mockResolvedValue(new Response(upstreamBody, {
      headers: {
        'cache-control': 'public, max-age=300, s-maxage=3600',
        'content-type': 'application/json',
      },
    }))
    vi.stubGlobal('fetch', fetch)
    const response = recordingResponse()

    await handlePickStatsApi(
      { method: 'GET', url: '/api/pick-stats' },
      response,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=300, s-maxage=3600',
    )
    expect(responseJson(response)).toEqual({ totalBuilds: 4615 })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/pick-stats$/),
      {
        headers: { accept: 'application/json' },
        method: 'GET',
      },
    )
  })

  it('contains upstream failures behind a gateway response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const response = recordingResponse()

    await handlePickStatsApi(
      { method: 'GET', url: '/api/pick-stats' },
      response,
    )

    expect(response.status).toBe(502)
    expect(responseJson(response)).toEqual({
      error: 'Pick statistics are unavailable',
    })
  })
})
