import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { ArrowRight, UserRound } from "lucide-react"

import { GuideSearchResult } from "@/components/search/guide-search-result"
import { useGuideSearchDialog } from "@/components/search/guide-search-context"
import { useGuideSearchSession } from "@/components/search/use-guide-search-session"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Spinner } from "@/components/ui/spinner"

type HomeSearchProps = {
  pathScope?: string
  playerLookup?: boolean
  placeholder?: string
  ariaLabel?: string
}

function HomeSearch({
  pathScope,
  playerLookup = true,
  placeholder = "Search a topic or username",
  ariaLabel = "Search a topic or username",
}: HomeSearchProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const { registerLandingSearch } = useGuideSearchDialog()
  const [resultsOpen, setResultsOpen] = useState(false)
  const { query, setQuery, hasQuery, results, loading } =
    useGuideSearchSession({
      active: true,
      pathScope,
      searchLimit: 8,
    })
  const usernameCandidate = query.trim()
  const canLookupPlayer =
    playerLookup &&
    usernameCandidate.length > 0 &&
    usernameCandidate.length <= 12 &&
    /^[a-z0-9 _-]+$/i.test(usernameCandidate)

  useEffect(() => {
    registerLandingSearch(() => inputRef.current?.focus())
    return () => registerLandingSearch(null)
  }, [registerLandingSearch])

  return (
    <Command
      shouldFilter={false}
      className="relative z-2 h-auto w-[min(100%,42rem)] overflow-visible rounded-(--radius)! border bg-card p-0 shadow-none"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault()
          setResultsOpen(false)
          inputRef.current?.blur()
        }
      }}
    >
      <CommandInput
        ref={inputRef}
        value={query}
        onValueChange={(value) => {
          setQuery(value)
          setResultsOpen(Boolean(value.trim()))
        }}
        onFocus={() => {
          if (hasQuery) setResultsOpen(true)
        }}
        className="h-full pr-4 pl-[3.75rem]! text-left text-[1.02rem] leading-none focus:placeholder:text-transparent max-[521px]:px-0! max-[521px]:text-center"
        wrapperClassName="p-0"
        inputGroupClassName="relative h-[3.125rem]! min-h-[3.125rem]! rounded-(--radius)! border-0 bg-transparent shadow-none! *:data-[slot=input-group-addon]:pl-0! max-[521px]:h-[2.8125rem]! max-[521px]:min-h-[2.8125rem]!"
        addonClassName="absolute inset-y-0 left-0 w-[3.75rem] justify-center p-0!"
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {hasQuery && resultsOpen && (
        <CommandList className="absolute top-[calc(100%+.5rem)] right-0 left-0 max-h-[25rem] rounded-lg border bg-popover p-[.35rem] text-left shadow-[0_1rem_3rem_color-mix(in_oklch,var(--foreground)_12%,transparent)]">
          {canLookupPlayer && (
            <CommandGroup heading="Player results">
              <CommandItem
                value={`player-${usernameCandidate}`}
                className="min-h-0! bg-transparent! p-[.2rem]! data-[selected=true]:[&_svg:last-child]:translate-x-[.2rem]"
                onSelect={() =>
                  navigate(
                    `/guides/skill-training?username=${encodeURIComponent(
                      usernameCandidate
                    )}`
                  )
                }
              >
                <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-[.8rem] rounded-(--radius) bg-accent px-3 py-2">
                    <span className="grid size-[2.4rem] place-items-center border text-primary [&>svg]:size-[1.1rem]">
                      <UserRound />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <strong
                        className="font-display text-[.96rem]"
                        data-private-player-name
                      >
                        {usernameCandidate}
                      </strong>
                      <span className="text-[.76rem] text-muted-foreground">
                        View skill recommendations
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-primary transition-transform duration-150" />
                </div>
              </CommandItem>
            </CommandGroup>
          )}
          {results.length ? (
            <CommandGroup heading="Guide results">
              {results.map((hit) => (
                <GuideSearchResult
                  key={hit.document.path}
                  hit={hit}
                  display="landing"
                  onSelect={navigate}
                />
              ))}
            </CommandGroup>
          ) : (
            <CommandEmpty className="flex flex-col gap-1 text-foreground [&>span]:text-muted-foreground">
              {loading ? (
                <Spinner
                  className="mx-auto my-3 size-5 [animation-duration:.8s]"
                  aria-label="Loading guide search"
                />
              ) : (
                <>
                  <strong>No guide found for “{query.trim()}”</strong>
                  <span>
                    {playerLookup
                      ? "Try another topic or a RuneScape username."
                      : "Try another Leagues topic."}
                  </span>
                </>
              )}
            </CommandEmpty>
          )}
        </CommandList>
      )}
    </Command>
  )
}

export { HomeSearch, type HomeSearchProps }
