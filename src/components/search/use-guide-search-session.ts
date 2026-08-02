import { useEffect, useMemo, useState } from "react"

import { guideSearch, loadGuideSearch } from "@/lib/content"

type UseGuideSearchSessionOptions = {
  active: boolean
  pathScope?: string
  browseLimit?: number
  searchLimit: number
}

function useGuideSearchSession({
  active,
  pathScope,
  browseLimit = 0,
  searchLimit,
}: UseGuideSearchSessionOptions) {
  const [query, setQuery] = useState("")
  const [searchIndex, setSearchIndex] = useState(guideSearch)
  const [loading, setLoading] = useState(false)
  const normalizedQuery = query.trim()
  const shouldLoad = active && (Boolean(normalizedQuery) || browseLimit > 0)

  useEffect(() => {
    if (!shouldLoad) return
    let cancelled = false
    setLoading(true)
    void loadGuideSearch()
      .then((index) => {
        if (!cancelled) setSearchIndex(index)
      })
      .catch(() => {
        // The metadata-only index remains available when the corpus chunk fails.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [shouldLoad])

  const results = useMemo(() => {
    if (!active) return []
    if (!normalizedQuery) {
      return browseLimit > 0 ? searchIndex.browse(browseLimit, pathScope) : []
    }
    return searchIndex.search(query, searchLimit, pathScope)
  }, [
    active,
    browseLimit,
    normalizedQuery,
    pathScope,
    query,
    searchIndex,
    searchLimit,
  ])

  return {
    query,
    setQuery,
    hasQuery: Boolean(normalizedQuery),
    results,
    loading,
  }
}

export { useGuideSearchSession, type UseGuideSearchSessionOptions }
