import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router"

import { usePlayerData } from "@/components/player/player-data-context"

type PlayerLookupStatus =
  | { kind: "error"; label: string }
  | { kind: "success"; label: string }
  | null

type UsePlayerLookupOptions = {
  initialValue?: string
  initialValueFromUrl?: boolean
  updateUrlOnSubmit?: boolean
  debounceMs?: number
}

function usePlayerLookup({
  initialValue,
  initialValueFromUrl = false,
  updateUrlOnSubmit = false,
  debounceMs,
}: UsePlayerLookupOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { playerData, loading, error, lastSearch, searchPlayer } =
    usePlayerData()
  const urlUsername = initialValueFromUrl
    ? searchParams.get("username")?.trim() ?? ""
    : ""
  const explicitValue = initialValue ?? urlUsername
  const [value, setValue] = useState(explicitValue || lastSearch)
  const userEditedRef = useRef(false)
  const previousExplicitValueRef = useRef(explicitValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPendingLookup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => clearPendingLookup, [clearPendingLookup])

  useEffect(() => {
    if (previousExplicitValueRef.current === explicitValue) return
    previousExplicitValueRef.current = explicitValue
    if (!explicitValue) return
    userEditedRef.current = false
    setValue(explicitValue)
  }, [explicitValue])

  useEffect(() => {
    if (!lastSearch || value || userEditedRef.current) return
    setValue(lastSearch)
  }, [lastSearch, value])

  const runLookup = useCallback(
    (username: string) => {
      const normalizedUsername = username.trim()
      if (!normalizedUsername) return

      clearPendingLookup()
      if (updateUrlOnSubmit) {
        const currentUsername = searchParams.get("username")?.trim() ?? ""
        setSearchParams({ username: normalizedUsername })
        if (
          currentUsername.toLowerCase() !== normalizedUsername.toLowerCase()
        ) {
          return
        }
      }

      void searchPlayer(normalizedUsername)
    },
    [
      clearPendingLookup,
      searchParams,
      searchPlayer,
      setSearchParams,
      updateUrlOnSubmit,
    ]
  )

  const changeValue = useCallback(
    (nextValue: string) => {
      userEditedRef.current = true
      setValue(nextValue)
      clearPendingLookup()
      if (debounceMs === undefined || !nextValue.trim()) return
      timerRef.current = setTimeout(() => runLookup(nextValue), debounceMs)
    },
    [clearPendingLookup, debounceMs, runLookup]
  )

  const submit = useCallback(() => runLookup(value), [runLookup, value])

  const status = useMemo<PlayerLookupStatus>(() => {
    if (error) {
      return {
        kind: "error",
        label: error === "Profile is private" ? "Private profile" : "Not found",
      }
    }
    if (playerData && !loading) {
      return { kind: "success", label: playerData.username }
    }
    return null
  }, [error, loading, playerData])

  return {
    value,
    changeValue,
    submit,
    loading,
    status,
  }
}

export { usePlayerLookup, type PlayerLookupStatus, type UsePlayerLookupOptions }
