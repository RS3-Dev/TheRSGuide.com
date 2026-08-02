import type { ProgressionStage } from "@/lib/player-progression"

const progressionStages: {
  key: ProgressionStage
  title: string
}[] = [
  { key: "early", title: "Early game" },
  { key: "mid", title: "Mid game" },
  { key: "late", title: "Late game" },
]

export { progressionStages }
