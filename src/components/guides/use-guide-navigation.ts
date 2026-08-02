import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router"

import { guideSections } from "@/lib/content"
import {
  createGuideNavigationModel,
  type GuideNavigationModel,
} from "@/lib/guide-navigation"

type GuideNavigationViewModel = GuideNavigationModel & {
  setOpen: (key: string, open: boolean) => void
}

function useGuideNavigation(): GuideNavigationViewModel {
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() =>
    createGuideNavigationModel({
      sections: guideSections,
      pathname,
      expanded: new Set(),
      flattened: false,
      syncActive: true,
    }).expanded
  )

  useEffect(() => {
    setExpanded(
      (current) =>
        createGuideNavigationModel({
          sections: guideSections,
          pathname,
          expanded: current,
          flattened: false,
          syncActive: true,
        }).expanded
    )
  }, [pathname])

  const model = useMemo(
    () =>
      createGuideNavigationModel({
        sections: guideSections,
        pathname,
        expanded,
        flattened: false,
      }),
    [expanded, pathname]
  )

  return {
    ...model,
    setOpen: (key, open) => {
      setExpanded((current) => {
        if (current.has(key) === open) return current
        const next = new Set(current)
        if (open) next.add(key)
        else next.delete(key)
        return next
      })
    },
  }
}

export { useGuideNavigation, type GuideNavigationViewModel }
