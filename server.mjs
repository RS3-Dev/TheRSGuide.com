import { createReadStream, existsSync, readFile, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve, sep } from 'node:path'
import { handlePlayerApi } from './server/player-api.mjs'
import { handleFeedbackApi } from './server/feedback-api.mjs'
import { handleSharesApi } from './server/shares-api.mjs'
import { handlePickStatsApi } from './server/pick-stats-api.mjs'
import { handleMediaProxy } from './server/media-proxy.mjs'
import { handleHealth, isHealthRequest } from './server/health.mjs'
import {
  requestOrigin,
  rewritePageMetadataOrigin,
} from './server/page-metadata-origin.mjs'
import {
  privacyRegionFromHeaders,
  rewritePrivacyRegion,
} from './server/privacy-region.mjs'

const root = resolve(process.cwd(), 'dist')
const mime = { '.css': 'text/css', '.html': 'text/html', '.ico': 'image/x-icon', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' }

const CONTENT_HASHED = 'public, max-age=31536000, immutable'
const LONG_LIVED = 'public, max-age=604800, stale-while-revalidate=2592000'
const DAILY = 'public, max-age=86400, stale-while-revalidate=604800'
const UNCACHEABLE = 'no-cache'

const cacheControl = (file) => {
  if (file.includes(`${sep}assets${sep}`)) return CONTENT_HASHED
  if (file.includes(`${sep}fonts${sep}`)) return LONG_LIVED
  if (file.includes(`${sep}og${sep}`)) return DAILY
  return UNCACHEABLE
}

createServer((req, res) => {
  if (isHealthRequest(req)) return void handleHealth(req, res)
  if (req.url?.startsWith('/api/player/')) return void handlePlayerApi(req, res)
  if (req.url?.startsWith('/api/feedback')) return void handleFeedbackApi(req, res)
  if (req.url?.startsWith('/api/shares')) return void handleSharesApi(req, res)
  if (req.url?.startsWith('/api/pick-stats')) return void handlePickStatsApi(req, res)
  if (req.url?.startsWith('/media-proxy/')) return void handleMediaProxy(req, res)
  try {
    const requestPath = decodeURIComponent((req.url ?? '/').split('?')[0])
    const candidate = resolve(root, `.${requestPath}`)
    const contained = candidate === root || candidate.startsWith(`${root}${sep}`)
    const directFile = contained && existsSync(candidate) && statSync(candidate).isFile()
      ? candidate
      : null
    const directoryIndex = contained
      && existsSync(candidate)
      && statSync(candidate).isDirectory()
      && existsSync(join(candidate, 'index.html'))
      ? join(candidate, 'index.html')
      : null
    const file = directFile ?? directoryIndex ?? join(root, 'index.html')
    const headers = {
      'content-type': mime[extname(file)] ?? 'application/octet-stream',
      'cache-control': cacheControl(file),
    }

    if (extname(file) === '.html') {
      readFile(file, 'utf8', (error, html) => {
        if (error) {
          res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('Unable to load page')
          return
        }
        const encrypted = Boolean(req.socket.encrypted)
        res.writeHead(200, headers)
        const deploymentHtml = rewritePageMetadataOrigin(
          html,
          requestOrigin(req.headers, encrypted),
        )
        res.end(rewritePrivacyRegion(
          deploymentHtml,
          privacyRegionFromHeaders(req.headers),
        ))
      })
      return
    }

    res.writeHead(200, headers)
    createReadStream(file).pipe(res)
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Bad request')
  }
}).listen(Number(process.env.PORT ?? 4173), () => console.log(`The RS Guide is listening on http://localhost:${process.env.PORT ?? 4173}`))
