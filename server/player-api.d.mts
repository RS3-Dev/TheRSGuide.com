import type { IncomingMessage, ServerResponse } from 'node:http'

export function handlePlayerApi(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void>
