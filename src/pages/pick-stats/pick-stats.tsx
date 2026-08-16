import { useEffect, useState } from 'react'

import { DataTable } from '@/components/data-table/data-table'
import { StaticBlessingPicks } from '@/components/mdx/static-blessing-picks'
import { StaticRelicPicks } from '@/components/mdx/static-relic-picks'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { PageLoading } from '@/components/ui/page-loading'
import blessingData from '@/data/leagues-ii/blessings.json'
import type { DataTableConfig } from '@/lib/data-table-config'
import { getPickStats } from '@/lib/pick-stats-api'
import { SelectedRegionList } from '@/pages/picks/components/SelectedRegionList'
import { LEAGUE_OPTIONS } from '../../../shared/league-options'
import type { PickStatsResponse } from '../../../shared/pick-stats-contract'

const relicNames = new Map(
  LEAGUE_OPTIONS.relicTiers.flatMap(({ options }) =>
    options.map(({ id, label }) => [id, label] as const),
  ),
)
const rejuvenatedRelicId = LEAGUE_OPTIONS.relicTiers
  .flatMap(({ options }) => options)
  .find(({ label }) => label === 'Rejuvenated')?.id
const blessingPaths = new Map(
  LEAGUE_OPTIONS.blessings.map(({ id, path }) => [id, path] as const),
)
const blessingNames = new Map(
  blessingData.Blessings.map(({ name, path, tier }) => [
    `${tier}:${path.toLowerCase()}`,
    name,
  ] as const),
)
const regions = new Map(
  LEAGUE_OPTIONS.regions.map((region) => [region.id, region] as const),
)

function selectableRegionStats(stats: PickStatsResponse) {
  return stats.regions.filter(({ id }) => regions.get(id)?.voteEligible)
}

const commonColumns = [
  { key: 'tier', header: 'Tier', width: 'sm', align: 'center' },
  { key: 'name', header: 'Pick', emphasis: true },
  { key: 'count', header: 'Builds', align: 'right' },
  { key: 'percentage', header: 'Pick rate (%)', align: 'right' },
] as const

type TierPick = {
  count: number
  id: string
  percentage: number
  tier: number
}

function mostPopularByTier<T extends TierPick>(picks: readonly T[]) {
  const popular = new Map<number, T>()

  picks.forEach((pick) => {
    const current = popular.get(pick.tier)
    if (
      !current
      || pick.count > current.count
      || (pick.count === current.count && pick.id < current.id)
    ) {
      popular.set(pick.tier, pick)
    }
  })

  return popular
}

function popularPicks(stats: PickStatsResponse) {
  const relicPicks = Object.fromEntries(
    [...mostPopularByTier(stats.relics)].map(([tier, pick]) => [tier, pick.id]),
  ) as Partial<Record<number, string>>
  const blessingPicks = Object.fromEntries(
    [...mostPopularByTier(stats.blessings.filter(({ derived }) => !derived))]
      .map(([tier, pick]) => [tier, pick.id]),
  ) as Partial<Record<number, string>>
  const rejuvenatedRelic = Object.values(relicPicks)
    .includes(rejuvenatedRelicId ?? '')
    ? [...stats.rejuvenated.relics]
        .filter(({ count }) => count > 0)
        .sort((left, right) =>
          right.count - left.count
          || left.tier - right.tier
          || left.id.localeCompare(right.id)
        )[0]?.id
    : undefined
  const regionPicks = selectableRegionStats(stats)
    .sort((left, right) =>
      right.count - left.count || left.id.localeCompare(right.id)
    )
    .slice(0, 5)
    .map((stat) => {
      const region = regions.get(stat.id)
      return {
        color: region?.color,
        id: stat.id,
        name: `${region?.label ?? stat.id} · ${stat.percentage}%`,
      }
    })

  return { blessingPicks, regionPicks, rejuvenatedRelic, relicPicks }
}

