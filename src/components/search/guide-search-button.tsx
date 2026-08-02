import { Command as CommandIcon, Search } from "lucide-react"

import { useGuideSearchDialog } from "@/components/search/guide-search-context"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

function GuideSearchButton({ compact = false }: { compact?: boolean }) {
  const { openSearch } = useGuideSearchDialog()

  return (
    <Button
      variant="outline"
      size={compact ? "icon" : "default"}
      onClick={openSearch}
      className={cn(
        !compact &&
          "w-56 justify-center text-muted-foreground max-[768px]:size-9 max-[768px]:p-0"
      )}
      aria-label={compact ? "Search guides" : undefined}
    >
      <Search data-icon="inline-start" />
      {!compact && (
        <>
          <span className="max-[768px]:hidden">Search guides</span>
          <Kbd className="ml-auto text-[.7rem] max-[768px]:hidden">
            <CommandIcon aria-hidden="true" /> K
          </Kbd>
        </>
      )}
    </Button>
  )
}

export { GuideSearchButton }
