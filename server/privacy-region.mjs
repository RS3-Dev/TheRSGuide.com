const STRICT_PRIVACY_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR',
  'GR', 'HU', 'IE', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO',
  'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'GB',
])

const firstHeaderValue = (value) => {
  const header = Array.isArray(value) ? value[0] : value
  return header?.split(',')[0]?.trim().toUpperCase() ?? ''
}

export const privacyRegionFromCountry = (country) => {
  const normalizedCountry = country?.trim().toUpperCase() ?? ''
  if (!/^[A-Z]{2}$/.test(normalizedCountry) || normalizedCountry === 'XX') {
    return 'strict'
  }
  return STRICT_PRIVACY_COUNTRIES.has(normalizedCountry) ? 'strict' : 'standard'
}

export const privacyRegionFromHeaders = (headers) =>
  privacyRegionFromCountry(firstHeaderValue(headers['cf-ipcountry']))

export const rewritePrivacyRegion = (html, region) =>
  html.replace(
    /(<meta name="rs-guide-privacy-region" content=")[^"]*("\s*\/>)/,
    `$1${region}$2`,
  )

export { STRICT_PRIVACY_COUNTRIES }
