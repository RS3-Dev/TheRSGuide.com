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
  const links: HomepagePrimaryLink[] = [
    { label: 'Getting Started', to: '/start' },
    { label: 'Skill Training', to: '/guides/skill-training' },
    { label: 'Gear Progression', to: '/guides/gear-recommendations' },
    { label: 'Guides', to: '/guides', highlighted: !isLeaguesMode(value) },
  ]

  if (isLeaguesMode(value)) {
    links.push({ label: 'Leagues', to: '/leagues', highlighted: true })
  }

  return links
}
