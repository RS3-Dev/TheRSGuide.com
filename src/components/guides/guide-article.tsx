import { type RefObject, Suspense } from "react"
import { MDXProvider } from "@mdx-js/react"

import { PlayerDataProvider } from "@/components/player/player-data-provider"
import { proseFlowClassName } from "@/components/mdx/prose"
import { PageLoading } from "@/components/ui/page-loading"
import type { Doc } from "@/lib/content"
import { mdxComponents } from "@/mdx_components/mdx-components"

function GuideArticle({
  doc,
  contentRef,
}: {
  doc: Doc
  contentRef: RefObject<HTMLElement | null>
}) {
  const guideContent = (
    <MDXProvider components={mdxComponents}>
      <Suspense
        fallback={
          <PageLoading
            className="min-h-[min(20rem,40svh)] text-primary"
            label="Loading guide"
          />
        }
      >
        <doc.Component />
      </Suspense>
    </MDXProvider>
  )

  return (
    <article ref={contentRef} className={proseFlowClassName}>
      {doc.showPageHeader && (
        <header
          className="mb-12 border-b pb-8 max-[768px]:mb-8"
          data-prose-header
        >
          <h1 className="m-0 mb-4 font-display text-[clamp(1.95rem,3vw,2.6rem)] leading-[1.05] font-semibold text-balance">
            {doc.title}
          </h1>
          {doc.description && (
            <div className="text-[1.05rem] leading-[1.65] text-muted-foreground">
              {doc.description}
            </div>
          )}
        </header>
      )}
      {doc.requiresPlayerData ? (
        <PlayerDataProvider>{guideContent}</PlayerDataProvider>
      ) : (
        guideContent
      )}
    </article>
  )
}

export { GuideArticle }
