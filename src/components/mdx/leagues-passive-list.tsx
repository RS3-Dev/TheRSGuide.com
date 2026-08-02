import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

type LeaguesPassive = {
  title: string
  description: string
}

type LeaguesPassiveListProps = {
  passives: LeaguesPassive[]
}

function LeaguesPassiveList({ passives }: LeaguesPassiveListProps) {
  if (passives.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
        {passives.map((effect) => (
            <Popover key={`${effect.title}-${effect.description}`}>
                <PopoverTrigger asChild>
                    <button type="button" className="bg-card p-2 text-xs hover:bg-accent/50">
                        <strong>{effect.title}</strong>
                    </button>
                </PopoverTrigger>
                <PopoverContent>
                    <p>{effect.description}</p>
                </PopoverContent>
            </Popover>
        ))}
    </div>
  )
}

export { LeaguesPassiveList }
export type { LeaguesPassive, LeaguesPassiveListProps }
