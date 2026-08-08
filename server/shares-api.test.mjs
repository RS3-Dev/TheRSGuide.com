import { afterEach, describe, expect, it, vi } from 'vitest'

import { handleSharesApi } from './shares-api.mjs'
import { recordingResponse, responseJson } from './http-test-utils.mjs'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('shares API', () => {
  it('rejects invalid paths and methods before proxying', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const pathResponse = recordingResponse()
    await handleSharesApi(
      { headers: {}, method: 'GET', url: '/api/shares/not-valid!' },
      pathResponse,
    )
    expect(pathResponse.status).toBe(404)

    const methodResponse = recordingResponse()
    await handleSharesApi(
      { headers: {}, method: 'DELETE', url: '/api/shares' },
      methodResponse,
    )
    expect(methodResponse.status).toBe(405)
    expect(methodResponse.headers.get('allow')).toBe('GET, POST')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('preserves successful upstream status, content, and caching', async () => {
    const upstreamBody = JSON.stringify({ share: { code: 'abcdefghij' } })
    const fetch = vi.fn().mockResolvedValue(new Response(upstreamBody, {
      headers: {
        'cache-control': 'public, max-age=60',
        'content-type': 'application/json',
      },
      status: 201,
    }))
    vi.stubGlobal('fetch', fetch)
    const response = recordingResponse()

    await handleSharesApi(
      { headers: {}, method: 'GET', url: '/api/shares/abcdefghij' },
      response,
    )

    expect(response.status).toBe(201)
    expect(response.headers.get('cache-control')).toBe('public, max-age=60')
    expect(responseJson(response)).toEqual({ share: { code: 'abcdefghij' } })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/shares\/abcdefghij$/),
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('contains upstream failures behind a gateway response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const response = recordingResponse()

    await handleSharesApi(
      { headers: {}, method: 'GET', url: '/api/shares/abcdefghij' },
      response,
    )

    expect(response.status).toBe(502)
    expect(responseJson(response)).toEqual({
      error: 'The share service is unavailable',
    })
  })
})
