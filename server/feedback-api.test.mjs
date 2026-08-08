import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleFeedbackApi, validateFeedbackPayload } from './feedback-api.mjs'
import { recordingResponse, responseJson } from './http-test-utils.mjs'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('feedback payload validation', () => {
  it('normalizes valid messages and page paths', () => {
    expect(validateFeedbackPayload({
      message: '  A useful suggestion  ',
      page: '/guides/skill-training?username=Player',
    })).toEqual({
      message: 'A useful suggestion',
      page: '/guides/skill-training?username=Player',
    })
  })

  it('requires a message', () => {
    expect(validateFeedbackPayload({ message: '   ' })).toEqual({
      error: 'Message is required',
    })
  })

  it('rejects messages longer than the Discord-safe limit', () => {
    expect(validateFeedbackPayload({ message: 'a'.repeat(1501) })).toEqual({
      error: 'Message must be 1500 characters or fewer',
    })
  })

  it('does not accept an external page URL', () => {
    expect(validateFeedbackPayload({
      message: 'Hello',
      page: 'https://example.com',
    })).toMatchObject({ page: '/' })
  })
})

describe('feedback HTTP boundary', () => {
  it('only accepts same-origin POST requests', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')

    const methodResponse = recordingResponse()
    await handleFeedbackApi({ method: 'GET', headers: {}, socket: {} }, methodResponse)

    expect(methodResponse.status).toBe(405)
    expect(methodResponse.headers.get('allow')).toBe('POST')
    expect(responseJson(methodResponse)).toEqual({ error: 'Method not allowed' })

    const originResponse = recordingResponse()
    await handleFeedbackApi({
      method: 'POST',
      headers: {
        host: 'thersguide.com',
        origin: 'https://example.com',
      },
      socket: { remoteAddress: 'feedback-origin-test' },
    }, originResponse)

    expect(originResponse.status).toBe(403)
    expect(responseJson(originResponse)).toEqual({ error: 'Request origin is not allowed' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
