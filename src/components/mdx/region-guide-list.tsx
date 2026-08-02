import { SmartLink } from '@/components/mdx/prose'
import {
  wildernessRegionData,
  type RegionBoss,
  type RegionLink,
} from '@/data/leagues/regions/region-data'

type RegionGuideLink = RegionLink & { children?: RegionLink[] }

const regionData = {
  wilderness: wildernessRegionData,
}

type RegionGuideListProps = {
  region: string
  section: string
}

function RegionGuideList({ region, section }: RegionGuideListProps) {
  const data = regionData[region as keyof typeof regionData]
  const items = data?.[section as 'locations' | 'bosses' | 'features'] as
    | RegionGuideLink[]
    | RegionBoss[]
    | undefined

  if (!items) return null

  const rows = items.flatMap((item) => [
    { item, nested: false },
    ...(item.children ?? []).map((child) => ({ item: child, nested: true })),
  ])

  return (
    <div data-slot="region-guide-list" className="my-5 overflow-x-auto border-y">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/55 text-muted-foreground">
            <th
              className="px-3 py-2 text-left text-xs font-semibold tracking-[0.08em] uppercase max-[640px]:px-2"
              scope="col"
            >
              Name
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ item, nested }) => (
            <tr className="border-b last:border-b-0 hover:bg-muted/25" key={item.url}>
              <td className="px-3 py-3 align-top leading-5 max-[640px]:px-2 max-[640px]:py-2.5">
                <div className={nested ? 'flex gap-2 pl-4 max-[640px]:pl-2' : undefined}>
                  {nested && <span className="text-muted-foreground" aria-hidden="true">↳</span>}
                  <SmartLink className={nested ? undefined : 'font-medium'} href={item.url}>
                    {item.name}
                  </SmartLink>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { RegionGuideList }
export type { RegionGuideListProps }
