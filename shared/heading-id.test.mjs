import { describe, expect, it } from 'vitest'

import { createHeadingId, slugifyHeading } from './heading-id.js'

describe('heading IDs', () => {
  it('uses the heading slug without a positional suffix', () => {
    expect(slugifyHeading('Relaxed Necromancy')).toBe('relaxed-necromancy')
    expect(slugifyHeading('How does this work?')).toBe('how-does-this-work')
  })

  it('adds a suffix only when headings would otherwise have duplicate IDs', () => {
    const usedIds = new Set()

    expect(createHeadingId('Repeated heading', usedIds)).toBe('repeated-heading')
    expect(createHeadingId('Repeated heading', usedIds)).toBe('repeated-heading-2')
    expect(createHeadingId('Repeated heading', usedIds)).toBe('repeated-heading-3')
  })
})
