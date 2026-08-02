import { describe, expect, it } from 'vitest'
import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  readConsent,
} from '@/lib/privacy-preferences'

const consentCookie = (preferences: object) =>
  `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(preferences))}`

describe('privacy preferences', () => {
  it('reads current granular consent preferences', () => {
    const preferences = {
      version: CONSENT_VERSION,
      analytics: false,
      functional: true,
      updatedAt: '2026-07-26T00:00:00.000Z',
    }

    expect(readConsent(`other=value; ${consentCookie(preferences)}`)).toEqual(preferences)
  })

  it('rejects legacy consent that did not include a functional-storage choice', () => {
    expect(readConsent(consentCookie({
      version: 1,
      analytics: true,
      updatedAt: '2026-07-25T00:00:00.000Z',
    }))).toBeNull()
  })

  it('keeps a previous analytics opt-out', () => {
    expect(readConsent(consentCookie({
      version: 4,
      analytics: false,
      functional: true,
      updatedAt: '2026-07-25T00:00:00.000Z',
    }))).toEqual({
      version: CONSENT_VERSION,
      analytics: false,
      functional: true,
      updatedAt: '2026-07-25T00:00:00.000Z',
    })
  })

  it('enables private traffic counts when migrating aggregate-only settings', () => {
    expect(readConsent(consentCookie({
      version: 5,
      functional: false,
      updatedAt: '2026-07-25T00:00:00.000Z',
    }))).toEqual({
      version: CONSENT_VERSION,
      analytics: true,
      functional: false,
      updatedAt: '2026-07-25T00:00:00.000Z',
    })
  })

  it('rejects consent from before functional storage had its own choice', () => {
    expect(readConsent(consentCookie({
      version: 2,
      analytics: true,
      functional: true,
      updatedAt: '2026-07-25T00:00:00.000Z',
    }))).toBeNull()
  })

  it('rejects malformed consent values', () => {
    expect(readConsent(`${CONSENT_COOKIE}=not-json`)).toBeNull()
  })
})
