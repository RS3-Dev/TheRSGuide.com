import { createReadStream, existsSync, readFile, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve, sep } from 'node:path'
import { handlePlayerApi } from './server/player-api.mjs'
import { handleFeedbackApi } from './server/feedback-api.mjs'
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

createServer((req, res) => {
  if (req.url?.startsWith('/api/player/')) return void handlePlayerApi(req, res)
  if (req.url?.startsWith('/api/feedback')) return void handleFeedbackApi(req, res)
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
    const immutableAsset = file.includes(`${sep}assets${sep}`)
    const socialImage = file.includes(`${sep}og${sep}`)
    const headers = {
      'content-type': mime[extname(file)] ?? 'application/octet-stream',
      'cache-control': immutableAsset
        ? 'public, max-age=31536000, immutable'
        : socialImage
          ? 'public, max-age=86400, stale-while-revalidate=604800'
          : 'no-cache',
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
