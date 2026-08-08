import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { validateDataTables } from './data-table-validation.mjs'

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) =>
    fs.rm(directory, { recursive: true, force: true })
  ))
})

async function validationFixture(config) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'rs-guide-tables-'))
  temporaryDirectories.push(root)
  await Promise.all([
    fs.mkdir(path.join(root, 'schemas'), { recursive: true }),
    fs.mkdir(path.join(root, 'src', 'data'), { recursive: true }),
  ])
  await Promise.all([
    fs.copyFile(
      path.join(process.cwd(), 'schemas', 'data-table.schema.json'),
      path.join(root, 'schemas', 'data-table.schema.json'),
    ),
    fs.writeFile(
      path.join(root, 'src', 'data', 'fixture-table.json'),
      JSON.stringify(config),
    ),
  ])
  return root
}

describe('data table validation', () => {
  it('accepts every production table through one shared contract', async () => {
    const tables = await validateDataTables(process.cwd())

    expect(tables).toContain(
      'src/data/leagues-ii/rs-for-os-players/misaligned-weapon-tiers.json',
    )
    expect(tables).toContain(
      'src/data/leagues-ii/regions/wilderness/wilderness-pvm-upgrades.json',
    )
  })

  it('reports schema failures with their source file', async () => {
    const root = await validationFixture({
      title: 'Broken table',
      titleAs: 'section',
      columns: [{ key: 'item' }],
      rows: [{ item: 'First' }],
    })

    await expect(validateDataTables(root)).rejects.toThrow(
      /fixture-table\.json:[\s\S]*titleAs[\s\S]*must be equal to one of the allowed values/,
    )
  })

  it('reports semantic row failures without relying on production totals', async () => {
    const root = await validationFixture({
      title: 'Broken table',
      rowId: 'id',
      columns: [{ key: 'item' }, { key: 'item' }],
      rows: [{ id: 'same', name: 'First' }, { id: 'same', item: 'Second' }],
    })

    await expect(validateDataTables(root)).rejects.toThrow(
      /duplicate key "item"[\s\S]*missing column key "item"[\s\S]*duplicates rowId "same"/,
    )
  })
})
