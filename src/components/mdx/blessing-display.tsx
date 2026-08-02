import blessingData from '@/data/leagues-ii/blessings.json'
import { LeaguesPassiveList, type LeaguesPassive } from '@/components/mdx/leagues-passive-list'
import { TableScroll } from '@/components/mdx/prose'

type BlessingItem = {
  name: string
  path: string
  tier: number
  image: string
  effects: string[]
  notes: string[]
}

type BlessingDisplayProps = {
  tier: number
  tasks?: number
}

function BlessingTable({ blessings }: { blessings: BlessingItem[] }) {
  return (
    <TableScroll>
      <table>
        <thead>
          <tr>
            <th>Blessing</th>
            <th>Path</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {blessings.map((blessing) => (
            <tr key={blessing.name}>
              <td>
                <div className="inline-flex min-w-44 items-center gap-3">
                  <img className="size-16 shrink-0 object-contain" src={blessing.image} alt="" />
                  <strong>{blessing.name}</strong>
                </div>
              </td>
              <td>{blessing.path}</td>
              <td>
                <ul className="list-disc pl-6">
                  {blessing.effects.map((effect) => (
                    <li className="my-1" key={`${blessing.name}-effect-${effect}`}>{effect}</li>
                  ))}
                  {blessing.notes.map((note) => (
                    <li className="my-1" key={`${blessing.name}-note-${note}`}>{note}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  )
}

function BlessingDisplay({ tier, tasks }: BlessingDisplayProps) {
  const blessings = blessingData.Blessings.filter((blessing) => blessing.tier === tier) as BlessingItem[]
  const passives = (blessingData.Passives.find((entry) => entry.tier === tier)?.effects ?? []) as LeaguesPassive[]

  if (tier === 0 && blessings.length === 0) return null

  return (
    <section className="my-6">
      {tier === 0 ? (
        <div className="mb-4">
          <h2 className="mb-2 text-xl font-semibold">Unsorted Blessings</h2>
          <p className="m-0">These blessings have not had their tiers announced yet.</p>
        </div>
      ) : (
        <div className="mb-4 flex items-baseline gap-8">
          <h2 className="m-0 text-xl font-semibold">Tier {tier}</h2>
          {tasks !== undefined && tasks > 0 && (
            <span className="text-primary">{tasks} Blessing tasks</span>
          )}
        </div>
      )}
      <LeaguesPassiveList passives={passives} />
      {blessings.length > 0 ? (
        <BlessingTable blessings={blessings} />
      ) : (
        <p className="border bg-card p-4">
          Blessings have not been confirmed for this tier yet. Check back soon!
        </p>
      )}
    </section>
  )
}

export { BlessingDisplay }
export type { BlessingDisplayProps }
