import {
  pickStatsResponseSchema,
  type PickStatsResponse,
} from '../../shared/pick-stats-contract'

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { error?: unknown }
    if (typeof body.error === 'string') return body.error
  } catch {
    // Fall through to a status-based message.
  }
  return `Pick statistics request failed (${response.status})`
}
export async function getPickStats(signal?: AbortSignal): Promise<PickStatsResponse> {
  const response = await fetch('/api/pick-stats', { signal })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return pickStatsResponseSchema.parse(await response.json())
}
