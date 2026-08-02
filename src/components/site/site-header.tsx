import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { Menu } from 'lucide-react'
import { MobileGuideNavigation } from '@/components/guides/mobile-guide-navigation'
import { GuideSearchButton } from '@/components/search/guide-search-button'
import { SiteSettingsButton } from '@/components/settings/site-settings-provider'
import { SiteLogo } from '@/components/site/site-logo'
import { ThemeToggle } from '@/components/site/theme-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { primaryNavigation } from '@/lib/content'
import { cn } from '@/lib/utils'

export function SiteHeader({
  showSettings,
}: {
  showSettings: boolean
}) {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 h-16 border-b bg-background/88 backdrop-blur-[18px]">
      <div className="mx-auto flex h-full max-w-[96rem] items-center gap-8 px-5 max-[521px]:px-[.8rem]">
        <SiteLogo />
        <nav
          className="flex h-full items-stretch gap-6 max-[768px]:hidden"
          aria-label="Primary navigation"
        >
          {primaryNavigation.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  "relative grid place-items-center text-sm font-bold hover:text-foreground",
                  isActive
                    ? "text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary"
                    : "text-muted-foreground"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-[.4rem]">
          {pathname !== '/' && <GuideSearchButton />}
          <ThemeToggle />
          {showSettings && <SiteSettingsButton label="Open site settings" />}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden max-[768px]:inline-flex"
              >
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col overflow-hidden bg-sidebar text-sidebar-foreground [--accent:var(--sidebar-accent)] [--accent-foreground:var(--sidebar-accent-foreground)] [--background:var(--sidebar)] [--border:var(--sidebar-border)] [--foreground:var(--sidebar-foreground)] [--muted-foreground:var(--sidebar-muted-foreground)] [--ring:var(--sidebar-ring)]"
            >
              <SheetHeader><SheetTitle><SiteLogo /></SheetTitle></SheetHeader>
              <ScrollArea className="min-h-0 flex-1">
                <MobileGuideNavigation close={() => setMobileOpen(false)} />
              </ScrollArea>
              <div className="flex justify-end border-t border-sidebar-border px-4 pt-3 pb-4">
                <SiteSettingsButton
                  className="text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  label="Open site settings"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
