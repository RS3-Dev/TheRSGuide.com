import { existsSync, readFileSync, readdirSync } from "node:fs"
import { basename, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const sourceDirectory = fileURLToPath(new URL(".", import.meta.url))
const architectureTestPath = fileURLToPath(import.meta.url)

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory()
      ? sourceFiles(path)
      : /\.(?:ts|tsx)$/.test(entry.name)
        ? [path]
        : []
  })
}

describe("global CSS boundaries", () => {
  it("keeps named global class selectors limited to the theme and home document state", () => {
    const css = readFileSync(resolve(sourceDirectory, "index.css"), "utf8")
    const selectors = css
      .split(/\r?\n/)
      .filter((line) => line.includes("{") && !line.trimStart().startsWith("@"))
      .map((line) => line.slice(0, line.indexOf("{")))
      .flatMap((selector) =>
        Array.from(selector.matchAll(/\.([A-Za-z_][\w-]*)/g), (match) => match[1])
      )

    expect([...new Set(selectors)].sort()).toEqual(["dark", "home-page"])
  })
})

describe("page architecture boundaries", () => {
  const pagesDirectory = resolve(sourceDirectory, "pages")
  const pagePaths = readdirSync(pagesDirectory)
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => resolve(pagesDirectory, name))

  it.each(pagePaths)("%s remains a thin route shell", (pagePath) => {
    const source = readFileSync(pagePath, "utf8")
    const imports = Array.from(
      source.matchAll(/from\s+["']([^"']+)["']/g),
      (match) => match[1]
    )
    const functionComponents = Array.from(
      source.matchAll(/\bfunction\s+([A-Z][A-Za-z0-9]*)\s*\(/g),
      (match) => match[1]
    )
    const arrowComponents = Array.from(
      source.matchAll(/\bconst\s+([A-Z][A-Za-z0-9]*)\s*=/g),
      (match) => match[1]
    )

    expect(
      imports.filter(
        (specifier) =>
          specifier.startsWith("@/components/ui") ||
          specifier === "lucide-react"
      ),
      `${basename(pagePath)} must not import UI primitives or icons`
    ).toEqual([])
    expect(
      source,
      `${basename(pagePath)} must not own stateful React hooks`
    ).not.toMatch(/\buse(?:State|Effect|LayoutEffect|Reducer|Ref)\s*\(/)
    expect(
      functionComponents.length,
      `${basename(pagePath)} must define at most its route component`
    ).toBeLessThanOrEqual(1)
    expect(
      arrowComponents,
      `${basename(pagePath)} must not define local visual components`
    ).toEqual([])
  })
})

describe("source architecture boundaries", () => {
  it("uses the consolidated React Router package", () => {
    const legacyImports = sourceFiles(sourceDirectory)
      .filter((path) => path !== architectureTestPath)
      .filter((path) => readFileSync(path, "utf8").includes("react-router-dom"))

    expect(legacyImports).toEqual([])
  })

  it("keeps visual MDX components in the feature component folder", () => {
    expect(
      existsSync(resolve(sourceDirectory, "mdx_components", "components"))
    ).toBe(false)
  })

  it("uses TableScroll for the categorized glossary tables", () => {
    const glossary = readFileSync(
      resolve(sourceDirectory, "..", "content", "setup", "glossary.mdx"),
      "utf8"
    )

    expect(glossary).not.toContain('className="table-scroll"')
    expect(glossary.match(/<TableScroll>/g)).toHaveLength(6)
    expect(glossary.match(/<\/TableScroll>/g)).toHaveLength(6)
  })
})
