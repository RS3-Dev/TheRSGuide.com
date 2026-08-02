import { type FormEvent } from "react"
import { Search } from "lucide-react"

import { usePlayerLookup } from "@/components/player/use-player-lookup"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

function PlayerSearchForm({ initialValue = "" }: { initialValue?: string }) {
  const { value, changeValue, submit, loading } = usePlayerLookup({
    initialValue,
    updateUrlOnSubmit: true,
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  return (
    <form
      className="mt-6 flex w-[min(100%,34rem)] items-stretch gap-[.65rem] max-[361px]:flex-col"
      onSubmit={handleSubmit}
    >
      <FieldGroup className="contents">
        <Field className="contents">
          <InputGroup className="relative h-11 min-w-0 flex-1 bg-card">
            <InputGroupAddon className="absolute left-4 z-1 p-0">
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-11 pl-11"
              value={value}
              onChange={(event) => changeValue(event.target.value)}
              placeholder="Enter your username"
              aria-label="RuneScape username"
            />
          </InputGroup>
        </Field>
        <Button
          className="h-11 rounded-(--radius) whitespace-nowrap max-[361px]:w-full"
          type="submit"
          disabled={loading || !value.trim()}
        >
          {loading ? "Looking up…" : "Look up player"}
        </Button>
      </FieldGroup>
    </form>
  )
}

export { PlayerSearchForm }
