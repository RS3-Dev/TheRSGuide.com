import { GuideLayout } from '@/components/guides/guide-layout'
import { guideCatalog, type Doc } from '@/lib/content'
import { openGraphImagePath, usePageMetadata } from '@/lib/page-metadata'

function GuidePage({ doc }: { doc: Doc }) {
  const socialSection =
    guideCatalog.breadcrumbs(doc.path).slice(0, -1).at(-1)?.label ??
    guideCatalog.sectionLabel(doc.section)

  usePageMetadata({
    path: doc.path,
    title: `${doc.title} | The RS Guide`,
    description: doc.description || `Read ${doc.title} on The RS Guide.`,
    image: doc.ogImage || openGraphImagePath(doc.path),
    imageAlt: `${doc.title} guide preview`,
    type: 'article',
    section: socialSection,
    tags: ['RuneScape', socialSection, 'Guide'],
  })

  return <GuideLayout doc={doc} />
}

export { GuidePage }
