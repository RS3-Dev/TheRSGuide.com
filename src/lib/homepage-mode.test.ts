import { describe, expect, it } from 'vitest'
import {
  homepagePrimaryLinks,
  isGuideSectionEnabled,
  resolveHomepageMode,
} from './homepage-mode'

describe('homepage mode', () => {
  it('defaults missing and unrecognized values to normal mode', () => {
    expect(resolveHomepageMode()).toBe('normal')
    expect(resolveHomepageMode('true')).toBe('normal')
    expect(resolveHomepageMode('seasonal')).toBe('normal')
  })

  it('accepts the leagues value without case or surrounding whitespace sensitivity', () => {
    expect(resolveHomepageMode('leagues')).toBe('leagues')
    expect(resolveHomepageMode('  LEAGUES  ')).toBe('leagues')
  })

  it('only includes the Leagues content section in Leagues mode', () => {
    expect(isGuideSectionEnabled('leagues', 'normal')).toBe(false)
    expect(isGuideSectionEnabled('leagues', 'leagues')).toBe(true)
    expect(isGuideSectionEnabled('guides', 'normal')).toBe(true)
  })

  it('highlights Guides and omits Leagues in normal mode', () => {
    const links = homepagePrimaryLinks('normal')

    expect(links.some((link) => link.to === '/leagues')).toBe(false)
    expect(links.filter((link) => link.highlighted).map((link) => link.to)).toEqual(['/guides'])
    expect(links.map(({ label, to }) => ({ label, to }))).toEqual([
      { label: 'Getting Started', to: '/start' },
      { label: 'Skill Training', to: '/guides/skill-training' },
      { label: 'Gear Progression', to: '/guides/gear-recommendations' },
      { label: 'Guides', to: '/guides' },
    ])
  })

  it('inserts and highlights Leagues in leagues mode', () => {
    const links = homepagePrimaryLinks('leagues')

    expect(links.some((link) => link.to === '/leagues')).toBe(true)
    expect(links.filter((link) => link.highlighted).map((link) => link.to)).toEqual(['/leagues'])
    expect(links.filter((link) => link.to !== '/leagues').map((link) => link.to)).toEqual(
      homepagePrimaryLinks('normal').map((link) => link.to),
    )
  })
})
