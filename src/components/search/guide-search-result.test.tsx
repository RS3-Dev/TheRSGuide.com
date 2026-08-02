import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { GuideSearchResult } from "@/components/search/guide-search-result"
import { Command, CommandGroup } from "@/components/ui/command"
import type { GuideSearchHit } from "@/lib/guide-search"

const hit: GuideSearchHit = {
  document: {
    path: "/getting-started/damage",
    title: "Damage",
    navigationTitle: "Damage",
    description: "Understand RuneScape damage.",
    section: "getting-started",
    tableOfContents: [],
    hasTableOfContents: false,
    showPageHeader: true,
    requiresPlayerData: false,
    ogImage: "/og/damage.png",
    Component: () => null,
  },
  sectionLabel: "Getting Started",
  excerpt: "A guide result excerpt.",
  match: "content",
}

describe("GuideSearchResult", () => {
  it("renders landing result detail", () => {
    const markup = renderToStaticMarkup(
      <Command>
        <CommandGroup>
          <GuideSearchResult
            hit={hit}
            display="landing"
            onSelect={vi.fn()}
          />
        </CommandGroup>
      </Command>
    )

    expect(markup).toContain("A guide result excerpt.")
    expect(markup).toContain("Getting Started")
  })

  it("renders dialog result detail", () => {
    const markup = renderToStaticMarkup(
      <Command>
        <CommandGroup>
          <GuideSearchResult hit={hit} display="dialog" onSelect={vi.fn()} />
        </CommandGroup>
      </Command>
    )

    expect(markup).toContain("Understand RuneScape damage.")
    expect(markup).not.toContain("A guide result excerpt.")
  })
})
