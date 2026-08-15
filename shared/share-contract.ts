import { z } from 'zod'

import {
  BLESSING_IDS,
  BLESSING_SELECTION_COUNT,
} from './blessings'

export {
  BLESSING_IDS,
  BLESSING_SELECTION_COUNT,
  type BlessingId,
} from './blessings'

export const SHARE_CODE_LENGTH = 10
export const DEFAULT_BUILD_NAME = 'RuneScape Leagues 2: Equilibrium'
export const REQUIRED_RELIC_COUNT = 7
export const GUARANTEED_SHARE_REGION_IDS = [
  'misthalin-havenhythe',
  'karamja',
] as const
export const OPTIONAL_REGION_PICK_COUNT = 3
export const REQUIRED_REGION_COUNT =
  GUARANTEED_SHARE_REGION_IDS.length + OPTIONAL_REGION_PICK_COUNT

export const blessingIdSchema = z.enum(BLESSING_IDS)
export const blessingSelectionsSchema = z
  .array(blessingIdSchema)
  .length(BLESSING_SELECTION_COUNT)

const rejuvenatedRelicSchema = z.union([
  z.literal(''),
  z.string().trim().regex(/^\d[a-c]$/),
])

export const shareCodeSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{10}$/, 'Invalid share code')

export const createShareRequestSchema = z.object({
  requestId: z.string().uuid(),
  buildName: z.string().trim().max(60).optional().default(''),
  blessings: blessingSelectionsSchema,
  regions: z
    .array(z.string().trim().min(1).max(100))
    .length(REQUIRED_REGION_COUNT),
  relics: z
    .array(z.string().trim().regex(/^\d[a-c]$/))
    .length(REQUIRED_RELIC_COUNT),
  rejuvenatedRelic: rejuvenatedRelicSchema.optional(),
})

export const sharedBuildSchema = z.object({
  code: shareCodeSchema,
  buildName: z.string(),
  blessings: z.array(blessingIdSchema).max(BLESSING_SELECTION_COUNT),
  regions: z.array(z.string()),
  relics: z.array(z.string()),
  rejuvenatedRelic: rejuvenatedRelicSchema.optional(),
  imageUrl: z.string().url(),
  shareUrl: z.string().url(),
  createdAt: z.string().datetime(),
})

export const createShareResponseSchema = z.object({
  share: sharedBuildSchema,
})

export type CreateShareRequest = z.infer<typeof createShareRequestSchema>
export type CreateShareResponse = z.infer<typeof createShareResponseSchema>
export type SharedBuild = z.infer<typeof sharedBuildSchema>