function tableConfigs(stats: PickStatsResponse) {
  const rejuvenatedCaption = stats.rejuvenated.recordedBuilds
    ? `Based on ${stats.rejuvenated.recordedBuilds.toLocaleString()} shared builds that recorded a Rejuvenated bonus relic. Historical choices from before the bonus was stored are not included.`
    : 'No shared builds have recorded a Rejuvenated bonus relic yet. Historical choices from before the bonus was stored cannot be recovered.'

  return {
    relics: {
      title: 'Relics',
      titleAs: 'h3',
      sortable: true,
      rowId: 'id',
      columns: commonColumns,
      rows: stats.relics.map((stat) => ({
        id: stat.id,
        tier: stat.tier,
        name: relicNames.get(stat.id) ?? stat.id,
        count: stat.count,
        percentage: stat.percentage,
      })),
    },
    rejuvenated: {
      title: 'Rejuvenated bonus relics',
      titleAs: 'h3',
      sortable: true,
      rowId: 'id',
      caption: rejuvenatedCaption,
      columns: [
        { key: 'rank', header: 'Rank', width: 'sm', align: 'center' },
        { key: 'tier', header: 'Tier', width: 'sm', align: 'center' },
        { key: 'name', header: 'Bonus relic', emphasis: true },
        { key: 'count', header: 'Builds', align: 'right' },
        { key: 'percentage', header: 'Recorded picks (%)', align: 'right' },
      ],
      rows: [...stats.rejuvenated.relics]
        .sort((left, right) =>
          right.count - left.count
          || left.tier - right.tier
          || left.id.localeCompare(right.id)
        )
        .map((stat, index) => ({
          id: stat.id,
          rank: index + 1,
          tier: stat.tier,
          name: relicNames.get(stat.id) ?? stat.id,
          count: stat.count,
          percentage: stat.percentage,
        })),
    },
    blessings: {
      title: 'Blessings',
      titleAs: 'h3',
      sortable: true,
      rowId: 'key',
      columns: [
        ...commonColumns,
        { key: 'path', header: 'Path' },
        { key: 'selection', header: 'Selection' },
      ],
      rows: stats.blessings.map((stat) => {
        const path = blessingPaths.get(stat.id) ?? stat.id
        return {
          key: `${stat.tier}:${stat.id}`,
          tier: stat.tier,
          name: blessingNames.get(`${stat.tier}:${path.toLowerCase()}`)
            ?? `${path} Tier ${stat.tier}`,
          count: stat.count,
          percentage: stat.percentage,
          path,
          selection: stat.derived ? 'Derived' : 'Selected',
        }
      }),
    },
    regions: {
      title: 'Regions',
      titleAs: 'h3',
      sortable: true,
      rowId: 'id',
      columns: [
        { key: 'name', header: 'Region', emphasis: true },
        { key: 'count', header: 'Builds', align: 'right' },
        { key: 'percentage', header: 'Pick rate (%)', align: 'right' },
      ],
      rows: selectableRegionStats(stats)
        .sort((left, right) => right.percentage - left.percentage)
        .map((stat) => ({
          id: stat.id,
          name: regions.get(stat.id)?.label ?? stat.id,
          count: stat.count,
          percentage: stat.percentage,
        })),
    },
  } satisfies Record<string, DataTableConfig>
}

export default function PickStatsPage() {
  const [stats, setStats] = useState<PickStatsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getPickStats(controller.signal)
      .then(setStats)
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'Pick statistics are unavailable.',
        )
      })

    return () => controller.abort()
  }, [])

  if (error) {
    return (
      <Empty className="not-prose min-h-64 border">
        <EmptyHeader>
          <EmptyTitle>Pick statistics are unavailable</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (!stats) {
    return <PageLoading label="Loading pick statistics" />
  }

  const generatedAt = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(stats.generatedAt))
  const windowStart = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(stats.windowStart))
  const popular = popularPicks(stats)
  const tables = tableConfigs(stats)

  return (
    <section className="not-prose flex flex-col gap-10">
      <p className="m-0 text-sm text-muted-foreground">
        Based on {stats.totalBuilds.toLocaleString()} shared builds created
        since {windowStart}. Last updated {generatedAt}.
      </p>

      <section aria-labelledby="popular-picks-heading">
        <div className="mb-6 max-w-2xl">
          <h2
            className="font-display text-2xl font-semibold"
            id="popular-picks-heading"
          >
            Most popular picks
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The leading choice from each tier, assembled into one community
            build. Open any relic or blessing for its full details.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <h3 className="font-display text-lg font-semibold">Relics</h3>
            <StaticRelicPicks
              ariaLabel="Most popular relic path"
              picks={popular.relicPicks}
              rejuvenatedRelic={popular.rejuvenatedRelic}
            />
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold">Blessings</h3>
            <StaticBlessingPicks
              ariaLabel="Most popular blessing path"
              picks={popular.blessingPicks}
            />
          </div>

          <div className="max-w-2xl" aria-label="Most popular region picks">
            <h3 className="mb-4 font-display text-lg font-semibold">
              Regions
            </h3>
            <SelectedRegionList
              compact
              regions={popular.regionPicks}
              slots={5}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="detailed-pick-rates-heading">
        <div className="mb-6 max-w-2xl">
          <h2
            className="font-display text-2xl font-semibold"
            id="detailed-pick-rates-heading"
          >
            Detailed pick rates
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sort any column to compare the complete distributions.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <DataTable config={tables.relics} />
          <DataTable config={tables.rejuvenated} />
          <DataTable config={tables.blessings} />
          <DataTable config={tables.regions} />
        </div>
      </section>
    </section>
  )
}
