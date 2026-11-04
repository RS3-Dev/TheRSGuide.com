import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const profile = { name: 'player', skills: [{ id: 0, name: 'Overall', level: 100 }] }
const quests = { name: 'Player', quests: { '257': { title: "Cook's Assistant", status: 'COMPLETED', qp: 1, eligible: true } } }
let handlePlayerApi
let fetchMock

const lookup = async (name = 'Player') => {
  let status
  let body
  const res = {
    writeHead: vi.fn((value) => { status = value }),
    end: vi.fn((value) => { body = JSON.parse(value) }),
  }
  await handlePlayerApi({ url: `/api/player/${name}` }, res)
  return { status, body }
}

beforeEach(async () => {
  vi.resetModules()
  ;({ handlePlayerApi } = await import('./player-api.mjs'))
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

const responses = (questBody = quests, questStatus = 200, profileStatus = 200) => {
  fetchMock.mockResolvedValueOnce(Response.json(profile, { status: profileStatus }))
    .mockResolvedValueOnce(Response.json(questBody, { status: questStatus }))
}

describe('Platform API player endpoint', () => {
  it('combines the documented endpoints, canonical name, skills, and quest map', async () => {
    responses()
    expect(await lookup('The%20RS%20Guy')).toEqual({ status: 200, body: { name: 'Player', skills: profile.skills, quests: quests.quests } })
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://secure.runescape.com/m=hiscore/index_lite.json?player=The%20RS%20Guy',
      'https://secure.runescape.com/m=adventurers-log/api/v1/playerQuests/The%20RS%20Guy',
    ])
    expect(fetchMock.mock.calls[0][1].headers['user-agent']).toContain('thersguide.com')
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })

  it.each(['', '%ZZ', 'TooLongPlayerName', 'Name%2Fpath'])('rejects invalid names: %s', async (name) => {
    expect((await lookup(name)).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports unranked or missing players', async () => {
    responses({}, 404, 404)
    expect(await lookup()).toMatchObject({ status: 404, body: { error: expect.stringContaining('Hiscores') } })
  })

  it.each([['PLAYER_NOT_FOUND', 404], ['PLAYER_NOT_MEMBER', 403]])('keeps skills when quests return %s', async (error, status) => {
    responses({ error }, status)
    expect(await lookup()).toEqual({ status: 200, body: { name: 'player', skills: profile.skills, quests: null } })
  })

  it.each([429, 500])('does not hide quest service errors (%i)', async (status) => {
    responses({ error: 'INTERNAL_ERROR' }, status)
    expect((await lookup()).status).toBe(502)
  })

  it('handles network and malformed JSON errors without caching failures', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(Response.json(quests))
    expect((await lookup()).status).toBe(502)
    responses({ quests: [] })
    expect((await lookup()).status).toBe(502)
    responses()
    expect((await lookup()).status).toBe(200)
  })

  it('deduplicates concurrent names and caches successful lookups for one minute', async () => {
    vi.useFakeTimers()
    responses()
    const results = await Promise.all([lookup('The_Player'), lookup('the%20player')])
    expect(results.every(({ status }) => status === 200)).toBe(true)
    await lookup('THE_PLAYER')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(60001)
    responses()
    await lookup('The_Player')
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
