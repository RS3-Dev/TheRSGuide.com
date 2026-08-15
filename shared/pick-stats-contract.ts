import { z } from 'zod'

import { BLESSING_IDS } from './blessings'

export const PICK_STATS_VERSION = 2

const countSchema = z.number().int().nonnegative()
const percentageSchema = z.number().min(0).max(100)

const relicPickStatSchema = z.object({
  id: z.string().min(2),
  tier: z.number().int().min(1).max(7),
  count: countSchema,
  percentage: percentageSchema,
})

const rejuvenatedRelicPickStatSchema = relicPickStatSchema.extend({
  tier: z.number().int().min(1).max(5),
})

const blessingPickStatSchema = z.object({
  id: z.enum(BLESSING_IDS),
  tier: z.number().int().min(1).max(8),
  derived: z.boolean(),
  count: countSchema,
  percentage: percentageSchema,
})

const regionPickStatSchema = z.object({
  id: z.string().min(1),
  count: countSchema,
  percentage: percentageSchema,
})

export const pickStatsResponseSchema = z.object({
  version: z.literal(PICK_STATS_VERSION),
  generatedAt: z.iso.datetime(),
  windowStart: z.iso.datetime(),
  totalBuilds: countSchema,
  relics: z.array(relicPickStatSchema),
  rejuvenated: z.object({
    recordedBuilds: countSchema,
    relics: z.array(rejuvenatedRelicPickStatSchema),
  }),
  blessings: z.array(blessingPickStatSchema),
  regions: z.array(regionPickStatSchema),
})

export type PickStatsResponse = z.infer<typeof pickStatsResponseSchema>
