import type { Plugin } from 'vite'

export type GuideContentPluginOptions = {
  siteUrl?: string
  leaguesEnabled?: boolean
  validatePublishedContent?: boolean
}

export function guideContentPlugin(
  options?: GuideContentPluginOptions,
): Plugin
