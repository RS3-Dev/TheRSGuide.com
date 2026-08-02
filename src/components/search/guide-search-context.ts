import { createContext, useContext } from "react"

type GuideSearchDialogContextValue = {
  openSearch: () => void
  closeSearch: () => void
  registerLandingSearch: (focus: (() => void) | null) => void
}

const GuideSearchDialogContext =
  createContext<GuideSearchDialogContextValue | null>(null)

function useGuideSearchDialog() {
  const context = useContext(GuideSearchDialogContext)
  if (!context) {
    throw new Error(
      "useGuideSearchDialog must be used within GuideSearchProvider"
    )
  }
  return context
}

export {
  GuideSearchDialogContext,
  useGuideSearchDialog,
  type GuideSearchDialogContextValue,
}
