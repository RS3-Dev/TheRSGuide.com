import {
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { useSiteSettings } from '@/components/settings/site-settings-context'
import { BackgroundMediaController } from '@/lib/background-media'
import {
  browserBackgroundMediaPreferences,
  vimeoBackgroundMediaAdapter,
} from '@/lib/vimeo-background-media'

const HOME_BACKGROUND_VIDEO_URL = 'https://player.vimeo.com/video/1212838611?background=1&autoplay=1&muted=1&loop=1&autopause=0&dnt=1'

export function HomeBackgroundMedia({ children }: { children: ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { registerHomeMedia } = useSiteSettings()
  const controller = useMemo(
    () => new BackgroundMediaController(
      vimeoBackgroundMediaAdapter,
      browserBackgroundMediaPreferences,
      10,
    ),
    [],
  )
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  )

  useEffect(() => {
    if (!state.enabled || !iframeRef.current) return
    controller.attach(iframeRef.current)
    return () => controller.detach()
  }, [controller, state.enabled])

  useEffect(() => () => controller.dispose(), [controller])

  const mediaSettings = useMemo(() => ({
    enabled: state.enabled,
    muted: state.muted,
    volume: state.volume,
    setEnabled: controller.setEnabled,
    setMuted: controller.setMuted,
    setVolume: controller.setVolume,
  }), [controller, state.enabled, state.muted, state.volume])

  useEffect(() => {
    registerHomeMedia(mediaSettings)
  }, [mediaSettings, registerHomeMedia])

  useEffect(() => () => registerHomeMedia(null), [registerHomeMedia])

  return (
    <main
      className="relative isolate min-h-svh overflow-hidden data-[video-enabled=true]:[--accent-foreground:#efe4d2] data-[video-enabled=true]:[--accent:#1f1a14] data-[video-enabled=true]:[--border:rgb(204_154_99_/_38%)] data-[video-enabled=true]:[--card-foreground:#efe4d2] data-[video-enabled=true]:[--card:rgb(20_18_16_/_88%)] data-[video-enabled=true]:[--foreground:#efe4d2] data-[video-enabled=true]:[--input:var(--border)] data-[video-enabled=true]:[--muted-foreground:#cc9a63] data-[video-enabled=true]:[--muted:#1a1510] data-[video-enabled=true]:[--popover-foreground:#efe4d2] data-[video-enabled=true]:[--popover:#141210] data-[video-enabled=true]:[--primary-foreground:#0a0908] data-[video-enabled=true]:[--primary:#cc9a63] data-[video-enabled=true]:[--ring:var(--primary)] data-[video-enabled=true]:[--secondary-foreground:#efe4d2] data-[video-enabled=true]:[--secondary:#1a1510]"
      data-video-enabled={state.enabled}
    >
      {state.enabled && (
        <>
          <div
            className="group/video absolute inset-0 overflow-hidden bg-home-video-background bg-center bg-cover"
            data-video-playing={state.loaded}
            aria-hidden="true"
          >
            <iframe
              ref={iframeRef}
              id="home-background-video"
              className="pointer-events-none absolute top-1/2 left-1/2 h-[max(100svh,56.25vw)] w-[max(100vw,177.78svh)] -translate-x-1/2 -translate-y-1/2 scale-[1.03] border-0"
              src={HOME_BACKGROUND_VIDEO_URL}
              title="Homepage background video"
              tabIndex={-1}
              allow="autoplay; fullscreen; picture-in-picture"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-home-video-background opacity-100 transition-opacity duration-350 ease-in-out group-data-[video-playing=true]/video:opacity-0"
              aria-hidden="true"
            />
          </div>
          <div
            className="absolute inset-0 bg-[rgb(10_9_8_/_62%)]"
            aria-hidden="true"
          />
        </>
      )}

      {children}

    </main>
  )
}
