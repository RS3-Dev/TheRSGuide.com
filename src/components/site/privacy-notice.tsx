import { Link } from "react-router"

import { Button } from "@/components/ui/button"

function PrivacyNotice() {
  return (
    <main className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-[52rem] px-5 py-12 sm:px-8 sm:py-16">
      <article className="text-[.92rem] leading-7 text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:text-foreground [&_li]:mb-2 [&_strong]:text-foreground [&_ul]:pl-5">
        <p className="mb-2 text-xs font-bold tracking-[.12em] text-primary uppercase">
          Updated August 3, 2026
        </p>
        <h1 className="mt-0 mb-4 text-4xl text-foreground">Privacy notice</h1>
        <p>
          The RS Guide collects the minimum information needed to count visits
          and remember features you choose. The RS Guide team controls this
          information. We do not sell visitor data, use it for advertising, or
          send player names and form values to analytics. You can contact the
          team through <strong>Send us a message</strong> in Settings.
        </p>

        <h2>Traffic counts</h2>
        <p>
          We use our self-hosted Rybbit service to count pageviews and estimate
          daily visitors and sessions. When traffic counting is on, the site
          sends one pageview when the site opens and after each in-site
          navigation. Each event includes the page path, such as{" "}
          <code>/guides/skill-training</code>, so we can understand which
          guides are used and how visitors move through the site.
        </p>
        <p>
          The event does not include player names, searches, form values, URL
          parameters, referrers, screen details, or a browser identifier. We do
          not record clicks or use session replay. Rybbit does not set an
          analytics cookie or save an analytics ID in your browser.
        </p>
        <p>
          Like any web request, the Rybbit server briefly receives your IP
          address and browser user agent. It uses the IP address to estimate
          your country and region and uses the user agent to estimate a broad
          device type. Rybbit does not store the raw IP address. Instead, it
          combines the IP address and user agent with a secret salt that changes
          every day to create a daily code. The code lets us group pageviews
          into approximate daily browser and session counts, but it cannot link
          visits across different days or identify a RuneScape player.
        </p>
        <p>
          Traffic counting is on by default. You can turn it off at any time
          from Privacy Settings. Your choice is saved in a preference cookie
          that contains no unique browser ID. We also treat an enabled Global
          Privacy Control or Do Not Track browser signal as an opt-out and do
          not send analytics pageviews while that signal is active.
        </p>

        <h2>Why we process traffic information</h2>
        <p>
          We process this limited traffic information based on our legitimate
          interest in understanding which guides are useful, how visitors move
          between pages, and whether the site is working effectively. We limit
          the information collected, rotate the grouping salt daily, avoid
          persistent analytics identifiers, and provide browser- and site-level
          opt-outs to reduce the effect on visitor privacy.
        </p>

        <h2>Saved progress and preferences</h2>
        <p>
          If enabled, localStorage remembers player searches, manually checked
          progression, guide checklists, Leagues randomizer choices, theme,
          sidebar state, and background media choices. This information stays
          in your browser and can be removed by disabling optional storage.
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
          your choices or object to future traffic measurement. To ask a privacy
          question or exercise applicable rights to access, correct, restrict,
          or delete personal information, open Settings and choose
          <strong> Send us a message</strong>. You may also lodge a complaint
          with the data-protection authority where you live or work.
        </p>
        <p>
          Because Rybbit does not store your raw IP address or a persistent
          browser identifier, and the grouping salt changes every day, we cannot
          identify which analytics events belong to you. This means we generally
          cannot retrieve, correct, or delete one visitor&apos;s historical events
          without collecting additional identifying information, which we do not
          do. We can still stop future measurement through the controls above
          and delete analytics data in aggregate.
        </p>

        <Button className="mt-8" variant="outline" asChild>
          <Link to="/">Return home</Link>
        </Button>
      </article>
    </main>
  )
}

export { PrivacyNotice }
