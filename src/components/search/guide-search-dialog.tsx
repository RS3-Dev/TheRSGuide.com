import { useRef } from 'react'
import { XIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { GuideSearchResult } from '@/components/search/guide-search-result'
import { useGuideSearchSession } from '@/components/search/use-guide-search-session'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from '@/components/ui/command'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export function GuideSearchDialog({
  open,
  onOpenChange,
  pathScope,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathScope?: string
}) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const { query, setQuery, results, loading } = useGuideSearchSession({
    active: open,
    pathScope,
    browseLimit: 14,
    searchLimit: 30,
  })

  const selectResult = (path: string) => {
    navigate(path)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(36rem,calc(100vw-2rem))] max-w-none gap-0 overflow-hidden p-0 sm:max-w-none"
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          inputRef.current?.focus()
        }}
      >
        <DialogHeader className="flex-row items-center justify-between px-4 py-3">
          <DialogTitle>Search guides</DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close guide search"
              title="Close guide search"
            >
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>
        <Separator />
        <Command shouldFilter={false} className="rounded-none! p-0">
          <CommandInput
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            wrapperClassName="px-3 pt-3 pb-2"
            placeholder="Search every guide…"
          />
          <ScrollArea
            type="always"
            className="h-[min(28rem,calc(100svh-12rem))]"
            thumbClassName="bg-[color-mix(in_oklch,var(--muted-foreground)_55%,transparent)]"
          >
            <CommandList className="max-h-none overflow-visible">
              <CommandEmpty>
                {loading ? 'Loading guide search…' : 'No guide matched that search.'}
              </CommandEmpty>
              {results.length > 0 && (
                <CommandGroup
                  className="py-[.45rem]"
                  heading={query ? 'Results' : 'Browse guides'}
                >
                  {results.map((hit) => (
                    <GuideSearchResult
                      key={hit.document.path}
                      hit={hit}
                      display="dialog"
                      onSelect={selectResult}
                    />
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </ScrollArea>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
