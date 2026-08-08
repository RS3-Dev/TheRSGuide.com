import { describe, expect, it } from 'vitest'

import { mdxComponents } from '@/mdx_components/mdx-components'

type MdxModule = {
  default: unknown
}

const modules = import.meta.glob<MdxModule>('../content/**/*.mdx', {
  eager: true,
})
const sources = import.meta.glob<string>('../content/**/*.mdx', {
  eager: true,
  import: 'default',
  query: '?raw',
})

const authoredComponentNames = (source: string) => Array.from(
  source
    .replace(/```[\s\S]*?```/g, '')
    .matchAll(/<([A-Z][A-Za-z0-9]*)\b/g),
  (match) => match[1],
)

describe('authored MDX contract', () => {
  it('compiles and loads every guide module', () => {
    for (const sourcePath of Object.keys(sources)) {
      expect(modules[sourcePath]?.default, sourcePath).toBeTypeOf('function')
    }
  })

  it('registers every custom component used by guide content', () => {
    const missingComponents = Object.entries(sources).flatMap(
      ([sourcePath, source]) => authoredComponentNames(source)
        .filter((name) => !Object.hasOwn(mdxComponents, name))
        .map((name) => `${sourcePath}: ${name}`),
    )

    expect(missingComponents).toEqual([])
  })
})
