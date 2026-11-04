const HISCORES = 'https://secure.runescape.com/m=hiscore/index_lite.json'
const PLAYER_QUESTS = 'https://secure.runescape.com/m=adventurers-log/api/v1/playerQuests'
const headers = { accept: 'application/json', 'user-agent': 'thersguide.com player lookup' }
const cache = new Map()
const pending = new Map()
const CACHE_TTL_MS = 60_000
const MAX_CACHE_ENTRIES = 100

const send = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

async function fetchPlayer(username) {
  const user = encodeURIComponent(username)
  const [profileResponse, questResponse] = await Promise.all([
    fetch(`${HISCORES}?player=${user}`, { headers, signal: AbortSignal.timeout(10_000) }),
    fetch(`${PLAYER_QUESTS}/${user}`, { headers, signal: AbortSignal.timeout(10_000) }),
  ])
  if (profileResponse.status === 404) {
    return { status: 404, body: { error: 'Player not found in Hiscores. They may be unranked or hidden from public view' } }
  }
  if (!profileResponse.ok) return { status: 502, body: { error: 'Failed to fetch player skills' } }
  const profile = await profileResponse.json()
  const questPayload = await questResponse.json()
  if (!profile || !Array.isArray(profile.skills)) throw new Error('Invalid Hiscores response')
  // Hiscores players can lack public quest data. Preserve skills and leave quests unknown.
  const questsUnavailable = !questResponse.ok
    && ['PLAYER_NOT_FOUND', 'PLAYER_NOT_MEMBER'].includes(questPayload?.error)
    && [403, 404].includes(questResponse.status)
  if (!questResponse.ok && !questsUnavailable) {
    return { status: 502, body: { error: 'Failed to fetch player quests' } }
  }
  if (!questsUnavailable && (!questPayload?.quests || typeof questPayload.quests !== 'object'
    || Array.isArray(questPayload.quests))) throw new Error('Invalid quest response')
  return {
    status: 200,
    body: {
      name: questsUnavailable ? profile.name : questPayload.name,
      skills: profile.skills,
      quests: questsUnavailable ? null : questPayload.quests,
    },
  }
}

export async function handlePlayerApi(req, res) {
  let username
  try {
    username = decodeURIComponent((req.url?.split('/api/player/')[1] ?? '').split('?')[0]).trim()
  } catch {
    return send(res, 400, { error: 'Invalid username' })
  }
  if (!username) return send(res, 400, { error: 'Username is required' })
  if (!/^[a-zA-Z0-9 _]{1,12}$/.test(username)) return send(res, 400, { error: 'Invalid RuneScape display name' })
  const key = username.toLowerCase().replaceAll('_', ' ')
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) return send(res, 200, cached.body)
  try {
    let request = pending.get(key)
    if (!request) {
      request = fetchPlayer(username).then((result) => {
        if (result.status === 200) {
          cache.delete(key)
          if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value)
          cache.set(key, { body: result.body, expires: Date.now() + CACHE_TTL_MS })
        }
        return result
      }).finally(() => pending.delete(key))
      pending.set(key, request)
    }
    const { status, body } = await request
    return send(res, status, body)
  } catch {
    return send(res, 502, { error: 'Failed to fetch player data' })
  }
}
