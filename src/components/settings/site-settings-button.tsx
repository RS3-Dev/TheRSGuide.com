import { SettingsIcon } from "lucide-react"

import { useSiteSettings } from "@/components/settings/site-settings-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function SiteSettingsButton({
  className,
  label = "Open settings",
}: {
  className?: string
  label?: string
}) {
  const settings = useSiteSettings()

  return (
    <Button
      className={cn("shrink-0", className)}
      variant="ghost"
      size="icon"
      onClick={() => settings.openSettings()}
      aria-label={label}
      title={label}
    >
      <SettingsIcon />
    </Button>
  )
}

export { SiteSettingsButton }
