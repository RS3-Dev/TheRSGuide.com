import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import relicData from '@/data/leagues-ii/relics.json'
import regionSkillGradeData from '@/data/leagues-ii/region-skill-grades.json'
import { PICKS_STORAGE_KEY } from '@/lib/picks-state'
import {
  calculateSkillResults,
  type RegionSkillGrades,
  type Relic,
} from '@/lib/skill-coverage'
import {
  SkillingSolver,
} from '@/components/mdx/skilling-solver'
import { mdxComponents } from '@/mdx_components/mdx-components'
import { TooltipProvider } from '@/components/ui/tooltip'

const regionGrades = regionSkillGradeData.regions as RegionSkillGrades[]
const getRegions = (regionIds: string[]) =>
  regionGrades.filter(({ id }) => regionIds.includes(id))

describe('SkillingSolver', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses the best selected relic grade and only solves skills at A or S', () => {
    const selectedRelics = relicData.Relics.filter(({ name }) =>
      ['Divine Druid', 'Golden Touch'].includes(name),
    ) as Relic[]

    const results = calculateSkillResults(selectedRelics)

    expect(results.get('summoning')).toEqual({
      grade: 'A',
      isSolved: true,
      sourceName: 'Divine Druid',
    })
    expect(results.get('agility')).toEqual({
      grade: 'S',
      isSolved: true,
      sourceName: 'Golden Touch',
    })
    expect(results.get('divination')).toEqual({
      grade: 'B',
      isSolved: false,
      sourceName: 'Divine Druid',
    })
    expect(results.get('attack')).toEqual({
      grade: null,
      isSolved: false,
      sourceName: null,
    })
  })

  it('uses the best grade across guaranteed starting regions', () => {
    const regions = getRegions(['misthalin', 'havenhythe', 'karamja'])

    const results = calculateSkillResults([], regions)

    expect(results.get('cooking')).toEqual({
      grade: 'A',
      isSolved: true,
      sourceName: 'Misthalin',
    })
    expect(results.get('fishing')).toEqual({
      grade: 'A',
      isSolved: true,
      sourceName: 'Havenhythe',
    })
    expect(results.get('invention')).toEqual({
      grade: 'B',
      isSolved: false,
      sourceName: 'Misthalin',
    })
  })

  it('includes the revised optional-region grades', () => {
    const asgarniaResults = calculateSkillResults(
      [],
      getRegions(['asgarnia']),
    )
    const tirannwnResults = calculateSkillResults(
      [],
      getRegions(['tirannwn']),
    )
    const fremennikResults = calculateSkillResults(
      [],
      getRegions(['fremennik-providence']),
    )

    expect(asgarniaResults.get('slayer')).toMatchObject({
      grade: 'A',
      sourceName: 'Asgarnia',
    })
    expect(asgarniaResults.get('invention')).toMatchObject({
      grade: 'A',
      sourceName: 'Asgarnia',
    })
    expect(tirannwnResults.get('crafting')).toMatchObject({
      grade: 'B',
      sourceName: 'Tirannwn',
    })
    expect(fremennikResults.get('woodcutting')).toMatchObject({ grade: 'C' })
    expect(fremennikResults.get('firemaking')).toMatchObject({ grade: 'C' })
  })

  it('renders every skill with the guaranteed regions selected', () => {
    const markup = renderToStaticMarkup(
      <TooltipProvider>
        <SkillingSolver />
      </TooltipProvider>,
    )

    expect(markup).toMatch(/\d+ of \d+ skills solved/)
    expect(markup).toContain('Skill coverage')
    expect(markup).not.toContain('Route coverage')
    expect(markup).not.toContain('Reset all')
    expect(markup).not.toContain('Overall skill coverage')
    expect(markup.indexOf('Skill coverage')).toBeGreaterThan(
      markup.indexOf('Relic options by tier'),
    )
    expect(markup).toContain('Misthalin &amp; Havenhythe')
    expect(markup).toContain('Region outline picker map')
    expect(markup).toContain('Click the map to add or remove a region')
    expect(markup).toContain('Reset region picks')
    expect(markup).toContain('Tier 7')
    expect(markup).toContain('Animal Wrangler')
    expect(markup).toContain('Infernal Fire')
    expect(markup).toContain('Summoning')
    expect(markup).not.toContain('Speculative mode')
  })

  it('loads region and relic choices saved by the picker', () => {
    const storedState = JSON.stringify({
      buildName: 'Shared route',
      isSpeculativeRelics: true,
      selectedBlessings: { 1: 'a' },
      selectedRegionIds: [
        'misthalin-havenhythe',
        'karamja',
        'asgarnia',
      ],
      selectedRelics: { 1: '1b' },
    })
    vi.stubGlobal('window', {
      location: { href: 'http://localhost/leagues/skilling-solves' },
      localStorage: {
        getItem: (key: string) =>
          key === PICKS_STORAGE_KEY ? storedState : null,
      },
    })

    const markup = renderToStaticMarkup(
      <TooltipProvider>
        <SkillingSolver />
      </TooltipProvider>,
    )

    expect(markup).toContain('Asgarnia')
    expect(markup).toContain('Clue Connoisseur')
    expect(markup).toContain('Infernal Fire')
    expect(markup).toMatch(/aria-label="Tier 1, option B, Golden Touch:[^"]+" aria-pressed="true"/)
  })

  it('includes the Rejuvenated bonus relic in skill coverage', () => {
    const storedState = JSON.stringify({
      buildName: 'Rejuvenated route',
      isSpeculativeRelics: true,
      selectedBlessings: {},
      selectedRejuvenatedRelic: '2c',
      selectedRegionIds: ['misthalin-havenhythe', 'karamja'],
      selectedRelics: { 6: '6a' },
    })
    vi.stubGlobal('window', {
      location: { href: 'http://localhost/leagues/skilling-solves' },
      localStorage: {
        getItem: (key: string) =>
          key === PICKS_STORAGE_KEY ? storedState : null,
      },
    })

    const markup = renderToStaticMarkup(
      <TooltipProvider>
        <SkillingSolver />
      </TooltipProvider>,
    )

    expect(markup).toMatch(/aria-label="Tier 2, option C, Divine Druid, paired with Rejuvenated:[^"]+" aria-pressed="true"/)
  })

  it('is registered for use in MDX pages', () => {
    expect(mdxComponents.SkillingSolver).toBeDefined()
  })
})
