const PICK_STATS_ORIGIN = process.env.SHARES_API_ORIGIN
  ?? 'https://rs3leagues-share-worker.thejonesofjustice.workers.dev'
const PICK_STATS_PATH = /^\/api\/pick-stats(?:\?.*)?$/

const sendJson = (res, status, body) => {
  res.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
  })
  res.end(JSON.stringify(body))
}
export async function handlePickStatsApi(req, res) {
  const requestPath = req.url ?? ''
  if (!PICK_STATS_PATH.test(requestPath)) {
    return sendJson(res, 404, { error: 'Pick statistics not found' })
  }
  if (req.method !== 'GET') {
    res.setHeader('allow', 'GET')
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  try {
    const response = await fetch(`${PICK_STATS_ORIGIN}${requestPath}`, {
      headers: { accept: 'application/json' },
      method: 'GET',
    })
    const responseBody = Buffer.from(await response.arrayBuffer())
    res.writeHead(response.status, {
      'cache-control': response.headers.get('cache-control') ?? 'no-store',
      'content-type': response.headers.get('content-type')
        ?? 'application/json; charset=utf-8',
    })
    res.end(responseBody)
  } catch {
    return sendJson(res, 502, { error: 'Pick statistics are unavailable' })
  }
}
