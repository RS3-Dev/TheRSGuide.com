import { useState } from 'react'
import { CircleAlert, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { isFailoverDeployment } from '@/lib/deployment-role'

type FailoverNoticeProps = {
  deploymentRole?: string
}

function FailoverNotice({
  deploymentRole = import.meta.env.VITE_DEPLOYMENT_ROLE,
}: FailoverNoticeProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !isFailoverDeployment(deploymentRole)) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4 sm:px-5">
      <aside
        className="pointer-events-auto flex w-full max-w-[42rem] items-start gap-3 overflow-hidden rounded-lg border border-primary/40 bg-card/95 px-4 py-3 shadow-[0_12px_36px_rgb(42_37_32_/_18%)] backdrop-blur-xl motion-safe:animate-[failover-notice-in_300ms_cubic-bezier(.22,1,.36,1)_both] dark:shadow-[0_12px_36px_rgb(0_0_0_/_45%)] sm:items-center sm:py-3.5"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25 sm:mt-0"
          aria-hidden="true"
        >
          <CircleAlert className="size-[1.1rem]" />
        </span>
        <p className="min-w-0 flex-1 text-sm leading-5 text-foreground">
          <strong className="font-bold">
            We’re experiencing higher-than-usual traffic.
          </strong>{' '}
          Or maybe Josh&apos;s Doorbell is on the fritz again. You’ve been
          redirected to our backup site while we restore normal service. Thanks
          for your patience.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="-mr-1 shrink-0 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss traffic notice"
        >
          <X />
        </Button>
      </aside>
    </div>
  )
}

export { FailoverNotice }
