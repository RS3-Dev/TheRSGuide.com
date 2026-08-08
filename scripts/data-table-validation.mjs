import { promises as fs } from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'

const DATA_TABLE_SCHEMA_NAME = 'data-table.schema.json'

const normalizeSlashes = (value) => value.replaceAll('\\', '/')

const walkJsonFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) return walkJsonFiles(absolute)
    return entry.isFile() && entry.name.endsWith('.json') ? [absolute] : []
  }))
  return nested.flat()
}

const isObject = (value) => Boolean(value)
  && typeof value === 'object'
  && !Array.isArray(value)

const isDataTableFile = (absoluteFile, value) => {
  if (!isObject(value)) return false
  const normalizedFile = normalizeSlashes(absoluteFile)
  return normalizedFile.includes('/src/data/leagues-ii/regions/')
    || (typeof value.$schema === 'string'
      && value.$schema.endsWith(DATA_TABLE_SCHEMA_NAME))
    || ('title' in value && ('columns' in value || 'rows' in value))
}

const schemaIssue = (error) => {
  const path = error.instancePath || 'configuration'
  if (error.keyword === 'additionalProperties') {
    return `${path} has unknown property "${error.params.additionalProperty}"`
  }
  return `${path} ${error.message ?? 'is invalid'}`
}

const semanticIssues = (config) => {
  const issues = []
  const columnKeys = config.columns.map(({ key }) => key)
  const duplicateColumnKeys = columnKeys.filter(
    (key, index) => columnKeys.indexOf(key) !== index,
  )

  for (const key of new Set(duplicateColumnKeys)) {
    issues.push(`columns contain duplicate key "${key}"`)
  }

  config.rows.forEach((row, rowIndex) => {
    for (const key of columnKeys) {
      if (!Object.hasOwn(row, key)) {
        issues.push(`rows[${rowIndex}] is missing column key "${key}"`)
      }
    }
  })

  if (config.rowId) {
    const ids = new Map()
    config.rows.forEach((row, rowIndex) => {
      const value = row[config.rowId]
      if (value === undefined || value === null || value === '') {
        issues.push(`rows[${rowIndex}] is missing rowId "${config.rowId}"`)
        return
      }
      const normalized = String(value)
      const previousIndex = ids.get(normalized)
      if (previousIndex !== undefined) {
        issues.push(
          `rows[${rowIndex}] duplicates rowId "${normalized}" from rows[${previousIndex}]`,
        )
      } else {
        ids.set(normalized, rowIndex)
      }
    })
  }

  for (const column of config.columns) {
    if (!column.link || config.rows.length === 0) continue
    if (!config.rows.some((row) => Object.hasOwn(row, column.link.hrefKey))) {
      issues.push(
        `column "${column.key}" links through missing row key "${column.link.hrefKey}"`,
      )
    }
  }

  return issues
}

export async function validateDataTables(root) {
  const dataDirectory = path.join(root, 'src', 'data')
  const schemaPath = path.join(root, 'schemas', DATA_TABLE_SCHEMA_NAME)
  const [schemaSource, jsonFiles] = await Promise.all([
    fs.readFile(schemaPath, 'utf8'),
    walkJsonFiles(dataDirectory),
  ])
  const schema = JSON.parse(schemaSource)
  const validate = new Ajv2020({
    allErrors: true,
    allowUnionTypes: true,
    strict: true,
  }).compile(schema)
  const tables = []
  const issues = []

  for (const absoluteFile of jsonFiles.sort()) {
    const relativeFile = normalizeSlashes(path.relative(root, absoluteFile))
    let value
    try {
      value = JSON.parse(await fs.readFile(absoluteFile, 'utf8'))
    } catch (error) {
      issues.push(`${relativeFile}: ${error instanceof Error ? error.message : 'invalid JSON'}`)
      continue
    }

    if (!isDataTableFile(absoluteFile, value)) continue
    tables.push(relativeFile)

    if (!validate(value)) {
      for (const error of validate.errors ?? []) {
        issues.push(`${relativeFile}: ${schemaIssue(error)}`)
      }
      continue
    }

    for (const issue of semanticIssues(value)) {
      issues.push(`${relativeFile}: ${issue}`)
    }
  }

  if (issues.length) {
    throw new Error(`Invalid data table configuration:\n${issues.map((issue) => `- ${issue}`).join('\n')}`)
  }

  return tables
}

export const dataTableValidationPlugin = ({ root = process.cwd() } = {}) => ({
  name: 'data-table-validation',
  async buildStart() {
    await validateDataTables(root)
  },
})
