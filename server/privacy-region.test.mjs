import { describe, expect, it } from 'vitest'
import {
  privacyRegionFromCountry,
  privacyRegionFromHeaders,
  rewritePrivacyRegion,
} from './privacy-region.mjs'

describe('privacy region', () => {
  it('requires opt-in in the EEA and United Kingdom', () => {
    expect(privacyRegionFromCountry('DE')).toBe('strict')
    expect(privacyRegionFromCountry('NO')).toBe('strict')
    expect(privacyRegionFromCountry('GB')).toBe('strict')
  })

  it('uses an opt-out model in other known countries', () => {
    expect(privacyRegionFromCountry('US')).toBe('standard')
    expect(privacyRegionFromCountry('CA')).toBe('standard')
    expect(privacyRegionFromCountry('CH')).toBe('standard')
  })

  it('fails closed when Cloudflare cannot determine a country', () => {
    expect(privacyRegionFromCountry('')).toBe('strict')
    expect(privacyRegionFromCountry('XX')).toBe('strict')
    expect(privacyRegionFromHeaders({})).toBe('strict')
  })

  it('reads the Cloudflare country header and rewrites the document flag', () => {
    const html = '<meta name="rs-guide-privacy-region" content="strict" />'
    expect(privacyRegionFromHeaders({ 'cf-ipcountry': 'us' })).toBe('standard')
    expect(rewritePrivacyRegion(html, 'standard')).toContain('content="standard"')
  })
})
