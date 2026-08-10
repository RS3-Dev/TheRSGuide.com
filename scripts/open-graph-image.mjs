import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

export const OPEN_GRAPH_IMAGE_WIDTH = 1200
export const OPEN_GRAPH_IMAGE_HEIGHT = 630

export const OPEN_GRAPH_IMAGE_VARIANTS = Object.freeze([
  'editorial-rail',
  'parchment-window',
  'wayfinder',
  'chapter-index',
  'rs-monogram',
])

// Switching this value changes only the rendered artwork. Routes, metadata, and
// the separate Leagues build-share canvas keep their existing behavior.
export const DEFAULT_OPEN_GRAPH_IMAGE_VARIANT = 'chapter-index'

const COLORS = Object.freeze({
  background: '#0a0908',
  border: '#4a3926',
  bronze: '#cc9a63',
  bronzeDark: '#8f6842',
  foreground: '#efe4d2',
  leaguesBalance: '#5aa047',
  leaguesChaos: '#e3483e',
  leaguesOrder: '#4c82e8',
  muted: '#ad9b86',
  paper: '#e4dbce',
  paperDark: '#c9bcaa',
  paperInk: '#2a2520',
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

const titleLayout = (title, options = {}) => {
  const {
    compactAt = 38,
    compactCharacters = 26,
    compactSize = 52,
    lineHeight = 66,
    maximumLines = 3,
    regularCharacters = 22,
    regularSize = 66,
  } = options
  const compact = title.length > compactAt
  return {
    lineHeight,
    lines: wordsToLines(
      title,
      compact ? compactCharacters : regularCharacters,
      maximumLines,
    ),
    size: compact ? compactSize : regularSize,
  }
}

const leagueAccent = (isLeagues) => isLeagues
  ? `<g aria-label="Leagues paths">
      <rect x="0" y="0" width="400" height="8" fill="${COLORS.leaguesChaos}" />
      <rect x="400" y="0" width="400" height="8" fill="${COLORS.leaguesBalance}" />
      <rect x="800" y="0" width="400" height="8" fill="${COLORS.leaguesOrder}" />
    </g>`
  : `<rect x="0" y="0" width="1200" height="8" fill="${COLORS.bronze}" />`

const siteBrand = ({ fill = COLORS.foreground, x = 72, y = 76 } = {}) =>
  `<text x="${x}" y="${y}" class="brand" fill="${fill}" font-size="23" font-weight="750" letter-spacing="2.1">THE <tspan fill="${COLORS.bronze}">RS</tspan> GUIDE</text>`

const leaguePathMarks = (isLeagues, x, y, size = 12) => isLeagues
  ? `<g transform="translate(${x} ${y})" aria-hidden="true">
      <circle cx="0" cy="0" r="${size}" fill="${COLORS.leaguesChaos}" />
      <circle cx="${size * 2.5}" cy="0" r="${size}" fill="${COLORS.leaguesBalance}" />
      <circle cx="${size * 5}" cy="0" r="${size}" fill="${COLORS.leaguesOrder}" />
    </g>`
  : ''

const editorialRail = ({ title, description, section, detail, isLeagues }) => {
  const titleText = titleLayout(title, {
    compactAt: 35,
    compactCharacters: 27,
    compactSize: 54,
    regularCharacters: 23,
    regularSize: 70,
    lineHeight: 72,
  })
  const descriptionLines = wordsToLines(description, 51, 3)
  const descriptionY = 235 + (titleText.lines.length - 1) * titleText.lineHeight

  return `
    <defs>
      <linearGradient id="editorial-background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1b1611" />
        <stop offset=".62" stop-color="${COLORS.background}" />
        <stop offset="1" stop-color="#100d0b" />
      </linearGradient>
      <radialGradient id="editorial-glow" cx="88%" cy="13%" r="72%">
        <stop offset="0" stop-color="${COLORS.bronze}" stop-opacity=".18" />
        <stop offset="1" stop-color="${COLORS.bronze}" stop-opacity="0" />
      </radialGradient>
      <pattern id="editorial-grid" width="52" height="52" patternUnits="userSpaceOnUse">
        <path d="M 52 0 L 0 0 0 52" fill="none" stroke="${COLORS.bronze}" stroke-opacity=".045" />
      </pattern>
    </defs>
    <rect width="1200" height="630" fill="url(#editorial-background)" />
    <rect width="1200" height="630" fill="url(#editorial-glow)" />
    <rect width="1200" height="630" fill="url(#editorial-grid)" />
    ${leagueAccent(isLeagues)}
    <rect x="72" y="54" width="4" height="522" rx="2" fill="${COLORS.bronze}" />
    ${siteBrand({ x: 108, y: 82 })}
    <text x="1092" y="80" class="sans" fill="${COLORS.bronze}" font-size="18" font-weight="700" letter-spacing="2" text-anchor="end">${escapeXml(section.toUpperCase())}</text>
    ${leaguePathMarks(isLeagues, 958, 113, 7)}
    ${textLines(
      titleText.lines,
      108,
      184,
      titleText.lineHeight,
      `class="display" fill="${COLORS.foreground}" font-size="${titleText.size}" font-weight="700"`,
    )}
    ${textLines(
      descriptionLines,
      111,
      descriptionY,
      34,
      `class="sans" fill="${COLORS.muted}" font-size="25"`,
    )}
    <line x1="108" y1="515" x2="1092" y2="515" stroke="${COLORS.border}" stroke-width="2" />
    <text x="108" y="558" class="sans" fill="${COLORS.bronze}" font-size="17" font-weight="700" letter-spacing="1.2">${escapeXml(detail.toUpperCase())}</text>
    <text x="1092" y="558" class="sans" fill="${COLORS.muted}" font-size="18" text-anchor="end">thersguide.com</text>
  `
}

const parchmentWindow = ({ title, description, section, detail, isLeagues }) => {
  const titleText = titleLayout(title, {
    compactAt: 34,
    compactCharacters: 24,
    compactSize: 48,
    regularCharacters: 20,
    regularSize: 62,
    lineHeight: 62,
  })
  const descriptionLines = wordsToLines(description, 43, 3)
  const descriptionY = 286 + (titleText.lines.length - 1) * titleText.lineHeight

  return `
    <defs>
      <linearGradient id="paper-background" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f0e9df" />
        <stop offset="1" stop-color="${COLORS.paper}" />
      </linearGradient>
      <linearGradient id="paper-window" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#18130f" />
        <stop offset="1" stop-color="${COLORS.background}" />
      </linearGradient>
      <filter id="paper-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#3a2b1d" flood-opacity=".28" />
      </filter>
    </defs>
    <rect width="1200" height="630" fill="url(#paper-background)" />
    ${leagueAccent(isLeagues)}
    <rect x="56" y="48" width="1088" height="534" rx="5" fill="none" stroke="${COLORS.paperDark}" stroke-width="2" />
    <text x="82" y="90" class="brand" fill="${COLORS.paperInk}" font-size="22" font-weight="750" letter-spacing="2">THE <tspan fill="${COLORS.bronzeDark}">RS</tspan> GUIDE</text>
    <text x="1118" y="90" class="sans" fill="${COLORS.bronzeDark}" font-size="16" font-weight="700" letter-spacing="1.8" text-anchor="end">${escapeXml(section.toUpperCase())}</text>
    <rect x="82" y="123" width="828" height="417" rx="3" fill="url(#paper-window)" filter="url(#paper-shadow)" />
    <rect x="82" y="123" width="9" height="417" fill="${COLORS.bronze}" />
    ${textLines(
      titleText.lines,
      130,
      205,
      titleText.lineHeight,
      `class="display" fill="${COLORS.foreground}" font-size="${titleText.size}" font-weight="700"`,
    )}
    ${textLines(
      descriptionLines,
      132,
      descriptionY,
      31,
      `class="sans" fill="${COLORS.muted}" font-size="23"`,
    )}
    <line x1="948" y1="123" x2="948" y2="540" stroke="${COLORS.paperDark}" stroke-width="2" />
    <text x="981" y="161" class="sans" fill="${COLORS.bronzeDark}" font-size="14" font-weight="700" letter-spacing="1.6">FIELD NOTE</text>
    <text x="981" y="227" class="display" fill="${COLORS.paperInk}" font-size="76" font-weight="700">RS</text>
    <line x1="981" y1="252" x2="1098" y2="252" stroke="${COLORS.paperDark}" stroke-width="2" />
    ${leaguePathMarks(isLeagues, 992, 289, 8)}
    ${textLines(
      wordsToLines(detail, 18, 5),
      981,
      isLeagues ? 344 : 305,
      27,
      `class="sans" fill="#6b5f52" font-size="17" font-weight="700"`,
    )}
    <text x="1118" y="556" class="sans" fill="#6b5f52" font-size="17" text-anchor="end">thersguide.com</text>
  `
}

const wayfinder = ({ title, description, section, detail, isLeagues }) => {
  const titleText = titleLayout(title, {
    compactAt: 31,
    compactCharacters: 23,
    compactSize: 48,
    regularCharacters: 19,
    regularSize: 62,
    lineHeight: 62,
  })
  const descriptionLines = wordsToLines(description, 49, 2)
  const descriptionY = 303 + (titleText.lines.length - 1) * titleText.lineHeight

  return `
    <defs>
      <linearGradient id="wayfinder-background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#080706" />
        <stop offset=".55" stop-color="#15110d" />
        <stop offset="1" stop-color="#080706" />
      </linearGradient>
      <radialGradient id="wayfinder-glow" cx="84%" cy="48%" r="42%">
        <stop offset="0" stop-color="${COLORS.bronze}" stop-opacity=".19" />
        <stop offset="1" stop-color="${COLORS.bronze}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#wayfinder-background)" />
    <rect width="1200" height="630" fill="url(#wayfinder-glow)" />
    ${leagueAccent(isLeagues)}
    <rect x="38" y="38" width="1124" height="554" fill="none" stroke="${COLORS.border}" stroke-width="2" />
    <rect x="52" y="52" width="1096" height="526" fill="none" stroke="${COLORS.border}" stroke-opacity=".65" />
    ${siteBrand({ x: 78, y: 92 })}
    <rect x="78" y="121" width="139" height="32" rx="16" fill="${COLORS.surface}" stroke="${COLORS.border}" />
    <text x="147.5" y="143" class="sans" fill="${COLORS.bronze}" font-size="13" font-weight="700" letter-spacing="1.5" text-anchor="middle">${escapeXml(section.toUpperCase())}</text>
    ${textLines(
      titleText.lines,
      78,
      221,
      titleText.lineHeight,
      `class="display" fill="${COLORS.foreground}" font-size="${titleText.size}" font-weight="700"`,
    )}
    ${textLines(
      descriptionLines,
      81,
      descriptionY,
      34,
      `class="sans" fill="${COLORS.muted}" font-size="24"`,
    )}
    <g transform="translate(944 310)" aria-hidden="true">
      <circle r="142" fill="none" stroke="${COLORS.border}" stroke-width="2" />
      <circle r="116" fill="${COLORS.surface}" fill-opacity=".56" stroke="${COLORS.bronze}" stroke-opacity=".42" />
      <circle r="72" fill="none" stroke="${COLORS.border}" stroke-width="2" />
      <path d="M0 -166 V-92 M0 92 V166 M-166 0 H-92 M92 0 H166" stroke="${COLORS.bronze}" stroke-width="3" />
      <path d="M0 -92 L17 -17 L92 0 L17 17 L0 92 L-17 17 L-92 0 L-17 -17 Z" fill="${COLORS.bronze}" fill-opacity=".18" stroke="${COLORS.bronze}" stroke-width="2" />
      <text x="0" y="18" class="brand" fill="${COLORS.foreground}" font-size="52" font-weight="750" text-anchor="middle">RS</text>
    </g>
    ${leaguePathMarks(isLeagues, 882, 492, 8)}
    <line x1="78" y1="518" x2="682" y2="518" stroke="${COLORS.border}" stroke-width="2" />
    <text x="78" y="555" class="sans" fill="${COLORS.bronze}" font-size="16" font-weight="700" letter-spacing="1">${escapeXml(detail.toUpperCase())}</text>
    <text x="1122" y="555" class="sans" fill="${COLORS.muted}" font-size="17" text-anchor="end">thersguide.com</text>
  `
}

const chapterIndex = ({ title, description, section, detail }) => {
  const titleText = titleLayout(title, {
    compactAt: 38,
    compactCharacters: 29,
    compactSize: 50,
    regularCharacters: 25,
    regularSize: 64,
    lineHeight: 64,
  })
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
    ${siteBrand({ x: 318, y: 84 })}
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

const rsMonogram = ({ title, description, section, detail, isLeagues }) => {
  const titleText = titleLayout(title, {
    compactAt: 34,
    compactCharacters: 24,
    compactSize: 48,
    regularCharacters: 20,
    regularSize: 64,
    lineHeight: 64,
  })
  const descriptionLines = wordsToLines(description, 43, 3)
  const descriptionY = 293 + (titleText.lines.length - 1) * titleText.lineHeight

  return `
    <defs>
      <linearGradient id="monogram-background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1c1610" />
        <stop offset=".46" stop-color="${COLORS.background}" />
        <stop offset="1" stop-color="#160f0b" />
      </linearGradient>
      <linearGradient id="monogram-panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${COLORS.bronze}" stop-opacity=".2" />
        <stop offset="1" stop-color="${COLORS.bronze}" stop-opacity=".025" />
      </linearGradient>
      <clipPath id="monogram-clip">
        <path d="M760 8 H1200 V630 H632 Z" />
      </clipPath>
    </defs>
    <rect width="1200" height="630" fill="url(#monogram-background)" />
    ${leagueAccent(isLeagues)}
    <path d="M760 8 H1200 V630 H632 Z" fill="url(#monogram-panel)" />
    <line x1="760" y1="8" x2="632" y2="630" stroke="${COLORS.bronze}" stroke-opacity=".48" stroke-width="2" />
    <g clip-path="url(#monogram-clip)" opacity=".12" aria-hidden="true">
      <text x="738" y="515" class="brand" fill="${COLORS.bronze}" font-size="410" font-weight="800">RS</text>
    </g>
    ${siteBrand({ x: 72, y: 83 })}
    <rect x="72" y="118" width="${Math.max(150, section.length * 12 + 48)}" height="36" fill="${COLORS.bronze}" />
    <text x="94" y="142" class="sans" fill="${COLORS.background}" font-size="14" font-weight="800" letter-spacing="1.7">${escapeXml(section.toUpperCase())}</text>
    ${leaguePathMarks(isLeagues, 916, 82, 8)}
    ${textLines(
      titleText.lines,
      72,
      231,
      titleText.lineHeight,
      `class="display" fill="${COLORS.foreground}" font-size="${titleText.size}" font-weight="700"`,
    )}
    ${textLines(
      descriptionLines,
      75,
      descriptionY,
      32,
      `class="sans" fill="${COLORS.muted}" font-size="23"`,
    )}
    <line x1="72" y1="510" x2="699" y2="510" stroke="${COLORS.border}" stroke-width="2" />
    <text x="72" y="551" class="sans" fill="${COLORS.bronze}" font-size="16" font-weight="700" letter-spacing="1.1">${escapeXml(detail.toUpperCase())}</text>
    <text x="1128" y="574" class="sans" fill="${COLORS.foreground}" font-size="17" font-weight="700" text-anchor="end">THERSGUIDE.COM</text>
  `
}

const variantRenderers = Object.freeze({
  'editorial-rail': editorialRail,
  'parchment-window': parchmentWindow,
  wayfinder,
  'chapter-index': chapterIndex,
  'rs-monogram': rsMonogram,
})

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
  variant = DEFAULT_OPEN_GRAPH_IMAGE_VARIANT,
}) {
  const renderVariant = variantRenderers[variant]
  if (!renderVariant) {
    throw new Error(`Unknown Open Graph image variant: ${variant}`)
  }

  const fontPath = path.join(root, 'public', 'fonts', 'cinzel-variable-latin.woff2')
  const fontData = (await fs.readFile(fontPath)).toString('base64')
  const isLeagues = String(section).trim().toLowerCase() === 'leagues'
  const artwork = renderVariant({
    title: String(title).trim() || 'The RS Guide',
    description: String(description).trim(),
    section: String(section).trim() || 'RuneScape Guides',
    detail: String(detail).trim(),
    isLeagues,
  })

  return `
    <svg width="${OPEN_GRAPH_IMAGE_WIDTH}" height="${OPEN_GRAPH_IMAGE_HEIGHT}" viewBox="0 0 ${OPEN_GRAPH_IMAGE_WIDTH} ${OPEN_GRAPH_IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(title)} preview">
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
  variant = DEFAULT_OPEN_GRAPH_IMAGE_VARIANT,
}) {
  const svg = await renderOpenGraphSvg({
    root,
    title,
    description,
    section,
    detail,
    variant,
  })

  await fs.mkdir(path.dirname(outputDirectory), { recursive: true })
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toFile(outputDirectory)
}
