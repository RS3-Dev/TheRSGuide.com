import type { IncomingMessage, ServerResponse } from 'node:http'

export function handlePickStatsApi(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void>
