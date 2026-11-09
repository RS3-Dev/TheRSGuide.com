import { describe, expect, it } from 'vitest'

import gearPieces from '@/data/gear-pieces.json'
import {
  buildGearStages,
  buildProgressionRows,
  findStageIndex,
  formatRequirement,
  gearByStyle,
  gearCategoriesMatch,
  gearImageUrl,
  gearStyles,
  pickRequirements,
  resolveGearPieces,
  unmetRequirements,
  upgradedSlots,
  wornGear,
  type ChoosePick,
  type GearPieces,
} from './gear-progression'

const allItems = gearStyles.flatMap(({ id: style }) =>
  (['training', 'pvm'] as const).flatMap((mode) =>
    (['weapons', 'armour'] as const).flatMap((track) =>
      gearByStyle[style][mode][track].map((item) => ({ style, mode, track, item }))
    )
  )
)

describe('gear piece mapping', () => {
  it('maps every recommendation to at least one item', () => {
    for (const { style, track, item } of allItems) {
      const pieces = resolveGearPieces(style, track, item)
      expect(pieces, `${style} ${track} ${item.name} T${item.tier}`).toBeDefined()
      expect(Object.keys(pieces ?? {}).length).toBeGreaterThan(0)
    }
  })

  it('keeps weapons in hand slots and armour in worn slots', () => {
    for (const { style, track, item } of allItems) {
      const slots = Object.keys(resolveGearPieces(style, track, item) ?? {})
      const allowed = track === 'weapons' ? ['main', 'offhand'] : ['head', 'body', 'legs', 'hands', 'feet']
      expect(slots.filter((slot) => !allowed.includes(slot)), item.name).toEqual([])
    }
  })

  it('has no mapping entries that the guide does not use', () => {
    const used = new Set(allItems.map(({ style, track, item }) =>
      resolveGearPieces(style, track, item)
    ))
    for (const track of ['weapons', 'armour'] as const) {
      for (const [key, pieces] of Object.entries(gearPieces[track] as Record<string, GearPieces>)) {
        expect(used.has(pieces), key).toBe(true)
      }
    }
  })

  it('uses a distinct item for each tier of tiered necromancy gear', () => {
    const configFor = (tier: number) =>
      resolveGearPieces('necromancy', 'weapons', { name: 'Death Guard + Skull Lantern', tier })?.main?.config
    expect(configFor(20)).toBe('NECRO_UNDERWORLD_ARMGUARD_T20')
    expect(configFor(90)).toBe('NECRO_UNDERWORLD_ARMGUARD_T90')
  })

  it('uses the style variant of hybrid weapons', () => {
    const item = { name: 'Vanquish', tier: 75 }
    expect(resolveGearPieces('melee', 'weapons', item)?.main?.config).toBe('QPS_REWARD_WEAPON_MELEE')
    expect(resolveGearPieces('magic', 'weapons', item)?.main?.config).toBe('QPS_REWARD_WEAPON_MAGIC')
  })

  it('leaves slots empty when a set has no piece for them', () => {
    const sirenic = resolveGearPieces('ranged', 'armour', { name: 'Sirenic Armour', tier: 90 })
    expect(Object.keys(sirenic ?? {}).sort()).toEqual(['body', 'head', 'legs'])
  })

  it('builds CDN URLs from config names', () => {
    expect(gearImageUrl('RUNE_PLATEBODY')).toBe('https://cdn.featfinder.net/BankTags/RUNE_PLATEBODY.png')
  })
})

