const RYBBIT_ANALYTICS_ENDPOINT = "https://analytics.distortion.me/api/track"
const RYBBIT_SITE_ID = "d8c35c481bf4"
const TRACKED_HOSTNAMES = new Set(["thersguide.com", "www.thersguide.com"])
const LEGACY_RYBBIT_SCRIPT_ID = "rybbit-analytics"
const LEGACY_RYBBIT_STORAGE_KEYS = [
  "disable-rybbit",
  "rybbit-visitor-id",
  "rybbit-user-id",
  "rybbit-replay-sampled",
] as const

type AnonymousPageviewPayload = {
  site_id: string
  hostname: string
  pathname: "/"
  querystring: ""
  type: "pageview"
}

declare global {
  interface Window {
    rybbit?: {
      cleanup?: () => void
      stopSessionReplay?: () => void
    }
  }
}

let lastNavigationKey: string | null = null

function createAnonymousPageviewPayload(hostname: string): AnonymousPageviewPayload {
  return {
    site_id: RYBBIT_SITE_ID,
    hostname,
    pathname: "/",
    querystring: "",
    type: "pageview",
  }
}

function clearLegacyAnalyticsStorage() {
  window.rybbit?.stopSessionReplay?.()
  window.rybbit?.cleanup?.()
  document.getElementById(LEGACY_RYBBIT_SCRIPT_ID)?.remove()

  for (const key of LEGACY_RYBBIT_STORAGE_KEYS) {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  }
}

function trackAnonymousPageview(navigationKey: string, enabled = true) {
  if (!enabled) return

  const hostname = window.location.hostname.toLowerCase()
  if (!TRACKED_HOSTNAMES.has(hostname)) return
  if (navigationKey === lastNavigationKey) return
  lastNavigationKey = navigationKey

  void fetch(RYBBIT_ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createAnonymousPageviewPayload(hostname)),
    mode: "cors",
    credentials: "omit",
    keepalive: true,
    referrerPolicy: "no-referrer",
  }).catch(() => {
    // Analytics must never interfere with the guide.
  })
}

export {
  clearLegacyAnalyticsStorage,
  createAnonymousPageviewPayload,
  LEGACY_RYBBIT_STORAGE_KEYS,
  RYBBIT_ANALYTICS_ENDPOINT,
  RYBBIT_SITE_ID,
  trackAnonymousPageview,
}
