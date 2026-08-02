import { NotFoundContent } from "@/components/site/not-found-content"
import { usePageMetadata } from "@/lib/page-metadata"

function NotFoundPage() {
  usePageMetadata({
    path: "/404",
    title: "Guide Not Found | The RS Guide",
    description: "The requested RuneScape guide could not be found.",
    image: "/og/home.png",
    imageAlt: "The RS Guide homepage preview",
  })

  return <NotFoundContent />
}

export { NotFoundPage }
