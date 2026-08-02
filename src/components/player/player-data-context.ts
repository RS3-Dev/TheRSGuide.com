import { createContext, useContext } from "react"

import type { PlayerProfile } from "@/lib/player-profile"

interface PlayerDataContextValue {
  playerData: PlayerProfile | null
  loading: boolean
  error: string | null
  lastSearch: string
  searchPlayer: (username: string) => Promise<void>
  getSkillLevel: (skillName: string) => number | null
  isQuestComplete: (questName: string) => boolean | null
}

const PlayerDataContext =
  createContext<PlayerDataContextValue | undefined>(undefined)

function usePlayerData() {
  const context = useContext(PlayerDataContext)
  if (context === undefined) {
    throw new Error("usePlayerData must be used within a PlayerDataProvider")
  }
  return context
}

export {
  PlayerDataContext,
  usePlayerData,
  type PlayerDataContextValue,
}

export type {
  PlayerProfile as PlayerData,
  PlayerQuest as QuestStatus,
  PlayerSkill as SkillLevel,
} from "@/lib/player-profile"