describe('gear requirements', () => {
  const requirementsFor = (style: typeof gearStyles[number]['id'], track: 'weapons' | 'armour', name: string, tier: number) =>
    pickRequirements({ pieces: resolveGearPieces(style, track, { name, tier }) ?? {} })

  it('only starter gear and the Deathtouch Bracelet have no level requirement', () => {
    for (const { style, track, item } of allItems) {
      if (item.tier > 1 && item.name !== 'Deathtouch Bracelet') {
        expect(requirementsFor(style, track, item.name, item.tier), `${style} ${item.name}`).not.toEqual([])
      }
    }
  })

  it('uses real skills', () => {
    const skills = new Set(['attack', 'strength', 'defence', 'constitution', 'ranged', 'magic', 'necromancy', 'agility'])
    for (const { style, track, item } of allItems) {
      for (const { skill } of requirementsFor(style, track, item.name, item.tier)) {
        expect(skills.has(skill), `${item.name}: ${skill}`).toBe(true)
      }
    }
  })

  it('reads the requirement that differs from the usual pattern', () => {
    expect(requirementsFor('melee', 'weapons', 'Ek-Zekkil', 95)).toEqual([{ skill: 'strength', level: 95 }])
    expect(requirementsFor('magic', 'armour', 'Lunar Armour', 60)).toEqual([
      { skill: 'defence', level: 40 },
      { skill: 'magic', level: 60 },
    ])
    expect(requirementsFor('melee', 'armour', 'Torva Armour', 80)).toEqual([
      { skill: 'defence', level: 80 },
      { skill: 'constitution', level: 80 },
    ])
  })

  it('follows the tier of tiered necromancy gear', () => {
    expect(requirementsFor('necromancy', 'weapons', 'Death Guard + Skull Lantern', 1)).toEqual([])
    expect(requirementsFor('necromancy', 'weapons', 'Death Guard + Skull Lantern', 70)).toEqual([{ skill: 'necromancy', level: 70 }])
    expect(requirementsFor('necromancy', 'armour', 'Deathwarden Armour', 70)).toEqual([{ skill: 'defence', level: 70 }])
    expect(requirementsFor('necromancy', 'armour', 'Deathdealer Armour', 70)).toEqual([
      { skill: 'defence', level: 70 },
      { skill: 'necromancy', level: 70 },
    ])
  })

  it('takes the highest level across the pieces of a pick', () => {
    expect(requirementsFor('ranged', 'weapons', 'Mechanized Chinchompas + Offhand Blightbound Crossbow', 92)).toEqual([
      { skill: 'ranged', level: 92 },
    ])
  })

  it('reports only the requirements above the given levels', () => {
    const requirements = [{ skill: 'defence', level: 80 }, { skill: 'constitution', level: 80 }]
    const levels: Record<string, number> = { defence: 80, constitution: 79 }
    expect(unmetRequirements(requirements, (skill) => levels[skill])).toEqual([{ skill: 'constitution', level: 80 }])
    expect(unmetRequirements(requirements, () => null)).toEqual([])
    expect(formatRequirement(requirements[1])).toBe('80 Constitution')
  })
})

describe('buildGearStages', () => {
  const stages = buildGearStages('melee', gearByStyle.melee.pvm)

  it('keeps every recommendation, in ascending tier order', () => {
    const { weapons, armour } = gearByStyle.melee.pvm
    expect(stages.flatMap((stage) => stage.weapons)).toHaveLength(weapons.length)
    expect(stages.flatMap((stage) => stage.armour)).toHaveLength(armour.length)
    const tiers = stages.map((stage) => stage.tier)
    expect(tiers).toEqual([...tiers].sort((a, b) => a - b))
    expect(new Set(tiers).size).toBe(tiers.length)
  })

  it('groups same-tier picks as alternatives and preserves notes and flags', () => {
    const tier90 = stages.find((stage) => stage.tier === 90)
    expect(tier90?.weapons.map((pick) => pick.name)).toEqual([
      'Ruinous Rapier + Off-hand Ruinous Rapier',
      'Drygore Longswords',
    ])
    expect(tier90?.armour.map((pick) => pick.name)).toEqual([
      'Masterwork Melee Armour',
      'Malevolent Armour',
    ])
    const first = stages[0].weapons[0]
    expect(first).toMatchObject({ note: 'From Blood Pact Quest', ironman: true })
  })

  it('does not carry picks into tiers that do not list them', () => {
    const tier40 = stages.find((stage) => stage.tier === 40)
    expect(tier40?.weapons.map((pick) => pick.name)).toEqual(['Adamant Swords'])
    expect(tier40?.armour).toEqual([])
  })

  it('filters to ironman-friendly picks and keeps a path for every style', () => {
    for (const { id } of gearStyles) {
      for (const mode of ['training', 'pvm'] as const) {
        const filtered = buildGearStages(id, gearByStyle[id][mode], { ironmanOnly: true })
        expect(filtered.length).toBeGreaterThan(0)
        expect(
          filtered.flatMap((stage) => [...stage.weapons, ...stage.armour]).every((pick) => pick.ironman)
        ).toBe(true)
      }
    }
  })

  it('marks Barrows as an example set', () => {
    const tier70 = stages.find((stage) => stage.tier === 70)
    expect(tier70?.armour.find((pick) => pick.name === 'Barrows Armour')?.exampleSet).toBe("Dharok's")
  })
})

