import { EvergreenHome } from '@/components/home/evergreen-home'
import { usePageMetadata } from '@/lib/page-metadata'

function HomePage() {
  usePageMetadata({
    path: '/',
    title: 'The RS Guide | Practical RuneScape Guides',
    description:
      'Practical RuneScape guides for combat, progression, setup, and account planning.',
    image: '/og/home.png',
    imageAlt: 'The RS Guide homepage preview',
  })

  return <EvergreenHome />
}

export { HomePage }
