import type { PropsWithChildren } from "react"
import { useLocation } from "react-router"

import { SiteHeader } from "@/components/site/site-header"
import { guideCatalog } from "@/lib/content"

function SiteShell({ children }: PropsWithChildren) {
  const { pathname } = useLocation()
  const normalizedPathname =
    pathname === "/" ? pathname : pathname.replace(/\/+$/, "")
  const isLandingPage = normalizedPathname === "/"
  const hasGuideSidebar = guideCatalog.documents.some(
    (doc) => doc.path === pathname
  )

  return (
    <>
      {!isLandingPage && <SiteHeader showSettings={!hasGuideSidebar} />}
      {children}
    </>
  )
}

export { SiteShell }
