import gearData from '@/data/gear-by-style.json'
import gearPieces from '@/data/gear-pieces.json'

export type CombatStyle = 'necromancy' | 'magic' | 'melee' | 'ranged'
export type GearMode = 'training' | 'pvm'
export type GearTrack = 'weapons' | 'armour'
export type GearSlot =
  | 'head'
  | 'cape'
  | 'neck'
  | 'ammo'
  | 'main'
  | 'body'
  | 'offhand'
  | 'legs'
  | 'hands'
  | 'feet'
  | 'ring'

export type GearPiece = {
  name: string
  config: string
  requires?: Record<string, number>
  // For a weapon listed without an off-hand that is not two-handed.
  oneHanded?: boolean
  // Another item that has to come first, named as it is on that item's piece.
  dependsOn?: { name: string; reason: string }
}
export type GearPieces = Partial<Record<GearSlot, GearPiece>>
export type GearRequirement = { skill: string; level: number }

export type GearItem = {
  name: string
  tier: number
  // Separates upgrades within a tier that have to happen one after another.
  order?: number
  ironman?: boolean
  note?: string
}

export type GearCategory = Record<GearTrack, GearItem[]>

export type GearPick = GearItem & {
  pieces: GearPieces
  exampleSet?: string
}

export type GearStage = { tier: number } & Record<GearTrack, GearPick[]>

export type ChoosePick = (track: GearTrack, stage: GearStage) => GearPick | undefined

const GEAR_IMAGE_BASE = 'https://cdn.featfinder.net/BankTags'

const piecesByTrack = gearPieces as unknown as Record<
  GearTrack,
  Record<string, GearPieces>
>
const exampleSets: Record<string, string> = gearPieces.exampleSets

export const gearByStyle = gearData as Record<
  CombatStyle,
  Record<GearMode, GearCategory>
>

export const gearStyles: readonly { id: CombatStyle; label: string }[] = [
  { id: 'necromancy', label: 'Necromancy' },
  { id: 'magic', label: 'Magic' },
  { id: 'melee', label: 'Melee' },
  { id: 'ranged', label: 'Ranged' },
]

export const DEFAULT_GEAR_STYLE: CombatStyle = 'necromancy'

export const parseGearStyle = (value: string | null): CombatStyle =>
  gearStyles.find(({ id }) => id === value)?.id ?? DEFAULT_GEAR_STYLE

export const gearModeLabels: Record<CombatStyle, Record<GearMode, string>> = {
  melee: { training: 'Training (Halberds)', pvm: 'PvM (Single Target)' },
  ranged: { training: 'Training (Chinchompas)', pvm: 'PvM (Single Target)' },
  magic: { training: 'Training', pvm: 'PvM' },
  necromancy: { training: 'Training', pvm: 'PvM' },
}

export const gearSlotLabels: Record<GearSlot, string> = {
  head: 'Head',
  cape: 'Cape',
  neck: 'Neck',
  ammo: 'Ammo',
  main: 'Main hand',
  body: 'Body',
  offhand: 'Off-hand',
  legs: 'Legs',
  hands: 'Hands',
  feet: 'Feet',
  ring: 'Ring',
}

// Position on the 3 x 5 equipment grid, listed in reading order.
export const gearDollSlots: readonly { slot: GearSlot; column: number; row: number }[] = [
  { slot: 'head', column: 2, row: 1 },
  { slot: 'cape', column: 1, row: 2 },
  { slot: 'neck', column: 2, row: 2 },
  { slot: 'ammo', column: 3, row: 2 },
  { slot: 'main', column: 1, row: 3 },
  { slot: 'body', column: 2, row: 3 },
  { slot: 'offhand', column: 3, row: 3 },
  { slot: 'legs', column: 2, row: 4 },
  { slot: 'hands', column: 1, row: 5 },
  { slot: 'feet', column: 2, row: 5 },
  { slot: 'ring', column: 3, row: 5 },
]

export const gearImageUrl = (config: string) => `${GEAR_IMAGE_BASE}/${config}.png`

// Some picks use a different item per style or per tier, keyed as `name@style` or `name@T90`.
export function resolveGearPieces(
  style: CombatStyle,
  track: GearTrack,
  item: Pick<GearItem, 'name' | 'tier'>
): GearPieces | undefined {
  const pieces = piecesByTrack[track]
  return (
    pieces[`${item.name}@${style}`] ??
    pieces[`${item.name}@T${item.tier}`] ??
    pieces[item.name]
  )
}

export function buildGearStages(
  style: CombatStyle,
  category: GearCategory,
  { ironmanOnly = false }: { ironmanOnly?: boolean } = {}
): GearStage[] {
  const stages = new Map<number, GearStage>()

  for (const track of ['weapons', 'armour'] as const) {
    for (const item of category[track]) {
      if (ironmanOnly && !item.ironman) continue
      const stageTier = item.tier + (item.order ?? 0) / 10
      let stage = stages.get(stageTier)
      if (!stage) {
        stage = { tier: stageTier, weapons: [], armour: [] }
        stages.set(stageTier, stage)
      }
      stage[track].push({
        ...item,
        pieces: resolveGearPieces(style, track, item) ?? {},
        exampleSet: exampleSets[item.name],
      })
    }
  }

  return [...stages.values()].sort((a, b) => a.tier - b.tier)
}

