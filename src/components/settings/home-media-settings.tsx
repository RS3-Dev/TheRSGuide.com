import { VideoIcon, Volume2Icon, VolumeXIcon } from "lucide-react"

import type { HomeMediaSettings as HomeMediaSettingsValue } from "@/components/settings/site-settings-context"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

function HomeMediaSettings({
  settings,
}: {
  settings: HomeMediaSettingsValue
}) {
  return (
    <FieldSet className="flex flex-col gap-4">
      <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-4 px-3">
        <VideoIcon className="size-[1.1rem] text-primary" aria-hidden="true" />
        <h3
          className="m-0 font-sans text-[.88rem] font-extrabold"
          id="homepage-media-title"
        >
          Homepage background
        </h3>
      </div>
      <FieldGroup className="gap-0 border-y">
        <Field
          className="min-h-14 cursor-pointer justify-between gap-6 px-3 py-[.9rem] max-[521px]:gap-4"
          orientation="horizontal"
        >
          <FieldTitle className="text-[.8rem] font-extrabold">
            Background video
          </FieldTitle>
          <Switch
            id="settings-background-video"
            checked={settings.enabled}
            onCheckedChange={settings.setEnabled}
            aria-label="Background video"
          />
        </Field>
        <Field
          className="grid min-h-14 grid-cols-[2rem_auto_minmax(5rem,1fr)_2.75rem] items-center gap-3 border-t px-3 py-3 text-foreground transition-[color,opacity] duration-150 data-[disabled=true]:text-muted-foreground max-[521px]:grid-cols-[2rem_minmax(4rem,1fr)_2.75rem]"
          orientation="horizontal"
          data-muted={settings.muted || undefined}
          data-disabled={!settings.enabled || undefined}
        >
          <Button
            className="text-current"
            variant="ghost"
            size="icon-sm"
            onClick={() => settings.setMuted(!settings.muted)}
            disabled={!settings.enabled}
            aria-label={
              settings.muted
                ? "Unmute background video"
                : "Mute background video"
            }
            aria-pressed={settings.muted}
            title={
              settings.muted
                ? "Unmute background video"
                : "Mute background video"
            }
          >
            {settings.muted ? <VolumeXIcon /> : <Volume2Icon />}
          </Button>
          <span className="text-[.8rem] font-extrabold max-[521px]:hidden">
            Volume
          </span>
          <Slider
            className="h-5 min-w-0 opacity-100"
            trackClassName="h-[.3rem] bg-[color-mix(in_oklch,var(--muted-foreground)_32%,var(--muted))]"
            rangeClassName="bg-primary"
            thumbClassName="size-[.85rem] border-2 border-background bg-foreground shadow-[0_0_0_1px_var(--ring)]"
            value={[settings.volume]}
            min={1}
            max={100}
            step={1}
            disabled={!settings.enabled || settings.muted}
            onValueChange={([volume]) => settings.setVolume(volume)}
            aria-label="Background video volume"
            aria-valuetext={`${settings.volume}%`}
          />
          <output className="text-right text-xs font-extrabold tabular-nums">
            {settings.volume}%
          </output>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

export { HomeMediaSettings }
