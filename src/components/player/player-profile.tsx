import { PlayerSearchForm } from "@/components/player/player-search-form"

function PlayerProfile({ username }: { username: string }) {
  return (
    <header className="flex items-center justify-between gap-12 border-b pb-5 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-5 [&_form]:m-0 [&_form]:flex-[0_1_31rem] max-[768px]:[&_form]:w-full max-[768px]:[&_form]:flex-basis-auto">
      <div className="min-w-0">
        <h1
          className="m-0 max-w-[18ch] text-[clamp(2rem,3vw,3rem)] leading-[1.1] text-balance"
          data-private-player-name
        >
          {username}
        </h1>
      </div>
      <PlayerSearchForm initialValue={username} />
    </header>
  )
}

export { PlayerProfile }
