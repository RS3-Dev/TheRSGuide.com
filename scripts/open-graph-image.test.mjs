import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { afterEach, describe, expect, it } from 'vitest'
import {
  generateOpenGraphImage,
  OPEN_GRAPH_IMAGE_HEIGHT,
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

  it('renders the approved social preview at the recommended dimensions', async () => {
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

    await expect(sharp(output).metadata()).resolves.toMatchObject({
      format: 'png',
      width: OPEN_GRAPH_IMAGE_WIDTH,
      height: OPEN_GRAPH_IMAGE_HEIGHT,
    })
  })

  it('keeps the approved flat artwork free of discarded ornaments', async () => {
    const svg = await renderOpenGraphSvg({
      root: process.cwd(),
      title: 'Relics',
      description: 'Choose a path through the league.',
      section: 'Leagues',
      detail: 'RuneScape guide · 8 sections',
    })

    expect(svg).toContain('>LEAGUES</text>')
    expect(svg).toContain('<rect width="1200" height="630" fill="#0a0908" />')
    expect(svg).not.toContain('<linearGradient')
    expect(svg).not.toContain('<pattern')
    expect(svg).not.toContain('<circle')
    expect(svg).not.toContain('>01</text>')
    expect(svg).not.toContain('x="318" y="549"')
    expect(svg).not.toContain('aria-label="Leagues paths"')
  })
})
