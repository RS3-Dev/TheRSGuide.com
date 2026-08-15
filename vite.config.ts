/// <reference types="vitest/config" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import path from 'node:path'
import { handlePlayerApi } from './server/player-api.mjs'
import { handleFeedbackApi } from './server/feedback-api.mjs'
import { handleSharesApi } from './server/shares-api.mjs'
import { handlePickStatsApi } from './server/pick-stats-api.mjs'
import { handleMediaProxy } from './server/media-proxy.mjs'
import { handleHealth, isHealthRequest } from './server/health.mjs'
import { guideContentPlugin } from './scripts/guide-content-plugin.mjs'
import { dataTableValidationPlugin } from './scripts/data-table-validation.mjs'

const mdxPlugin = mdx({
  providerImportSource: '@mdx-js/react',
  remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: 'frontmatter' }]],
})
const transformMdx = mdxPlugin.transform as (this: unknown, code: string, id: string) => unknown

const mdxWithoutRaw = {
  ...mdxPlugin,
  enforce: 'pre' as const,
  transform(this: unknown, code: string, id: string) {
    if (id.includes('?raw')) return null
    return transformMdx.call(this, code, id)
  },
}

const localApiPlugin = () => ({
  name: 'local-api',
  configureServer(server: { middlewares: { use: (handler: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => void) => void } }) {
    server.middlewares.use((req, res, next) => {
      if (isHealthRequest(req)) {
        handleHealth(req, res)
        return
      }
      if (req.url?.startsWith('/api/player/')) {
        void handlePlayerApi(req, res)
        return
      }
      if (req.url?.startsWith('/api/feedback')) {
        void handleFeedbackApi(req, res)
        return
      }
      if (req.url?.startsWith('/api/shares')) {
        void handleSharesApi(req, res)
        return
      }
      if (req.url?.startsWith('/api/pick-stats')) {
        void handlePickStatsApi(req, res)
        return
      }
      if (req.url?.startsWith('/media-proxy/')) {
        void handleMediaProxy(req, res)
        return
      }
      next()
    })
  },
})

const REACT_RUNTIME = /\/node_modules\/(react|react-dom|scheduler|@mdx-js)\//
const GUIDE_PAGE = /\/content\/(.+)\/[^/]+\.mdx$/

const manualChunks = (id: string) => {
  const normalized = id.replace(/\\/g, '/')
  if (REACT_RUNTIME.test(normalized)) return 'react'
  const guidePage = normalized.match(GUIDE_PAGE)
  return guidePage ? `content-${guidePage[1].replace(/\//g, '-')}` : undefined
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const deploymentUrl = (
    env.SITE_URL
    || env.COOLIFY_URL
    || 'https://thersguide.com'
  ).split(',')[0].trim()
  const leaguesEnabled = env.VITE_HOMEPAGE_MODE?.trim().toLowerCase() === 'leagues'

  return {
    plugins: [
      localApiPlugin(),
      dataTableValidationPlugin(),
      guideContentPlugin({ siteUrl: deploymentUrl, leaguesEnabled }),
      mdxWithoutRaw,
      react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
      tailwindcss(),
    ],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    build: { rollupOptions: { output: { manualChunks } } },
    test: { setupFiles: ['./src/test/setup.ts'] },
    server: {
      proxy: {
        '/api/shares': {
          changeOrigin: true,
          target: 'https://rs3leagues-share-worker.thejonesofjustice.workers.dev',
        },
        '/api/pick-stats': {
          changeOrigin: true,
          target: 'https://rs3leagues-share-worker.thejonesofjustice.workers.dev',
        },
      },
    },
  }
})
