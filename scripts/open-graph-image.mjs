import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

export const OPEN_GRAPH_IMAGE_WIDTH = 1200
export const OPEN_GRAPH_IMAGE_HEIGHT = 630

const COLORS = Object.freeze({
  background: '#0a0908',
  border: '#4a3926',
  bronze: '#cc9a63',
  foreground: '#efe4d2',
  muted: '#ad9b86',
  surface: '#141210',
})

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const wordsToLines = (value, maximumCharacters, maximumLines) => {
  const words = String(value).trim().split(/\s+/).filter(Boolean)
  const lines = []

  for (const word of words) {
    const current = lines.at(-1)
    if (!current || current.length + word.length + 1 > maximumCharacters) {
      if (lines.length === maximumLines) {
        const last = lines.length - 1
        lines[last] = `${lines[last].replace(/[.,;:!?]?$/, '')}…`
        break
      }
      lines.push(word)
    } else {
      lines[lines.length - 1] = `${current} ${word}`
    }
  }

  return lines
}

const textLines = (lines, x, y, lineHeight, attributes = '') =>
  `<text x="${x}" y="${y}" ${attributes}>${lines.map((line, index) =>
    `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
  ).join('')}</text>`

const titleLayout = (title) => {
  const compact = title.length > 38
  return {
    lineHeight: 64,
    lines: wordsToLines(title, compact ? 29 : 25, 3),
    size: compact ? 50 : 64,
  }
}

const siteBrand = (x, y) =>
  `<text x="${x}" y="${y}" class="brand" fill="${COLORS.foreground}" font-size="23" font-weight="750" letter-spacing="2.1">THE <tspan fill="${COLORS.bronze}">RS</tspan> GUIDE</text>`

const renderArtwork = ({ title, description, section, detail }) => {
  const titleText = titleLayout(title)
  const descriptionLines = wordsToLines(description, 56, 3)
  const descriptionY = 309 + (titleText.lines.length - 1) * titleText.lineHeight

  return `
    <rect width="1200" height="630" fill="${COLORS.background}" />
    <rect x="0" y="0" width="266" height="630" fill="${COLORS.surface}" />
    <line x1="266" y1="0" x2="266" y2="630" stroke="${COLORS.border}" stroke-width="2" />
    <text x="60" y="86" class="sans" fill="${COLORS.bronze}" font-size="14" font-weight="700" letter-spacing="2">GUIDE INDEX</text>
    <text x="60" y="151" class="sans" fill="${COLORS.foreground}" font-size="22" font-weight="700" letter-spacing="1.4">${escapeXml(section.toUpperCase())}</text>
    <line x1="60" y1="184" x2="206" y2="184" stroke="${COLORS.border}" stroke-width="2" />
    ${textLines(
      wordsToLines(detail, 17, 6),
      60,
      226,
      27,
      `class="sans" fill="${COLORS.muted}" font-size="17" font-weight="700"`,
    )}
    <text x="60" y="574" class="sans" fill="${COLORS.bronze}" font-size="16">thersguide.com</text>
    ${siteBrand(318, 84)}
    <text x="1128" y="82" class="sans" fill="${COLORS.muted}" font-size="15" letter-spacing="1.2" text-anchor="end">PRACTICAL RUNESCAPE GUIDES</text>
    ${textLines(
      titleText.lines,
      318,
      216,
      titleText.lineHeight,
      `class="display" fill="${COLORS.foreground}" font-size="${titleText.size}" font-weight="700"`,
    )}
    ${textLines(
      descriptionLines,
      321,
      descriptionY,
      33,
      `class="sans" fill="${COLORS.muted}" font-size="24"`,
    )}
    <line x1="318" y1="520" x2="1128" y2="520" stroke="${COLORS.border}" stroke-width="2" />
  `
}

export const openGraphImagePath = (route) => {
  const slug = route.split('/').filter(Boolean).join('-') || 'home'
  return `/og/${slug}.png`
}

export async function renderOpenGraphSvg({
  root,
  title,
  description,
  section,
  detail,
}) {
  const fontPath = path.join(root, 'public', 'fonts', 'cinzel-variable-latin.woff2')
  const fontData = (await fs.readFile(fontPath)).toString('base64')
  const normalizedTitle = String(title).trim() || 'The RS Guide'
  const artwork = renderArtwork({
    title: normalizedTitle,
    description: String(description).trim(),
    section: String(section).trim() || 'RuneScape Guides',
    detail: String(detail).trim(),
  })

  return `
    <svg width="${OPEN_GRAPH_IMAGE_WIDTH}" height="${OPEN_GRAPH_IMAGE_HEIGHT}" viewBox="0 0 ${OPEN_GRAPH_IMAGE_WIDTH} ${OPEN_GRAPH_IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(normalizedTitle)} preview">
      <defs>
        <style>
          @font-face {
            font-family: Cinzel;
            src: url(data:font/woff2;base64,${fontData}) format('woff2');
            font-weight: 400 900;
          }
          .brand, .display { font-family: Cinzel, Georgia, serif; }
          .sans { font-family: Arial, Helvetica, sans-serif; }
        </style>
      </defs>
      ${artwork}
    </svg>
  `
}

export async function generateOpenGraphImage({
  root,
  outputDirectory,
  title,
  description,
  section,
  detail,
}) {
  const svg = await renderOpenGraphSvg({
    root,
    title,
    description,
    section,
    detail,
  })

  await fs.mkdir(path.dirname(outputDirectory), { recursive: true })
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toFile(outputDirectory)
}
