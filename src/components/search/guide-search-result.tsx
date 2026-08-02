import { BookOpen } from "lucide-react"

import { CommandItem } from "@/components/ui/command"
import type { GuideSearchHit } from "@/lib/guide-search"
import { cn } from "@/lib/utils"

type GuideSearchResultProps = {
  hit: GuideSearchHit
  display: "landing" | "dialog"
  onSelect: (path: string) => void
}

function GuideSearchResult({
  hit,
  display,
  onSelect,
}: GuideSearchResultProps) {
  const { document, excerpt, sectionLabel } = hit

  return (
    <CommandItem
      value={document.path}
      onSelect={() => onSelect(document.path)}
      className={cn(
        display === "dialog" &&
          "py-[.6rem] [&>div]:flex [&>div]:min-w-0 [&>div]:flex-col [&_strong]:text-[.86rem] [&_div_span]:truncate [&_div_span]:text-[.72rem] [&_div_span]:text-muted-foreground",
        display === "landing" &&
          "min-h-[4.5rem] items-start px-[.8rem] py-[.65rem] [&>svg]:mt-[.2rem] [&>svg]:text-primary"
      )}
    >
      <BookOpen />
      {display === "landing" ? (
        <>
          <div className="flex min-w-0 flex-1 flex-col gap-[.15rem]">
            <strong className="text-[.9rem]">{document.title}</strong>
            <span className="truncate text-[.77rem] leading-[1.35] text-muted-foreground">
              {excerpt}
            </span>
          </div>
          <small className="mt-[.15rem] mr-[1.6rem] ml-3 whitespace-nowrap text-[.68rem] text-muted-foreground max-[521px]:hidden">
            {sectionLabel}
          </small>
        </>
      ) : (
        <div>
          <strong>{document.title}</strong>
          <span>
            {sectionLabel}
            {document.description ? ` · ${document.description}` : ""}
          </span>
        </div>
      )}
    </CommandItem>
  )
}

export { GuideSearchResult, type GuideSearchResultProps }
