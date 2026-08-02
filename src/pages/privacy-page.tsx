import { PrivacyNotice } from "@/components/site/privacy-notice"
import { usePageMetadata } from "@/lib/page-metadata"

function PrivacyPage() {
  usePageMetadata({
    path: "/privacy",
    title: "Privacy Notice | The RS Guide",
    description: "How The RS Guide measures visits and stores preferences.",
    image: "/og/home.png",
    imageAlt: "The RS Guide homepage preview",
  })

  return <PrivacyNotice />
}

export { PrivacyPage }
