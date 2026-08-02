import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type PageLoadingProps = React.ComponentProps<"div"> & {
  label: string
}

function PageLoading({ className, label, ...props }: PageLoadingProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "flex min-h-64 items-center justify-center text-muted-foreground",
        className
      )}
      {...props}
    >
      <Spinner
        aria-hidden="true"
        className="size-6 [animation-duration:.8s]"
      />
    </div>
  )
}

export { PageLoading, type PageLoadingProps }
