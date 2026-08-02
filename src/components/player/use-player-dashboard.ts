import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router"

import { usePlayerData } from "@/components/player/player-data-context"
import {
  evaluateProgression,
  type EvaluatedRecommendation,
} from "@/lib/player-progression"
import type { PlayerProfile } from "@/lib/player-profile"
import { browserPlayerStorage } from "@/lib/player-storage"

const EMPTY_MANUAL_COMPLETIONS = new Set<string>()

type PlayerDashboardState = {
  requestedUsername: string
  visiblePlayerData: PlayerProfile | null
  loading: boolean
  error: string | null
  recommendations: EvaluatedRecommendation[]
  setManualCompletion: (path: string, completed: boolean) => void
}

function usePlayerDashboard(): PlayerDashboardState {
  const [searchParams] = useSearchParams()
  const requestedUsername = searchParams.get("username")?.trim() ?? ""
  const { playerData, loading, error, searchPlayer } = usePlayerData()
  const requestedRef = useRef("")
  const visiblePlayerData =
    playerData &&
    (!requestedUsername ||
      playerData.username.toLowerCase() === requestedUsername.toLowerCase())
      ? playerData
      : null
  const [manualCompletions, setManualCompletions] = useState<{
    username: string
    paths: Set<string>
  }>({
    username: "",
    paths: new Set(),
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [visiblePlayerData])

  useEffect(() => {
    if (!requestedUsername || visiblePlayerData) return
    if (
      requestedRef.current.toLowerCase() === requestedUsername.toLowerCase()
    ) {
      return
    }
    requestedRef.current = requestedUsername
    void searchPlayer(requestedUsername)
  }, [requestedUsername, searchPlayer, visiblePlayerData])

  useEffect(() => {
    if (!visiblePlayerData) return
    const username = visiblePlayerData.username.toLowerCase()
    setManualCompletions({
      username,
      paths: new Set(browserPlayerStorage.loadManualCompletions(username)),
    })
  }, [visiblePlayerData])

  const activeManualCompletions =
    visiblePlayerData &&
    manualCompletions.username === visiblePlayerData.username.toLowerCase()
      ? manualCompletions.paths
      : EMPTY_MANUAL_COMPLETIONS
  const recommendations = useMemo(
    () =>
      visiblePlayerData
        ? evaluateProgression(visiblePlayerData, activeManualCompletions)
        : [],
    [activeManualCompletions, visiblePlayerData]
  )

  const setManualCompletion = (path: string, completed: boolean) => {
    if (!visiblePlayerData) return
    const username = visiblePlayerData.username.toLowerCase()
    setManualCompletions((current) => {
      const paths = new Set(current.username === username ? current.paths : [])
      if (completed) paths.add(path)
      else paths.delete(path)
      browserPlayerStorage.saveManualCompletions(username, paths)
      return { username, paths }
    })
  }

  return {
    requestedUsername,
    visiblePlayerData,
    loading,
    error,
    recommendations,
    setManualCompletion,
  }
}

export { usePlayerDashboard, type PlayerDashboardState }
