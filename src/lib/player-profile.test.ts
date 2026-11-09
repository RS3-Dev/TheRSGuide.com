import { afterEach, describe, expect, it, vi } from 'vitest'
import { playerQuestCompleted, playerSkillLevel } from './player-profile'
import { normalizePlatformProfile, platformPlayerAdapter } from './platform-player-adapter'

const skills = [
  { id: 0, name: 'Overall', level: 2999, xp: 123456789, rank: 1 },
  { id: 1, name: 'Attack', level: 99, xp: 13034431, rank: 123 },
  { id: 7, name: 'Magic', level: 120, xp: 200000000, rank: 42 },
]

afterEach(() => vi.unstubAllGlobals())

describe('Platform API player profiles', () => {
  it('maps skills by name, excludes Overall, and preserves quest IDs and metadata', () => {
    const profile = normalizePlatformProfile({
      name: 'The RS Guy', skills,
      quests: {
        '257': { title: 'The World Wakes', status: 'COMPLETED', qp: 3, eligible: true, difficulty: 4, members: true },
        '289': { title: 'Extinction', status: 'NOT_STARTED' },
        '307': { title: 'Other Quest', status: 'STARTED' },
      },
    }, 'requested')
    expect(profile.username).toBe('The RS Guy')
    expect(profile.totalLevel).toBe(2999)
    expect(profile.skills).toHaveLength(2)
    expect(profile.skills[0]).toEqual({ name: 'Attack', level: 99, xp: 13034431, rank: 123 })
    expect(playerSkillLevel(profile, 'magic')).toBe(120)
    expect(profile.quests?.[0]).toEqual({ id: '257', title: 'The World Wakes', status: 'Completed', questPoints: 3, userEligible: true, difficulty: 'Grandmaster', members: true })
    expect(playerQuestCompleted(profile, 'the world wakes')).toBe(true)
    expect(playerQuestCompleted(profile, 'Extinction')).toBe(false)
    expect(playerQuestCompleted(profile, 'Other Quest')).toBe(false)
    expect(playerQuestCompleted(profile, 'Missing Quest')).toBeNull()
  })

  it('matches quests reported under a shorter title', () => {
    const profile = normalizePlatformProfile({ skills, quests: {
      '1': { title: 'Fortunes', status: 'COMPLETED' },
      '2': { title: 'Helping Laniakea', status: 'NOT_STARTED' },
    } }, 'Player')
    expect(playerQuestCompleted(profile, 'Once Upon a Time in Gielinor: Fortunes')).toBe(true)
    expect(playerQuestCompleted(profile, 'Helping Laniakea (miniquest)')).toBe(false)
    expect(playerQuestCompleted(profile, 'Once Upon a Time in Gielinor: Finale')).toBeNull()
  })

  it('falls back to summed levels and requested name, leaving missing data unknown', () => {
    const profile = normalizePlatformProfile({ skills: [
      { name: 'Overall', level: -1 },
      { name: 'Attack', level: 10 },
      { name: 'Defence', level: 20 },
      { name: 'Magic', level: -1 },
      null,
    ], quests: null }, ' Player ')
    expect(profile.username).toBe('Player')
    expect(profile.totalLevel).toBe(30)
    expect(playerSkillLevel(profile, 'Magic')).toBeNull()
    expect(playerQuestCompleted(profile, 'Extinction')).toBeNull()
  })

  it('maps the older Platform API names for Constitution and Runecrafting', () => {
    const profile = normalizePlatformProfile({ skills: [
      { name: 'Hitpoints', level: 85 },
      { name: 'Runecraft', level: 60 },
    ] }, 'Player')
    expect(playerSkillLevel(profile, 'constitution')).toBe(85)
    expect(playerSkillLevel(profile, 'Runecrafting')).toBe(60)
  })

  it.each([null, {}, { skills: [] }, { skills, quests: [] }])('rejects malformed data: %j', (payload) => {
    expect(() => normalizePlatformProfile(payload, 'Player')).toThrowError(expect.objectContaining({ code: 'invalid-response' }))
  })

  it('loads through the local API with an encoded name and abort signal', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ name: 'The RS Guy', skills, quests: {} }))
    vi.stubGlobal('fetch', fetchMock)
    const signal = new AbortController().signal
    const profile = await platformPlayerAdapter.load(' The RS Guy ', signal)
    expect(fetchMock).toHaveBeenCalledWith('/api/player/The%20RS%20Guy', { signal })
    expect(profile.username).toBe('The RS Guy')
  })

  it.each([[404, 'not-found'], [502, 'unavailable'], [429, 'unavailable']])('maps HTTP %i to %s', async (status, code) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'Lookup failed' }, { status: Number(status) })))
    await expect(platformPlayerAdapter.load('Player', new AbortController().signal)).rejects.toMatchObject({ code, message: 'Lookup failed' })
  })
})
