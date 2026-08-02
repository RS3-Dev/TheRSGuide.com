import wildernessJson from './wilderness.json'

type RegionLink = {
  name: string
  url: string
  note?: string
  alsoAvailableIn?: string[]
}

type RegionBoss = RegionLink & {
  children: RegionLink[]
}

type RegionUpgradeGroup<Row> = {
  source: string
  rows: Row[]
}

type PvmUpgradeRow = {
  tier: string
  style: string
  items: RegionLink[]
  note: string
  alsoAvailableIn: string[]
}

type UtilityUpgradeRow = {
  type: string
  items: RegionLink[]
  note: string
}

type AbilityRow = {
  level: string
  style: string
  items: RegionLink[]
  note: string
}

type RegionGuideData = {
  $schema: string
  region: string
  locations: RegionLink[]
  bosses: RegionBoss[]
  features: RegionLink[]
  pvmUpgrades: RegionUpgradeGroup<PvmUpgradeRow>[]
  utilityUpgrades: RegionUpgradeGroup<UtilityUpgradeRow>[]
  abilities: RegionUpgradeGroup<AbilityRow>[]
}

function assertObject(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} must be an object.`)
  }
}

function assertExactKeys(value: Record<string, unknown>, keys: string[], path: string) {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${path} must contain exactly: ${keys.join(', ')}.`)
  }
}

function assertString(value: unknown, path: string) {
  if (typeof value !== 'string') throw new Error(`${path} must be a string.`)
}

function assertArray(value: unknown, path: string): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array.`)
}

function validateLink(value: unknown, path: string, includeNotes = false) {
  const expectedKeys = includeNotes ? ['name', 'url', 'note', 'alsoAvailableIn'] : ['name', 'url']
  assertObject(value, path)
  assertExactKeys(value, expectedKeys, path)
  assertString(value.name, `${path}.name`)
  assertString(value.url, `${path}.url`)
  if (includeNotes) {
    assertString(value.note, `${path}.note`)
    assertArray(value.alsoAvailableIn, `${path}.alsoAvailableIn`)
    value.alsoAvailableIn.forEach((region, index) => assertString(region, `${path}.alsoAvailableIn[${index}]`))
  }
}

function validateLinks(value: unknown, path: string, includeNotes = false) {
  assertArray(value, path)
  value.forEach((entry, index) => validateLink(entry, `${path}[${index}]`, includeNotes))
}

function validateGroups(
  value: unknown,
  path: string,
  validateRow: (row: unknown, path: string) => void,
) {
  assertArray(value, path)
  value.forEach((group, groupIndex) => {
    const groupPath = `${path}[${groupIndex}]`
    assertObject(group, groupPath)
    assertExactKeys(group, ['source', 'rows'], groupPath)
    assertString(group.source, `${groupPath}.source`)
    assertArray(group.rows, `${groupPath}.rows`)
    group.rows.forEach((row, rowIndex) => validateRow(row, `${groupPath}.rows[${rowIndex}]`))
  })
}

function validateRegionGuideData(value: unknown): RegionGuideData {
  assertObject(value, 'region')
  assertExactKeys(value, [
    '$schema',
    'region',
    'locations',
    'bosses',
    'features',
    'pvmUpgrades',
    'utilityUpgrades',
    'abilities',
  ], 'region')
  assertString(value.$schema, 'region.$schema')
  assertString(value.region, 'region.region')
  validateLinks(value.locations, 'region.locations')
  validateLinks(value.features, 'region.features')

  assertArray(value.bosses, 'region.bosses')
  value.bosses.forEach((boss, index) => {
    const path = `region.bosses[${index}]`
    assertObject(boss, path)
    assertExactKeys(boss, ['name', 'url', 'children'], path)
    assertString(boss.name, `${path}.name`)
    assertString(boss.url, `${path}.url`)
    validateLinks(boss.children, `${path}.children`)
  })

  validateGroups(value.pvmUpgrades, 'region.pvmUpgrades', (row, path) => {
    assertObject(row, path)
    assertExactKeys(row, ['tier', 'style', 'items'], path)
    assertString(row.tier, `${path}.tier`)
    assertString(row.style, `${path}.style`)
    validateLinks(row.items, `${path}.items`, true)
  })

  validateGroups(value.utilityUpgrades, 'region.utilityUpgrades', (row, path) => {
    assertObject(row, path)
    assertExactKeys(row, ['type', 'items'], path)
    assertString(row.type, `${path}.type`)
    validateLinks(row.items, `${path}.items`, true)
  })

  validateGroups(value.abilities, 'region.abilities', (row, path) => {
    assertObject(row, path)
    assertExactKeys(row, ['level', 'style', 'items'], path)
    assertString(row.level, `${path}.level`)
    assertString(row.style, `${path}.style`)
    validateLinks(row.items, `${path}.items`, true)
  })

  return value as unknown as RegionGuideData
}

const wildernessRegionData = validateRegionGuideData(wildernessJson)

export { validateRegionGuideData, wildernessRegionData }
export type {
  AbilityRow,
  PvmUpgradeRow,
  RegionBoss,
  RegionGuideData,
  RegionLink,
  RegionUpgradeGroup,
  UtilityUpgradeRow,
}
