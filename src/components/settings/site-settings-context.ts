import { createContext, useContext } from 'react'

export type SettingsPage = 'main' | 'privacy' | 'feedback'

export type HomeMediaSettings = {
  enabled: boolean
  muted: boolean
  volume: number
  setEnabled: (enabled: boolean) => void
  setMuted: (muted: boolean) => void
  setVolume: (volume: number) => void
}

export type SiteSettingsContextValue = {
  openSettings: (page?: SettingsPage) => void
  registerHomeMedia: (settings: HomeMediaSettings | null) => void
}

export const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null)

export function useSiteSettings() {
  const settings = useContext(SiteSettingsContext)
  if (!settings) throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  return settings
}
