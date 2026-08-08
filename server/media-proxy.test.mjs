import { afterEach, describe, expect, it, vi } from 'vitest'

import { handleMediaProxy } from './media-proxy.mjs'
import { recordingResponse } from './http-test-utils.mjs'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('media proxy', () => {
  it('rejects unsupported methods and paths without fetching', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const methodResponse = recordingResponse()
    await handleMediaProxy(
      { method: 'POST', url: '/media-proxy/leagues-2/relics/example.png' },
      methodResponse,
    )
    expect(methodResponse.status).toBe(405)
    expect(methodResponse.headers.get('allow')).toBe('GET')

    const pathResponse = recordingResponse()
    await handleMediaProxy(
      { method: 'GET', url: '/media-proxy/private/example.svg' },
      pathResponse,
    )
    expect(pathResponse.status).toBe(404)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns an allowed upstream image with cache headers', async () => {
    const image = new Uint8Array([1, 2, 3])
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(image, {
      headers: { 'content-type': 'image/webp' },
    })))
    const response = recordingResponse()

    await handleMediaProxy(
      { method: 'GET', url: '/media-proxy/leagues-2/relics/example.webp' },
      response,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/webp')
    expect(response.headers.get('cache-control')).toContain('max-age=86400')
    expect(Buffer.from(response.body)).toEqual(Buffer.from(image))
  })

  it('returns a stable response when the image service is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const response = recordingResponse()

    await handleMediaProxy(
      { method: 'GET', url: '/media-proxy/leagues-2/relics/example.png' },
      response,
    )

    expect(response.status).toBe(502)
    expect(response.body).toBe('Image service unavailable')
  })
})
