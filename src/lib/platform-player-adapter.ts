import {
  PlayerProfileError,
  normalizeUsername,
  RUNESCAPE_SKILLS,
  type PlayerProfile,
  type PlayerProfileAdapter,
  type PlayerQuest,
  type PlayerSkill,
} from '@/lib/player-profile'

interface PlatformProfilePayload {
  name?: unknown
  skills?: unknown
  quests?: unknown
  error?: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const difficultyNames: Record<number, string> = {
  0: 'Novice', 1: 'Intermediate', 2: 'Experienced', 3: 'Master', 4: 'Grandmaster', 250: 'Multi',
}

const normalizeQuestStatus = (status: string) =>
  status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())

const numberValue = (value: unknown, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const mapSkill = (value: unknown): PlayerSkill | null => {
  if (!isObject(value) || typeof value.name !== 'string') return null
  const skillName = value.name.toLowerCase()
  const name = RUNESCAPE_SKILLS.find((name) => name.toLowerCase() === skillName)
  // Hiscores uses -1 for unavailable levels. Leave these requirements unknown.
  if (!name || typeof value.level !== 'number' || !Number.isFinite(value.level) || value.level < 0) return null
  return {
    name,
    level: value.level,
    xp: Math.max(0, numberValue(value.xp)),
    rank: numberValue(value.rank, -1),
  }
}

const mapQuest = ([id, value]: [string, unknown]): PlayerQuest | null => {
  if (!isObject(value) || typeof value.title !== 'string'
    || !['NOT_STARTED', 'STARTED', 'COMPLETED'].includes(String(value.status))) return null
  return {
    id,
    title: value.title,
    status: normalizeQuestStatus(String(value.status)),
    ...(typeof value.difficulty === 'number' && difficultyNames[value.difficulty]
      ? { difficulty: difficultyNames[value.difficulty] } : {}),
    ...(typeof value.members === 'boolean' ? { members: value.members } : {}),
    ...(typeof value.qp === 'number' ? { questPoints: value.qp } : {}),
    ...(typeof value.eligible === 'boolean' ? { userEligible: value.eligible } : {}),
  }
}

export const normalizePlatformProfile = (
  payload: unknown,
  requestedUsername: string,
): PlayerProfile => {
  if (!isObject(payload) || !Array.isArray(payload.skills)
    || (payload.quests != null && !isObject(payload.quests))) {
    throw new PlayerProfileError('invalid-response', 'Failed to fetch player data')
  }
  const skills = payload.skills.map(mapSkill).filter((skill): skill is PlayerSkill => skill !== null)
  if (!skills.length) throw new PlayerProfileError('invalid-response', 'No skill data is available for this player')
  const overall = payload.skills.find((value: unknown) => isObject(value) && value.name === 'Overall')
  const totalLevel = isObject(overall) && typeof overall.level === 'number'
    && Number.isFinite(overall.level) && overall.level >= 0
    ? overall.level
    : skills.reduce((total, skill) => total + skill.level, 0)
  const username = typeof payload.name === 'string' && payload.name.trim()
    ? payload.name.trim() : normalizeUsername(requestedUsername)
  const quests = isObject(payload.quests)
    ? Object.entries(payload.quests).map(mapQuest).filter((quest): quest is PlayerQuest => quest !== null)
    : null
  return { username, totalLevel, skills, quests }
}

export const platformPlayerAdapter: PlayerProfileAdapter = {
  async load(username, signal) {
    const normalizedUsername = normalizeUsername(username)
    const response = await fetch(`/api/player/${encodeURIComponent(normalizedUsername)}`, { signal })
    const payload: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const error = isObject(payload) ? (payload as PlatformProfilePayload).error : null
      if (response.status === 404) {
        throw new PlayerProfileError('not-found', typeof error === 'string' ? error : 'Player not found in Hiscores')
      }
      throw new PlayerProfileError('unavailable', typeof error === 'string' ? error : 'Failed to fetch player data')
    }
    return normalizePlatformProfile(payload, normalizedUsername)
  },
}