describe('worn gear', () => {
  const firstPick: ChoosePick = (track, stage) => stage[track][0]
  const stages = buildGearStages('melee', gearByStyle.melee.pvm)
  const indexOf = (tier: number) => stages.findIndex((stage) => stage.tier === tier)

  it('keeps armour on through upgrades that only change the weapon', () => {
    expect(wornGear(stages, indexOf(40), firstPick).body?.name).toBe('Mithril platebody')
    expect([...upgradedSlots(stages, indexOf(40), firstPick)].sort()).toEqual(['main', 'offhand'])
  })

  it('keeps older pieces in slots a new armour set does not cover', () => {
    const malevolent: ChoosePick = (track, stage) =>
      stage[track].find((pick) => pick.name === 'Malevolent Armour') ?? stage[track][0]
    const worn = wornGear(stages, indexOf(90), malevolent)
    expect(worn.body?.name).toBe('Malevolent cuirass')
    expect(worn.hands?.name).toBe('Torva gloves')
    const upgraded = upgradedSlots(stages, indexOf(90), malevolent)
    expect(upgraded.has('body')).toBe(true)
    expect(upgraded.has('hands')).toBe(false)
  })

  it('empties the off-hand when a two-handed weapon replaces dual wield', () => {
    const training = buildGearStages('melee', gearByStyle.melee.training)
    const worn = wornGear(training, 1, firstPick)
    expect(worn.main?.name).toBe('Mithril halberd')
    expect(worn.offhand).toBeUndefined()
  })

  it('marks only the piece that changed when a pick shares an item with the last one', () => {
    const ranged = buildGearStages('ranged', gearByStyle.ranged.training)
    const index = ranged.findIndex((stage) => stage.tier === 92)
    const upgraded = upgradedSlots(ranged, index, firstPick)
    expect(upgraded.has('offhand')).toBe(true)
    expect(upgraded.has('main')).toBe(false)
  })

  it('marks nothing at the first upgrade', () => {
    expect(upgradedSlots(stages, 0, firstPick).size).toBe(0)
  })
})

describe('buildProgressionRows', () => {
  const row = (rows: ReturnType<typeof buildProgressionRows>, id: string) =>
    rows.find((item) => item.id === id)

  it('orders weapon rows before armour and skips empty rows', () => {
    const ids = (style: typeof gearStyles[number]['id']) =>
      buildProgressionRows(buildGearStages(style, gearByStyle[style].pvm)).map(({ id }) => id)
    expect(ids('melee')).toEqual(['main-hand', 'off-hand', 'two-handed', 'head', 'body', 'legs', 'hands', 'feet'])
    expect(ids('necromancy')).toEqual(['main-hand', 'off-hand', 'head', 'body', 'legs', 'hands', 'feet'])
  })

  it('keeps every item the guide recommends', () => {
    for (const { id } of gearStyles) {
      for (const mode of ['training', 'pvm'] as const) {
        const stages = buildGearStages(id, gearByStyle[id][mode])
        const listed = new Set(
          buildProgressionRows(stages).flatMap(({ steps }) =>
            steps.flatMap(({ options }) => options.map(({ piece }) => piece.config))
          )
        )
        for (const stage of stages) {
          for (const pick of [...stage.weapons, ...stage.armour]) {
            for (const piece of Object.values(pick.pieces)) {
              expect(listed.has(piece.config), `${id} ${mode} ${piece.name}`).toBe(true)
            }
          }
        }
      }
    }
  })

  it('lists a shared item once, and each hand when it changes', () => {
    const rows = buildProgressionRows(buildGearStages('ranged', gearByStyle.ranged.training))
    const names = (id: string) =>
      row(rows, id)?.steps.flatMap(({ options }) => options.map(({ piece }) => piece.name)) ?? []
    expect(names('main-hand').filter((name) => name === 'Mechanised chinchompa')).toHaveLength(1)
    expect(names('off-hand')).toEqual(expect.arrayContaining([
      'Off-hand Armadyl crossbow',
      'Off-hand ruinous crossbow',
      'Off-hand Blightbound crossbow',
    ]))
  })

  it('numbers steps by the upgrade that adds them, in order', () => {
    const stages = buildGearStages('melee', gearByStyle.melee.pvm)
    for (const { steps } of buildProgressionRows(stages)) {
      const upgrades = steps.map(({ upgrade }) => upgrade)
      expect(upgrades).toEqual([...upgrades].sort((a, b) => a - b))
      expect(new Set(upgrades).size).toBe(upgrades.length)
      for (const step of steps) expect(stages[step.upgrade - 1]).toBe(step.stage)
    }
  })

  it('puts two-handed weapons and one-handed weapons in separate rows', () => {
    const rows = buildProgressionRows(buildGearStages('melee', gearByStyle.melee.pvm))
    const names = (id: string) =>
      row(rows, id)?.steps.flatMap(({ options }) => options.map(({ piece }) => piece.name)) ?? []
    expect(names('two-handed')).toContain('Masterwork Spear of Annihilation')
    expect(names('main-hand')).not.toContain('Masterwork Spear of Annihilation')
    expect(names('main-hand')).toEqual(expect.arrayContaining(['Necronium battleaxe + 4', 'Abyssal scourge']))
    expect(names('two-handed')).not.toContain('Abyssal scourge')
  })

  it('shows an item once when it stays across upgrades', () => {
    const piece = { name: 'Hat', config: 'HAT' }
    const pick = { name: 'Hats', tier: 1, pieces: { head: piece } }
    const rows = buildProgressionRows([
      { tier: 1, weapons: [], armour: [pick] },
      { tier: 2, weapons: [], armour: [{ ...pick, tier: 2 }] },
    ])
    expect(row(rows, 'head')?.steps).toHaveLength(1)
  })

  it('keeps alternatives together at their step and numbers steps by upgrade', () => {
    const stages = buildGearStages('melee', gearByStyle.melee.pvm)
    const body = row(buildProgressionRows(stages), 'body')
    const step = body?.steps.find(({ stage }) => stage.tier === 90)
    expect(step?.options.map(({ piece }) => piece.name)).toEqual(['Masterwork melee platebody', 'Malevolent cuirass'])
    expect(step?.upgrade).toBe(stages.findIndex(({ tier }) => tier === 90) + 1)
  })
})

