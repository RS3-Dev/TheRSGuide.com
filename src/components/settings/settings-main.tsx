import { ChevronRightIcon, MessageSquareIcon, ShieldCheckIcon } from "lucide-react"

import { GithubIssueLink } from "@/components/settings/github-issue-link"
import { HomeMediaSettings } from "@/components/settings/home-media-settings"
import type { HomeMediaSettings as HomeMediaSettingsValue } from "@/components/settings/site-settings-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

function SettingsMain({
  homeMedia,
  onOpenPrivacy,
  onOpenFeedback,
}: {
  homeMedia: HomeMediaSettingsValue | null
  onOpenPrivacy: () => void
  onOpenFeedback: () => void
}) {
  return (
    <ScrollArea
      className="h-full min-h-0"
      viewportClassName="[&>div]:flex! [&>div]:min-h-full"
      thumbClassName="bg-[color-mix(in_oklch,var(--muted-foreground)_55%,transparent)]"
    >
      <div className="flex min-h-full flex-1 flex-col gap-8 px-6 py-7">
        {homeMedia && <HomeMediaSettings settings={homeMedia} />}
        <nav className="flex flex-col border-y" aria-label="More settings">
          <Button
            className="h-auto min-h-15 w-full justify-start gap-4 rounded-none p-4 [&>strong]:min-w-0 [&>strong]:flex-1 [&>strong]:text-left [&>strong]:text-[.8rem]"
            variant="ghost"
            onClick={onOpenPrivacy}
          >
            <ShieldCheckIcon data-icon="inline-start" />
            <strong>Privacy settings</strong>
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
          <Separator />
          <Button
            className="h-auto min-h-15 w-full justify-start gap-4 rounded-none p-4 [&>strong]:min-w-0 [&>strong]:flex-1 [&>strong]:text-left [&>strong]:text-[.8rem]"
            variant="ghost"
            onClick={onOpenFeedback}
          >
            <MessageSquareIcon data-icon="inline-start" />
            <strong>Send us a message</strong>
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </nav>
        <GithubIssueLink />
      </div>
    </ScrollArea>
  )
}

export { SettingsMain }
