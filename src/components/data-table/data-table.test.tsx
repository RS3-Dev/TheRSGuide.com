// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { DataTable } from '@/components/data-table/data-table'
import type { DataTableConfig } from '@/lib/data-table-config'

const simpleConfig: DataTableConfig = {
  title: 'Example table',
  columns: [{ key: 'name', header: 'Name' }],
  rows: [{ name: 'Visible row' }],
}

const interactiveConfig: DataTableConfig = {
  title: 'Creature guide',
  rowId: 'id',
  search: { label: 'Search creatures' },
  sortable: true,
  columns: [
    {
      key: 'name',
      header: 'Name',
      link: { hrefKey: 'url', external: true },
    },
    { key: 'category', header: 'Category' },
  ],
  rows: [
    {
      id: 'dragon',
      name: 'Dragon',
      category: 'Boss',
      url: 'https://runescape.wiki/w/Dragon',
    },
    {
      id: 'abyss',
      name: 'Abyss',
      category: 'Area',
      url: 'https://runescape.wiki/w/Abyss',
    },
  ],
}

describe('DataTable', () => {
  it('exposes and operates a collapsed table through an accessible control', async () => {
    const user = userEvent.setup()
    render(<DataTable config={{ ...simpleConfig, collapsed: true }} />)

    const toggle = screen.getByRole('button', { name: 'Expand Example table' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    await user.click(toggle)

    expect(screen.getByRole('button', { name: 'Collapse Example table' }))
      .toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('table', { name: 'Example table' })).toBeVisible()
    expect(screen.getByRole('cell', { name: 'Visible row' })).toBeVisible()
  })

  it('renders ordinary tables without an unnecessary collapse control', () => {
    render(<DataTable config={simpleConfig} />)

    expect(screen.queryByRole('button', { name: /Example table/ }))
      .not.toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Example table' })).toBeVisible()
  })

  it('supports search, sorting, and configured links with a small fixture', async () => {
    const user = userEvent.setup()
    render(<DataTable config={interactiveConfig} />)

    const dragonLink = screen.getByRole('link', { name: /Dragon/ })
    expect(dragonLink).toHaveAttribute('href', 'https://runescape.wiki/w/Dragon')
    expect(dragonLink).toHaveAttribute('target', '_blank')

    await user.type(screen.getByRole('searchbox', { name: 'Search creatures' }), 'dragon')
    expect(screen.getByRole('cell', { name: /Dragon/ })).toBeVisible()
    expect(screen.queryByRole('cell', { name: /Abyss/ })).not.toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: 'Search creatures' }))
    await user.click(screen.getByRole('button', { name: 'Sort by Name' }))

    const abyss = screen.getByRole('cell', { name: /Abyss/ })
    const dragon = screen.getByRole('cell', { name: /Dragon/ })
    expect(abyss.compareDocumentPosition(dragon) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy()
  })

  it('renders an alert instead of throwing for invalid runtime data', () => {
    const invalidConfig = {
      title: 'Broken table',
      columns: [],
      rows: 'not-an-array',
    } as unknown as DataTableConfig

    render(<DataTable config={invalidConfig} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This table is temporarily unavailable because its data is invalid.',
    )
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
