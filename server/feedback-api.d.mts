import type { IncomingMessage, ServerResponse } from 'node:http'

export type FeedbackPayload =
  | { message: string; page: string }
  | { error: string }

export function validateFeedbackPayload(payload: unknown): FeedbackPayload

export function handleFeedbackApi(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void>
