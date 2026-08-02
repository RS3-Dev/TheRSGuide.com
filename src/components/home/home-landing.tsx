import {
  Fragment,
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
} from "react"
import { Link } from "react-router"

import { HomeSearch } from "@/components/home/home-search"
import { SiteSettingsButton } from "@/components/settings/site-settings-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const HomeBackgroundMedia = lazy(() =>
  import("@/components/home/home-background").then((module) => ({
    default: module.HomeBackgroundMedia,
  }))
)

type LandingLink = {
  label: string
  to: string
  highlighted?: boolean
}

type HomeLandingProps = {
  title: ReactNode
  primaryLinks: readonly LandingLink[]
  secondaryLabel?: string
  secondaryLinks?: readonly LandingLink[]
  spotlight?: ReactNode
}

function HomeBackground({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="relative isolate min-h-svh overflow-hidden">
          {children}
        </main>
      }
    >
      <HomeBackgroundMedia>{children}</HomeBackgroundMedia>
    </Suspense>
  )
}

function HomeLanding({
  title,
  primaryLinks,
  secondaryLabel,
  secondaryLinks = [],
  spotlight,
}: HomeLandingProps) {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.classList.add("home-page")
    return () => document.documentElement.classList.remove("home-page")
  }, [])

  return (
    <HomeBackground>
      <>
        <section
          className="relative flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center max-[521px]:px-4 max-[521px]:py-12"
        >
          <div className="flex flex-col items-center">
            <h1
              className={cn(
                "m-0 whitespace-nowrap font-brand text-5xl leading-none font-bold tracking-[-.025em] [font-feature-settings:normal] [font-variation-settings:normal] [&>span]:text-primary sm:text-6xl md:text-7xl lg:text-8xl max-[521px]:mt-[7vh] max-[521px]:whitespace-normal max-[521px]:text-5xl",
                spotlight
                  ? "mb-2 max-[521px]:mb-2"
                  : "mb-9 max-[521px]:mb-7"
              )}
            >
              {title}
            </h1>
          </div>
          <div className="flex w-full flex-col items-center gap-7 max-[521px]:gap-6">
            {spotlight}
            <HomeSearch />
          </div>
          <nav
            className="mt-11 flex items-center justify-center gap-3 max-[768px]:max-w-[30rem] max-[768px]:flex-wrap max-[521px]:mt-8 max-[521px]:grid max-[521px]:w-full max-[521px]:grid-cols-2 max-[521px]:gap-[.55rem]"
            aria-label="Main guide sections"
          >
            {primaryLinks.map((link) => (
              <Button
                key={link.to}
                size="lg"
                variant={link.highlighted ? "default" : "outline"}
                className={cn(
                  "min-w-28 rounded-none whitespace-nowrap max-[521px]:min-w-0",
                  link.to === "/leagues" &&
                    "max-[521px]:order-1 max-[521px]:col-span-full max-[521px]:w-full"
                )}
                asChild
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </nav>
          {secondaryLinks.length > 0 && (
            <nav
              className="mt-[1.65rem] flex items-center justify-center gap-[1.15rem] text-[.96rem] font-bold text-primary max-[521px]:flex-wrap max-[521px]:gap-x-4 max-[521px]:gap-y-[.65rem] [&_a:hover]:text-foreground [&>span]:text-border"
              aria-label={secondaryLabel}
            >
              {secondaryLinks.map((link, index) => (
                <Fragment key={link.to}>
                  {index > 0 && <span aria-hidden="true">/</span>}
                  <Link to={link.to}>{link.label}</Link>
                </Fragment>
              ))}
            </nav>
          )}
        </section>
        <SiteSettingsButton
          className="fixed top-6 right-6 z-20 bg-[rgb(10_9_8_/_28%)] text-[color-mix(in_srgb,var(--foreground)_76%,transparent)] backdrop-blur-[8px] hover:bg-[rgb(10_9_8_/_72%)] hover:text-foreground focus-visible:bg-[rgb(10_9_8_/_72%)] focus-visible:text-foreground max-[521px]:top-4 max-[521px]:right-4"
          label="Open homepage settings"
        />
      </>
    </HomeBackground>
  )
}

export { HomeLanding, type HomeLandingProps, type LandingLink }