// The requested tier, or the closest tier below it when filters or styles remove it.
export function findStageIndex(stages: readonly GearStage[], tier: number | null) {
  if (tier === null) return 0
  let index = 0
  stages.forEach((stage, stageIndex) => {
    if (stage.tier <= tier) index = stageIndex
  })
  return index
}

// A new weapon replaces both hands, since a two-handed weapon empties the off-hand.
// A new armour set only replaces the slots it covers, so older gloves and boots stay on.
export function wornGear(
  stages: readonly GearStage[],
  index: number,
  choosePick: ChoosePick
): GearPieces {
  let weapons: GearPieces = {}
  let armour: GearPieces = {}
  for (const stage of stages.slice(0, index + 1)) {
    const weapon = choosePick('weapons', stage)
    if (weapon) weapons = weapon.pieces
    const set = choosePick('armour', stage)
    if (set) armour = { ...armour, ...set.pieces }
  }
  return { ...weapons, ...armour }
}

// Slots holding a different item than the upgrade before. The first upgrade has nothing to improve on.
export function upgradedSlots(
  stages: readonly GearStage[],
  index: number,
  choosePick: ChoosePick
): ReadonlySet<GearSlot> {
  if (index === 0) return new Set()
  const previous = wornGear(stages, index - 1, choosePick)
  const current = wornGear(stages, index, choosePick)
  return new Set(
    (Object.keys(current) as GearSlot[]).filter(
      (slot) => current[slot]?.config !== previous[slot]?.config
    )
  )
}

export type ProgressionOption = { track: GearTrack; pick: GearPick; piece: GearPiece }

// One step along a row. Several options mean the guide offers alternatives there.
export type ProgressionStep = {
  stage: GearStage
  upgrade: number
  options: ProgressionOption[]
}

export type ProgressionRow = { id: string; label: string; slot: GearSlot; steps: ProgressionStep[] }

const isOneHanded = ({ pieces }: GearPick) => Boolean(pieces.offhand || pieces.main?.oneHanded)

const progressionRows: readonly {
  id: string
  label: string
  slot: GearSlot
  track: GearTrack
  includes?: (pick: GearPick) => boolean
}[] = [
  { id: 'main-hand', label: 'MH', slot: 'main', track: 'weapons', includes: isOneHanded },
  { id: 'off-hand', label: 'OH', slot: 'offhand', track: 'weapons' },
  { id: 'two-handed', label: '2H', slot: 'main', track: 'weapons', includes: (pick) => !isOneHanded(pick) },
  ...(['head', 'body', 'legs', 'hands', 'feet'] as const).map((slot) => ({
    id: slot,
    label: gearSlotLabels[slot],
    slot,
    track: 'armour' as const,
  })),
]

// Each row's new items per upgrade. An item that stays across upgrades only appears once.
export function buildProgressionRows(stages: readonly GearStage[]): ProgressionRow[] {
  return progressionRows
    .map(({ id, label, slot, track, includes }) => {
      const seen = new Set<string>()
      const steps: ProgressionStep[] = []
      stages.forEach((stage, index) => {
        const options: ProgressionOption[] = []
        for (const pick of stage[track]) {
          const piece = pick.pieces[slot]
          if (!piece || seen.has(piece.config) || includes?.(pick) === false) continue
          seen.add(piece.config)
          options.push({ track, pick, piece })
        }
        if (options.length > 0) steps.push({ stage, upgrade: index + 1, options })
      })
      return { id, label, slot, steps }
    })
    .filter(({ steps }) => steps.length > 0)
}

export const pieceRequirements = (piece: GearPiece): GearRequirement[] =>
  Object.entries(piece.requires ?? {}).map(([skill, level]) => ({ skill, level }))

// A pick's pieces can differ, such as a chinchompa with a higher-level off-hand.
export function pickRequirements(pick: Pick<GearPick, 'pieces'>): GearRequirement[] {
  const levels = new Map<string, number>()
  for (const piece of Object.values(pick.pieces)) {
    for (const { skill, level } of pieceRequirements(piece)) {
      levels.set(skill, Math.max(levels.get(skill) ?? 0, level))
    }
  }
  return [...levels].map(([skill, level]) => ({ skill, level }))
}

export const formatRequirement = ({ skill, level }: GearRequirement) =>
  `${level} ${skill.charAt(0).toUpperCase()}${skill.slice(1)}`

// An unknown level is not unmet: hiscores can leave a skill's level unavailable.
export function unmetRequirements(
  requirements: readonly GearRequirement[],
  levelOf: (skill: string) => number | null
) {
  return requirements.filter(({ skill, level }) => {
    const current = levelOf(skill)
    return current !== null && current < level
  })
}

export function gearCategoriesMatch(a: GearCategory, b: GearCategory) {
  return (['weapons', 'armour'] as const).every(
    (track) =>
      a[track].length === b[track].length &&
      a[track].every(
        (item, index) =>
          item.name === b[track][index].name &&
          item.tier === b[track][index].tier
      )
  )
}
