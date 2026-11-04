import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { useSearchParams } from "react-router"

import {
  PlayerDataContext,
  type PlayerDataContextValue,
} from "@/components/player/player-data-context"
import { PlayerController } from "@/lib/player-controller"
import { playerQuestCompleted, playerSkillLevel } from "@/lib/player-profile"
import { browserPlayerStorage } from "@/lib/player-storage"
import { platformPlayerAdapter } from "@/lib/platform-player-adapter"

function PlayerDataProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams()
  const requestedUsername = searchParams.get("username")?.trim() ?? ""
  const controller = useMemo(
    () => new PlayerController(platformPlayerAdapter, browserPlayerStorage),
    []
  )
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  )

  useEffect(() => {
    controller.start(requestedUsername)
    return controller.stop
  }, [controller, requestedUsername])

  const searchPlayer = useCallback(
    async (username: string) => {
      await controller.search(username)
    },
    [controller]
  )
  const getSkillLevel = useCallback(
    (skillName: string) => playerSkillLevel(state.playerData, skillName),
    [state.playerData]
  )
  const isQuestComplete = useCallback(
    (questName: string) => playerQuestCompleted(state.playerData, questName),
    [state.playerData]
  )

  const value = useMemo<PlayerDataContextValue>(
    () => ({
      ...state,
      searchPlayer,
      getSkillLevel,
      isQuestComplete,
    }),
    [getSkillLevel, isQuestComplete, searchPlayer, state]
  )

  return (
    <PlayerDataContext.Provider value={value}>
      {children}
    </PlayerDataContext.Provider>
  )
}

export { PlayerDataProvider }
