import { readFile, writeFile } from 'node:fs/promises'
import { glob } from 'node:fs/promises'

const tableRowPattern = /^\s*\|.*\|\s*$/
const separatorCellPattern = /^:?-{3,}:?$/

function parseRow(line) {
  const trimmed = line.trim()
  return trimmed.slice(1, -1).split('|').map((cell) => cell.trim())
}

function renderInline(value) {
  return value
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
}

function renderTable(lines) {
  const indent = lines[0].match(/^\s*/)?.[0] ?? ''
  const rows = lines.map(parseRow)
  const headers = rows[0]
  const body = rows.slice(2)
  const output = [
    `${indent}<TableScroll>`,
    `${indent}  <table>`,
    `${indent}    <thead>`,
    `${indent}      <tr>`,
    ...headers.map((cell) => `${indent}        <th>${renderInline(cell)}</th>`),
    `${indent}      </tr>`,
    `${indent}    </thead>`,
    `${indent}    <tbody>`,
  ]

  for (const row of body) {
    output.push(`${indent}      <tr>`)
    for (const cell of row) output.push(`${indent}        <td>${renderInline(cell)}</td>`)
    output.push(`${indent}      </tr>`)
  }

  output.push(
    `${indent}    </tbody>`,
    `${indent}  </table>`,
    `${indent}</TableScroll>`,
  )
  return output
}

let convertedTables = 0
let changedFiles = 0

for await (const path of glob('content/**/*.mdx')) {
  const source = await readFile(path, 'utf8')
  const newline = source.includes('\r\n') ? '\r\n' : '\n'
  const lines = source.split(/\r?\n/)
  const output = []
  let changed = false

  for (let index = 0; index < lines.length;) {
    if (!tableRowPattern.test(lines[index])) {
      output.push(lines[index])
      index += 1
      continue
    }

    const block = []
    while (index < lines.length && tableRowPattern.test(lines[index])) {
      block.push(lines[index])
      index += 1
    }

    const separator = block[1] ? parseRow(block[1]) : []
    if (block.length >= 3 && separator.length > 0 && separator.every((cell) => separatorCellPattern.test(cell))) {
      output.push(...renderTable(block))
      convertedTables += 1
      changed = true
    } else {
      output.push(...block)
    }
  }

  if (changed) {
    await writeFile(path, output.join(newline), 'utf8')
    changedFiles += 1
  }
}

console.log(`Converted ${convertedTables} tables across ${changedFiles} MDX files.`)
