import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import {
  PlayerDataContext,
  type PlayerDataContextValue,
} from "@/components/player/player-data-context"
import { PlayerController } from "@/lib/player-controller"
import { playerQuestCompleted, playerSkillLevel } from "@/lib/player-profile"
import { browserPlayerStorage } from "@/lib/player-storage"
import { runemetricsPlayerAdapter } from "@/lib/runemetrics-player-adapter"

function PlayerDataProvider({ children }: { children: ReactNode }) {
  const controller = useMemo(
    () => new PlayerController(runemetricsPlayerAdapter, browserPlayerStorage),
    []
  )
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  )

  useEffect(() => {
    controller.start()
    return controller.stop
  }, [controller])

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
