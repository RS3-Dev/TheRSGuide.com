import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'

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
      {guideCatalog.documents.map((doc) => (
        <Route key={doc.path} path={doc.path} element={<GuidePage doc={doc} />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export { AppRoutes }
