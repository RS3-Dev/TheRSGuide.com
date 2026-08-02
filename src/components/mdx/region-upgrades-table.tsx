import { SmartLink } from '@/components/mdx/prose'
import {
  wildernessRegionData,
  type RegionLink,
} from '@/data/leagues/regions/region-data'
import { cn } from '@/lib/utils'

type UpgradeCell = string | RegionLink[]

type UpgradeColumn = {
  key: string
  label: string
}

type UpgradeRow = {
  cells: Record<string, UpgradeCell>
  note: string
  alsoAvailableIn: string[]
}

type UpgradeGroup = {
  title: string
  rows: UpgradeRow[]
}

type UpgradeSection = {
  columns: UpgradeColumn[]
  groups: UpgradeGroup[]
}

type RegionUpgradesTableProps = {
  region: string
  section: string
}

function UpgradeCellContent({ value }: { value: UpgradeCell | undefined }) {
  if (!value) return <span aria-hidden="true">—</span>
  if (typeof value === 'string') return value

  return (
    <div className="flex flex-col items-start gap-1.5">
      {value.map((item) => (
        <SmartLink key={`${item.name}-${item.url}`} href={item.url}>
          {item.name}
        </SmartLink>
      ))}
    </div>
  )
}

function UpgradeNote({ row }: { row: UpgradeRow }) {
  if (!row.note && row.alsoAvailableIn.length === 0) return null

  return (
    <p className="mt-1.5 mb-0 text-xs leading-5 text-muted-foreground">
      {row.note}
      {row.alsoAvailableIn.length > 0 ? (
        <>
          {row.note && ' '}
          Also available in{' '}
          {row.alsoAvailableIn.map((region, index) => (
            <span key={region}>
              {index > 0 && (index === row.alsoAvailableIn.length - 1 ? ' and ' : ', ')}
              <SmartLink href={`/leagues/map/${region}`}>
                {region.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}
              </SmartLink>
            </span>
          ))}
          .
        </>
      ) : null}
    </p>
  )
}

function upgradeSection(section: string): UpgradeSection | undefined {
  if (section === 'pvm') {
    return {
      columns: [
        { key: 'tier', label: 'Tier' },
        { key: 'style', label: 'Style' },
        { key: 'items', label: 'Upgrade' },
      ],
      groups: wildernessRegionData.pvmUpgrades.map((group) => ({
        title: group.source,
        rows: group.rows.map((row) => ({
          cells: { tier: row.tier, style: row.style, items: row.items },
          note: row.note,
          alsoAvailableIn: row.alsoAvailableIn,
        })),
      })),
    }
  }

  if (section === 'utility') {
    return {
      columns: [
        { key: 'type', label: 'Type' },
        { key: 'items', label: 'Upgrade' },
      ],
      groups: wildernessRegionData.utilityUpgrades.map((group) => ({
        title: group.source,
        rows: group.rows.map((row) => ({
          cells: { type: row.type, items: row.items },
          note: row.note,
          alsoAvailableIn: [],
        })),
      })),
    }
  }

  if (section === 'abilities') {
    return {
      columns: [
        { key: 'level', label: 'Level' },
        { key: 'style', label: 'Style' },
        { key: 'items', label: 'Ability' },
      ],
      groups: wildernessRegionData.abilities.map((group) => ({
        title: group.source,
        rows: group.rows.map((row) => ({
          cells: { level: row.level, style: row.style, items: row.items },
          note: row.note,
          alsoAvailableIn: [],
        })),
      })),
    }
  }
}

function RegionUpgradesTable({ region, section }: RegionUpgradesTableProps) {
  const tableSection = region === 'wilderness' ? upgradeSection(section) : undefined

  if (!tableSection) return null

  return (
    <div data-slot="region-upgrades" className="my-6 space-y-8">
      {tableSection.groups.map((group) => (
        <section key={group.title}>
          <h4 className="mb-3 font-display text-lg leading-tight">{group.title}</h4>
          <div className="overflow-x-auto border-y">
            <table className="w-full min-w-[30rem] border-collapse text-sm max-[640px]:min-w-0">
              <thead>
                <tr className="border-b bg-muted/55 text-muted-foreground">
                  {tableSection.columns.map((column, columnIndex) => (
                    <th
                      className={cn(
                        "px-3 py-2 text-left text-xs font-semibold tracking-[0.08em] uppercase",
                        columnIndex === 0 && "w-20",
                        columnIndex === 1 && tableSection.columns.length > 2 && "w-28",
                        "max-[640px]:px-2"
                      )}
                      key={column.key}
                      scope="col"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, rowIndex) => (
                  <tr
                    className="border-b last:border-b-0 hover:bg-muted/25"
                    key={`${group.title}-${rowIndex}`}
                  >
                    {tableSection.columns.map((column, columnIndex) => (
                      <td
                        className={cn(
                          "px-3 py-3 align-top leading-5",
                          columnIndex < tableSection.columns.length - 1 && "text-muted-foreground",
                          columnIndex === 0 && "font-semibold text-foreground tabular-nums",
                          "max-[640px]:px-2 max-[640px]:py-2.5"
                        )}
                        key={column.key}
                      >
                        <UpgradeCellContent value={row.cells[column.key]} />
                        {columnIndex === tableSection.columns.length - 1 && (
                          <UpgradeNote row={row} />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

export { RegionUpgradesTable }
export type { RegionUpgradesTableProps }
