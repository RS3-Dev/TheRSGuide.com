import { useEffect, useRef } from "react"

import { GuideArticle } from "@/components/guides/guide-article"
import { GuideBreadcrumbs } from "@/components/guides/guide-breadcrumbs"
import {
  GuideSidebar,
  GuideSidebarExpandTrigger,
} from "@/components/guides/guide-sidebar"
import { GuidePagination } from "@/components/guides/guide-pagination"
import { GuideTableOfContents } from "@/components/guides/guide-table-of-contents"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { Doc } from "@/lib/content"
import { functionalStorageAllowed } from "@/lib/privacy-preferences"
import { cn } from "@/lib/utils"

function GuideLayout({ doc }: { doc: Doc }) {
  const contentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [doc])

  const sidebarDefaultOpen =
    !functionalStorageAllowed() ||
    !document.cookie.includes("sidebar_state=false")

  return (
    <SidebarProvider
      defaultOpen={sidebarDefaultOpen}
      collapseBreakpoint={1100}
      className="min-h-[calc(100svh-4rem)]"
    >
      <GuideSidebar />
      <SidebarInset>
        <GuideSidebarExpandTrigger />
        <div
          className={cn(
            "mx-auto grid w-full grid-cols-[minmax(0,1fr)_13rem] gap-12 px-6 max-[1101px]:grid-cols-[minmax(0,1fr)] max-[768px]:block max-[768px]:px-4",
            doc.hasTableOfContents
              ? "max-w-[80rem]"
              : "max-w-none grid-cols-[minmax(0,1fr)] min-[1101px]:px-16"
          )}
          data-has-table-of-contents={
            doc.hasTableOfContents ? "true" : "false"
          }
        >
          <main
            className={cn(
              "mx-auto w-full min-w-0 max-w-[50rem] pt-8 pb-16 max-[768px]:pt-5",
              !doc.hasTableOfContents && "max-w-none"
            )}
          >
            <GuideBreadcrumbs doc={doc} />
            <GuideArticle doc={doc} contentRef={contentRef} />
            <Separator />
            <GuidePagination doc={doc} />
          </main>
          <GuideTableOfContents doc={doc} contentRef={contentRef} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { GuideLayout }
