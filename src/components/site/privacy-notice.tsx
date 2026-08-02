import { Link } from "react-router"

import { Button } from "@/components/ui/button"

function PrivacyNotice() {
  return (
    <main className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-[52rem] px-5 py-12 sm:px-8 sm:py-16">
      <article className="text-[.92rem] leading-7 text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:text-foreground [&_li]:mb-2 [&_strong]:text-foreground [&_ul]:pl-5">
        <p className="mb-2 text-xs font-bold tracking-[.12em] text-primary uppercase">
          Updated August 2, 2026
        </p>
        <h1 className="mt-0 mb-4 text-4xl text-foreground">Privacy notice</h1>
        <p>
          The RS Guide collects the minimum information needed to count visits
          and remember features you choose. We do not sell
          visitor data, use it for advertising, or send player names and form
          values to analytics.
        </p>

        <h2>Traffic counts</h2>
        <p>
          We use our self-hosted Rybbit service to count pageviews and estimate
          daily visitors and sessions. When traffic counting is on, the site
          sends one pageview when the site opens and after each in-site
          navigation. Every event reports the page as <code>/</code>, so we can
          count activity but cannot see which guide or page you viewed.
        </p>
        <p>
          The event does not include player names, searches, form values, URL
          parameters, referrers, screen details, or a browser identifier. We do
          not record clicks or use session replay. Rybbit does not set an
          analytics cookie or save an analytics ID in your browser.
        </p>
        <p>
          Like any web request, the Rybbit server briefly receives your IP
          address and browser user agent. It may use them to estimate a broad
          location and device type and creates a code that resets each day. The
          raw IP address is not stored. The code lets us group pageviews into
          approximate daily browser and session counts, but it does not tell us
          how many individual people or RuneScape players visited.
        </p>
        <p>
          Traffic counting is on by default. You can turn it off at any time
          from Privacy Settings. Your choice is saved in a preference cookie
          that contains no unique browser ID.
        </p>

        <h2>Saved progress and preferences</h2>
        <p>
          If enabled, localStorage remembers player searches, manually checked
          progression, guide checklists, theme, sidebar state, and background
          media choices. This information stays in your browser and can be
          removed by disabling optional storage.
        </p>

        <h2>Retention and sharing</h2>
        <p>
          Individual pageview events are currently retained for no longer than
          13 months. Daily totals may be kept longer so we can compare traffic
          over time. Analytics is self-hosted in the United States and is not
          sold or shared for targeted advertising.
        </p>

        <h2>Videos and other media</h2>
        <p>
          The homepage can play a background video from Vimeo. It loads when
          background video is turned on. If you have not saved a choice, we
          default it off when your device asks websites to reduce motion. We use
          Vimeo&apos;s Do Not Track setting. Vimeo still receives the connection
          information needed to deliver the video and may use security cookies.
        </p>
        <p>
          If Remember my progress is on, the site can save your background-video
          choice. YouTube videos use its privacy-enhanced domain. In regions
          with stricter privacy defaults, they wait for you to choose Load video
          unless you have allowed saved preferences. Elsewhere, they may load
          when the page opens.
        </p>

        <h2>Your choices</h2>
        <p>
          Open the gear button on any page and choose Privacy Settings to change
          or withdraw your choices. To ask a privacy question or request access
          or deletion, open Settings and choose <strong>Send us a message</strong>.
        </p>

        <Button className="mt-8" variant="outline" asChild>
          <Link to="/">Return home</Link>
        </Button>
      </article>
    </main>
  )
}

export { PrivacyNotice }
