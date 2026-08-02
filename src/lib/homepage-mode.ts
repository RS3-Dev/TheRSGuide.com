export type HomepageMode = 'normal' | 'leagues'

export type HomepagePrimaryLink = {
  label: string
  to: string
  highlighted?: boolean
}

export const resolveHomepageMode = (value?: string): HomepageMode =>
  value?.trim().toLowerCase() === 'leagues' ? 'leagues' : 'normal'

export const isLeaguesMode = (value?: string) =>
  resolveHomepageMode(value) === 'leagues'

export const isGuideSectionEnabled = (section: string, value?: string) =>
  section !== 'leagues' || isLeaguesMode(value)

export const homepagePrimaryLinks = (
  value?: string,
): readonly HomepagePrimaryLink[] => {
  if (isLeaguesMode(value)) {
    return [
      { label: 'Guides', to: '/guides' },
      { label: 'Getting Started', to: '/getting-started' },
      { label: 'Leagues', to: '/leagues', highlighted: true },
      { label: 'Setup Guide', to: '/setup' },
      { label: 'Extras', to: '/extras' },
    ]
  }

  return [
    { label: 'Guides', to: '/guides', highlighted: true },
    { label: 'Getting Started', to: '/getting-started' },
    { label: 'Setup Guide', to: '/setup' },
    { label: 'Extras', to: '/extras' },
  ]
}
