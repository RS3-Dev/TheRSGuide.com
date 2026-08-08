import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { DataTable, type DataTableConfig } from "@/components/data-table/data-table"

const config: DataTableConfig = {
  title: "Example table",
  columns: [{ key: "name", header: "Name" }],
  rows: [{ name: "Visible row" }],
}

describe("DataTable collapsed configuration", () => {
  it("starts with the accordion collapsed when collapsed is true", () => {
    const markup = renderToStaticMarkup(
      <DataTable config={{ ...config, collapsed: true }} />
    )

    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-controls=')
    expect(markup).toContain('aria-label="Expand Example table"')
    expect(markup).not.toContain("Name")
    expect(markup).not.toContain("Visible row")
    expect(markup).toContain('data-slot="collapsible-trigger"')
    expect(markup).toContain('data-state="closed"')
    expect(markup).toContain("lucide-chevron-down")
  })

  it("starts expanded but remains collapsible when collapsed is false", () => {
    const markup = renderToStaticMarkup(
      <DataTable config={{ ...config, collapsed: false }} />
    )

    expect(markup).toContain('aria-expanded="true"')
    expect(markup).toContain('aria-label="Collapse Example table"')
    expect(markup).toContain("Visible row")
    expect(markup).toContain('data-state="open"')
    expect(markup).toContain("lucide-chevron-down")
  })

  it("does not add a collapse control when collapsed is omitted", () => {
    const markup = renderToStaticMarkup(<DataTable config={config} />)

    expect(markup).not.toContain('aria-controls="')
    expect(markup).not.toContain('data-slot="collapsible-trigger"')
    expect(markup).toContain("Visible row")
  })

  it("fails gracefully when the data does not match the table structure", () => {
    const invalidConfig = {
      title: "Broken table",
      columns: [],
      rows: "not-an-array",
    } as unknown as DataTableConfig
    const markup = renderToStaticMarkup(<DataTable config={invalidConfig} />)

    expect(markup).toContain('role="alert"')
    expect(markup).toContain('data-slot="data-table-error"')
    expect(markup).toContain("This table is temporarily unavailable")
    expect(markup).not.toContain('data-slot="data-table"')
  })
})
