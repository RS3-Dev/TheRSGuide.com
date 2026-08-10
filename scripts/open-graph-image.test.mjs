import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { afterEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_OPEN_GRAPH_IMAGE_VARIANT,
  generateOpenGraphImage,
  OPEN_GRAPH_IMAGE_HEIGHT,
  OPEN_GRAPH_IMAGE_VARIANTS,
  openGraphImagePath,
  OPEN_GRAPH_IMAGE_WIDTH,
  renderOpenGraphSvg,
} from './open-graph-image.mjs'

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) =>
    fs.rm(directory, { recursive: true, force: true })
  ))
})

describe('Open Graph image generation', () => {
  it('uses stable route-specific image paths', () => {
    expect(openGraphImagePath('/')).toBe('/og/home.png')
    expect(openGraphImagePath('/guides/mid-game/invention')).toBe(
      '/og/guides-mid-game-invention.png',
    )
  })

  it('renders a standard social preview image', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'rs-guide-og-'))
    temporaryDirectories.push(directory)
    const output = path.join(directory, 'preview.png')

    await generateOpenGraphImage({
      root: process.cwd(),
      outputDirectory: output,
      title: 'Chaotic and Ruinous Weapons',
      description: 'Efficient weapon upgrades from Dungeoneering rewards',
      section: 'Mid Game',
      detail: 'RuneScape guide · 4 sections',
    })

    const metadata = await sharp(output).metadata()
    expect(metadata).toMatchObject({
      format: 'png',
      width: OPEN_GRAPH_IMAGE_WIDTH,
      height: OPEN_GRAPH_IMAGE_HEIGHT,
    })
  })

  it('offers five render-only canvas treatments at the recommended dimensions', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'rs-guide-og-variants-'))
    temporaryDirectories.push(directory)

    expect(OPEN_GRAPH_IMAGE_VARIANTS).toHaveLength(5)
    expect(OPEN_GRAPH_IMAGE_VARIANTS).toContain(DEFAULT_OPEN_GRAPH_IMAGE_VARIANT)
    expect(DEFAULT_OPEN_GRAPH_IMAGE_VARIANT).toBe('chapter-index')

    await Promise.all(OPEN_GRAPH_IMAGE_VARIANTS.map(async (variant) => {
      const output = path.join(directory, `${variant}.png`)
      await generateOpenGraphImage({
        root: process.cwd(),
        outputDirectory: output,
        title: 'Relics',
        description: 'RuneScape Leagues relic choices and progression recommendations.',
        section: 'Leagues',
        detail: 'RuneScape guide · 8 sections',
        variant,
      })

      await expect(sharp(output).metadata()).resolves.toMatchObject({
        format: 'png',
        width: OPEN_GRAPH_IMAGE_WIDTH,
        height: OPEN_GRAPH_IMAGE_HEIGHT,
      })
    }))
  })

  it('labels Leagues cards without the removed path ornaments', async () => {
    const shared = {
      root: process.cwd(),
      title: 'Relics',
      description: 'Choose a path through the league.',
      detail: 'RuneScape guide · 8 sections',
      variant: DEFAULT_OPEN_GRAPH_IMAGE_VARIANT,
    }
    const leaguesSvg = await renderOpenGraphSvg({ ...shared, section: 'Leagues' })
    const regularSvg = await renderOpenGraphSvg({ ...shared, section: 'Getting Started' })

    expect(leaguesSvg).toContain('>LEAGUES</text>')
    expect(leaguesSvg).not.toContain('aria-label="Leagues paths"')
    expect(leaguesSvg).not.toContain('<circle')
    expect(leaguesSvg).not.toContain('>01</text>')
    expect(leaguesSvg).not.toContain('x="318" y="549"')
    expect(leaguesSvg).not.toContain('id="chapter-background"')
    expect(leaguesSvg).not.toContain('id="chapter-lines"')
    expect(leaguesSvg).not.toContain('#e3483e')
    expect(leaguesSvg).not.toContain('#5aa047')
    expect(leaguesSvg).not.toContain('#4c82e8')
    expect(regularSvg).not.toContain('#e3483e')
    expect(regularSvg).not.toContain('#5aa047')
    expect(regularSvg).not.toContain('#4c82e8')
  })

  it('rejects unknown artwork variants', async () => {
    await expect(renderOpenGraphSvg({
      root: process.cwd(),
      title: 'Relics',
      description: 'Choose a path through the league.',
      section: 'Leagues',
      detail: 'RuneScape guide',
      variant: 'unknown-treatment',
    })).rejects.toThrow('Unknown Open Graph image variant')
  })
})
