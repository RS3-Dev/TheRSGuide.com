import { lazy } from 'react'
import 'react-medium-image-zoom/dist/styles.css'
import { Cards, DocCard, TableScroll, proseComponents } from '@/components/mdx/prose'
import { SplitContent, SplitItem, Center } from '@/components/mdx/split-content'
import { Steps, Step } from '@/components/mdx/steps'
import { UnderConstruction } from '@/components/mdx/under-construction'
import { YouTubeEmbed } from '@/components/mdx/youtube-embed'

const InteractiveLegend = lazy(() => import('@/components/mdx/interactive-legend').then((module) => ({ default: module.InteractiveLegend })))
const PlayerSearch = lazy(() => import('@/components/mdx/player-search').then((module) => ({ default: module.PlayerSearch })))
const QuestRequirements = lazy(() => import('@/components/mdx/quest-requirements').then((module) => ({ default: module.QuestRequirements })))
const SkillTrainingLookup = lazy(() => import('@/components/mdx/skill-training-lookup').then((module) => ({ default: module.SkillTrainingLookup })))
const InteractiveMapMarker = lazy(() => import('@/components/mdx/interactive-map-marker').then((module) => ({ default: module.InteractiveMapMarker })))
const CombatStyleAnalysis = lazy(() => import('@/components/mdx/combat-style-analysis').then((module) => ({ default: module.CombatStyleAnalysis })))
const GearProgression = lazy(() => import('@/components/mdx/gear-progression').then((module) => ({ default: module.GearProgression })))
const GearRecommendations = lazy(() => import('@/components/mdx/gear-recommendations').then((module) => ({ default: module.GearRecommendations })))
const RecurringActivitiesTool = lazy(() => import('@/components/mdx/recurring-activities-tool').then((module) => ({ default: module.RecurringActivitiesTool })))
const EfficiencyGuideTool = lazy(() => import('@/components/mdx/efficiency-guide-tool').then((module) => ({ default: module.EfficiencyGuideTool })))
const LeaguesRegionMap = lazy(() => import('@/components/mdx/leagues-region-map'))
const RelicDisplay = lazy(() => import('@/components/mdx/relic-display').then((module) => ({ default: module.RelicDisplay })))
const SkillingSolver = lazy(() => import('@/components/mdx/skilling-solver').then((module) => ({ default: module.SkillingSolver })))
const BlessingDisplay = lazy(() => import('@/components/mdx/blessing-display').then((module) => ({ default: module.BlessingDisplay })))
const StaticRelicPicks = lazy(() => import('@/components/mdx/static-relic-picks').then((module) => ({ default: module.StaticRelicPicks })))
const StaticBlessingPicks = lazy(() => import('@/components/mdx/static-blessing-picks').then((module) => ({ default: module.StaticBlessingPicks })))
const LeaguesPicker = lazy(() => import('@/pages/picks/picks'))
const LeaguesRandomizer = lazy(() => import('@/pages/randomizer/randomizer'))
const LeaguesPickStats = lazy(() => import('@/pages/pick-stats/pick-stats'))
const DataTable = lazy(() => import('@/components/data-table/data-table').then((module) => ({ default: module.DataTable })))

export const mdxComponents = {
  ...proseComponents,
  Card: DocCard,
  Cards,
  SplitContent,
  SplitItem,
  Center,
  YouTubeEmbed,
  Steps,
  Step,
  UnderConstruction,
  TableScroll,
  InteractiveLegend,
  PlayerSearch,
  QuestRequirements,
  SkillTrainingLookup,
  InteractiveMapMarker,
  CombatStyleAnalysis,
  GearProgression,
  GearRecommendations,
  RecurringActivitiesTool,
  EfficiencyGuideTool,
  LeaguesRegionMap,
  RelicDisplay,
  SkillingSolver,
  BlessingDisplay,
  StaticRelicPicks,
  StaticBlessingPicks,
  LeaguesPicker,
  LeaguesRandomizer,
  LeaguesPickStats,
  DataTable,
}
