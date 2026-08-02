import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useLocation } from "react-router"

import { GuideSearchDialog } from "@/components/search/guide-search-dialog"
import { GuideSearchDialogContext } from "@/components/search/guide-search-context"

function GuideSearchProvider({ children }: PropsWithChildren) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const landingSearchFocusRef = useRef<(() => void) | null>(null)
  const normalizedPathname =
    pathname === "/" ? pathname : pathname.replace(/\/+$/, "")

  const openSearch = useCallback(() => setOpen(true), [])
  const closeSearch = useCallback(() => setOpen(false), [])
  const registerLandingSearch = useCallback((focus: (() => void) | null) => {
    landingSearchFocusRef.current = focus
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return
      }

      if (normalizedPathname === "/") {
        event.preventDefault()
        landingSearchFocusRef.current?.()
        return
      }

      event.preventDefault()
      openSearch()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [normalizedPathname, openSearch])

  useEffect(() => {
    closeSearch()
  }, [closeSearch, pathname])

  const value = useMemo(
    () => ({ openSearch, closeSearch, registerLandingSearch }),
    [closeSearch, openSearch, registerLandingSearch]
  )

  return (
    <GuideSearchDialogContext.Provider value={value}>
      {children}
      <GuideSearchDialog open={open} onOpenChange={setOpen} />
    </GuideSearchDialogContext.Provider>
  )
}

export { GuideSearchProvider }
