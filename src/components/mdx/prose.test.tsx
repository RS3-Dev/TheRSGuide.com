import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { DocCard, TableScroll, proseComponents } from "@/components/mdx/prose"
import { mdxComponents } from "@/mdx_components/mdx-components"

describe("MDX prose adapters", () => {
  it("maps authored prose elements to component-owned Tailwind styles", () => {
    const Heading1 = proseComponents.h1
    const Heading = proseComponents.h2
    const Link = proseComponents.a
    const Code = proseComponents.code
    const Pre = proseComponents.pre
    const Quote = proseComponents.blockquote
    const List = proseComponents.ul
    const ListItem = proseComponents.li
    const Table = proseComponents.table
    const Header = proseComponents.th
    const Cell = proseComponents.td

    const markup = renderToStaticMarkup(
      <>
        <Heading1 id="page-section">Page section</Heading1>
        <Heading id="overview">Overview</Heading>
        <Link href="https://runescape.wiki">RuneScape Wiki</Link>
        <Code>ability</Code>
        <Pre>
          <Code>resonance</Code>
        </Pre>
        <Quote>Use defensives.</Quote>
        <List>
          <ListItem>Prepare</ListItem>
        </List>
        <Table>
          <thead>
            <tr>
              <Header>Requirement</Header>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Cell>Level 50</Cell>
            </tr>
          </tbody>
        </Table>
      </>
    )

    expect(markup).toContain('id="page-section"')
    expect(markup).toContain("text-[2.25rem]")
    expect(markup).toContain('id="overview"')
    expect(markup).toContain('target="_blank"')
    expect(markup).toContain("overflow")
    expect(markup).toContain("border-l-")
    expect(markup).toContain("list-disc")
    expect(markup).toContain("border-collapse")
    expect(markup).toContain("font-display")
  })

  it("registers TableScroll as the authored MDX table boundary", () => {
    const markup = renderToStaticMarkup(
      <TableScroll aria-label="Scrollable requirements">
        <table>
          <tbody>
            <tr>
              <td>Requirement</td>
            </tr>
          </tbody>
        </table>
      </TableScroll>
    )

    expect(markup).toContain('data-slot="table-scroll"')
    expect(markup).toContain("overflow-x-auto")
    expect(markup).toContain("[&amp;_table]:border-collapse")
    expect(markup).toContain("[&amp;_th]:bg-muted")
    expect(markup).toContain("[&amp;_td]:border")
    expect(mdxComponents.TableScroll).toBe(TableScroll)
  })

  it("preserves the branded link treatment on navigation cards", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <DocCard title="Early Game Progression" href="/guides/early-game" />
      </MemoryRouter>
    )

    expect(markup).toContain("text-primary")
    expect(markup).toContain("underline")
    expect(markup).toContain("hover:border-primary")
  })
})
