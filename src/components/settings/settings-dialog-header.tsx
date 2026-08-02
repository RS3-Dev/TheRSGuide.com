import { ArrowLeftIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

function SettingsDialogHeader({
  title,
  onBack,
}: {
  title: string
  onBack?: () => void
}) {
  return (
    <DialogHeader
      className={cn(
        "grid min-h-16 grid-cols-[minmax(0,1fr)_2rem] items-center gap-4! border-b px-5 py-4! [&_[data-slot=dialog-title]]:font-display [&_[data-slot=dialog-title]]:text-[1.2rem] [&_[data-slot=dialog-title]]:font-bold",
        onBack && "grid-cols-[2rem_minmax(0,1fr)_2rem]"
      )}
    >
      {onBack && (
        <Button
          className="justify-self-center"
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          aria-label="Back to settings"
          title="Back to settings"
        >
          <ArrowLeftIcon />
        </Button>
      )}
      <DialogTitle>{title}</DialogTitle>
      <DialogClose asChild>
        <Button
          className="justify-self-center"
          variant="ghost"
          size="icon-sm"
          aria-label="Close settings"
          title="Close settings"
        >
          <XIcon />
        </Button>
      </DialogClose>
    </DialogHeader>
  )
}

export { SettingsDialogHeader }
