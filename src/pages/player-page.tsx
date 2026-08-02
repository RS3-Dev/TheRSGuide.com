import { PlayerDashboard } from '@/components/player/player-dashboard'
import { PlayerDataProvider } from '@/components/player/player-data-provider'

function PlayerPage() {
  return (
    <PlayerDataProvider>
      <PlayerDashboard />
    </PlayerDataProvider>
  )
}

export { PlayerPage }
