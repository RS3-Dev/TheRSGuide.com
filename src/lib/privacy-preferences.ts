import { readPrivacyRegion } from '@/lib/privacy-region'

export const CONSENT_COOKIE = 'rs-guide-consent'
export const CONSENT_VERSION = 6
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180

export type ConsentPreferences = {
  version: number
  analytics: boolean
  functional: boolean
  updatedAt: string
}

const FUNCTIONAL_STORAGE_KEYS = new Set([
  'home-background-video',
  'rs-guide-efficiency-guide',
  'rs-guide-recurring-activities',
  'rs3_player_search',
  'theme',
])
const FUNCTIONAL_STORAGE_PREFIXES = ['rs3-manual-progression:v1:']

export function readConsent(cookieSource = document.cookie): ConsentPreferences | null {
  const cookie = cookieSource
    .split('; ')
    .find((item) => item.startsWith(`${CONSENT_COOKIE}=`))

  if (!cookie) return null

  try {
    const parsed = JSON.parse(
      decodeURIComponent(cookie.split('=').slice(1).join('=')),
    ) as Record<string, unknown>
    const currentPreference = parsed.version === CONSENT_VERSION
      && typeof parsed.analytics === 'boolean'
      && typeof parsed.functional === 'boolean'
      && typeof parsed.updatedAt === 'string'

    if (currentPreference) {
      return {
        version: CONSENT_VERSION,
        analytics: parsed.analytics as boolean,
        functional: parsed.functional as boolean,
        updatedAt: parsed.updatedAt as string,
      }
    }

    const legacyPreference = (parsed.version === 3 || parsed.version === 4)
      && typeof parsed.analytics === 'boolean'
      && typeof parsed.functional === 'boolean'
      && typeof parsed.updatedAt === 'string'

    if (legacyPreference) {
      return {
        version: CONSENT_VERSION,
        analytics: parsed.analytics as boolean,
        functional: parsed.functional as boolean,
        updatedAt: parsed.updatedAt as string,
      }
    }

    const aggregateAnalyticsPreference = parsed.version === 5
      && typeof parsed.functional === 'boolean'
      && typeof parsed.updatedAt === 'string'

    return aggregateAnalyticsPreference
      ? {
          version: CONSENT_VERSION,
          analytics: true,
          functional: parsed.functional as boolean,
          updatedAt: parsed.updatedAt as string,
        }
      : null
  } catch {
    return null
  }
}

export function writeConsent({
  analytics,
  functional,
}: Pick<ConsentPreferences, 'analytics' | 'functional'>): ConsentPreferences {
  const preferences = {
    version: CONSENT_VERSION,
    analytics,
    functional,
    updatedAt: new Date().toISOString(),
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(preferences))}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`
  return preferences
}

export function functionalStorageAllowed() {
  if (typeof document === 'undefined') return false
  return readConsent()?.functional ?? readPrivacyRegion() === 'standard'
}

export const thirdPartyMediaAllowed = functionalStorageAllowed

export function clearFunctionalStorage() {
  if (typeof window === 'undefined') return

  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index)
    if (
      key
      && (
        FUNCTIONAL_STORAGE_KEYS.has(key)
        || FUNCTIONAL_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
      )
    ) {
      window.localStorage.removeItem(key)
    }
  }

  document.cookie = 'sidebar_state=; Path=/; Max-Age=0; SameSite=Lax'
}