describe('item dependencies', () => {
  it('always lists a dependency in an earlier upgrade of the same path', () => {
    let checked = 0
    for (const { id } of gearStyles) {
      for (const mode of ['training', 'pvm'] as const) {
        for (const ironmanOnly of [false, true]) {
          const stages = buildGearStages(id, gearByStyle[id][mode], { ironmanOnly })
          const piecesAt = (stage: typeof stages[number]) =>
            [...stage.weapons, ...stage.armour].flatMap((pick) => Object.values(pick.pieces))
          stages.forEach((stage, index) => {
            for (const piece of piecesAt(stage)) {
              if (!piece.dependsOn) continue
              checked += 1
              const earlier = stages.slice(0, index).flatMap(piecesAt).map(({ name }) => name)
              expect(earlier, `${id} ${mode} ${piece.name}`).toContain(piece.dependsOn.name)
            }
          })
        }
      }
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('orders upgrades within a tier without touching other tiers', () => {
    const stages = buildGearStages('necromancy', gearByStyle.necromancy.pvm)
    expect(stages.map(({ tier }) => tier).slice(-3)).toEqual([95, 95.1, 95.2])
    expect(stages.at(-1)?.armour.map(({ name }) => name)).toEqual(['Cinderbane Gloves', 'Deathtouch Bracelet'])
    expect(stages.at(-2)?.armour.map(({ name }) => name)).toEqual(['Visage of the First Necromancer'])
    expect(stages.at(-3)?.weapons.map(({ name }) => name)).toEqual(['Omni Guard + Soulbound Lantern'])
  })
})

describe('stage navigation helpers', () => {
  const stages = buildGearStages('melee', gearByStyle.melee.pvm)

  it('falls back to the closest lower tier', () => {
    expect(findStageIndex(stages, null)).toBe(0)
    expect(stages[findStageIndex(stages, 45)].tier).toBe(40)
    expect(stages[findStageIndex(stages, 999)].tier).toBe(95)
    expect(findStageIndex(stages, 0)).toBe(0)
  })

  it('detects styles whose training and PvM paths match', () => {
    expect(gearCategoriesMatch(gearByStyle.magic.training, gearByStyle.magic.pvm)).toBe(true)
    expect(gearCategoriesMatch(gearByStyle.melee.training, gearByStyle.melee.pvm)).toBe(false)
  })
})
