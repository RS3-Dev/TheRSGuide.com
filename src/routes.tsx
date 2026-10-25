import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'

import { PageLoading } from '@/components/ui/page-loading'
import { guideCatalog } from '@/lib/content'
import { GuidePage } from '@/pages/guide-page'
import { HomePage } from '@/pages/home-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { PrivacyPage } from '@/pages/privacy-page'

const PlayerPage = lazy(() =>
  import('@/pages/player-page').then((module) => ({
    default: module.PlayerPage,
  })),
)

const gettingStartedRedirects = [
  { from: '/getting-started/combat-basics', to: '/getting-started' },
  ...['necromancy', 'magic', 'melee', 'ranged'].map((style) => ({
    from: `/getting-started/${style}`,
    to: '/getting-started/combat-styles',
    section: style,
  })),
  { from: '/getting-started/combat-options', to: '/getting-started/combat-settings' },
]

function LegacyGettingStartedRedirect({
  from, to, section,
}: { from: string; to: string; section?: string }) {
  const { hash, pathname, search } = useLocation()

  return (
    <Navigate
      replace
      to={{
        pathname: pathname.replace(from, to),
        hash: hash || (section ? `#${section}` : ''),
        search,
      }}
    />
  )
}

function LegacyLeaguesMapRedirect() {
  const { hash, pathname, search } = useLocation()

  return (
    <Navigate
      replace
      to={{
        hash,
        pathname: pathname.replace(/^\/leagues\/map/, '/leagues/regions'),
        search,
      }}
    />
  )
}

function LegacyLeaguesIIRedirect({ page }: { page: string }) {
  const { hash, search } = useLocation()

  return (
    <Navigate
      replace
      to={{
        hash,
        pathname: `/leagues/${page}`,
        search,
      }}
    />
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route
        path="/extras/player"
        element={
          <Suspense fallback={<PageLoading label="Loading player progression" />}>
            <PlayerPage />
          </Suspense>
        }
      />
      <Route path="/leagues/map/*" element={<LegacyLeaguesMapRedirect />} />
      {gettingStartedRedirects.map((redirect) => (
        <Route
          key={redirect.from}
          path={`${redirect.from}/*`}
          element={<LegacyGettingStartedRedirect {...redirect} />}
        />
      ))}
      <Route
        path="/leagues/leagues-ii/picker"
        element={<LegacyLeaguesIIRedirect page="picker" />}
      />
      <Route
        path="/leagues/leagues-ii/skilling-solves"
        element={<LegacyLeaguesIIRedirect page="skilling-solves" />}
      />
      {guideCatalog.documents.map((doc) => (
        <Route key={doc.path} path={doc.path} element={<GuidePage doc={doc} />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export { AppRoutes }
