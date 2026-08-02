import { SettingsDialogHeader } from "@/components/settings/settings-dialog-header"
import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Link } from "react-router"

function PrivacySettings({
  functional,
  analytics,
  onFunctionalChange,
  onAnalyticsChange,
  onBack,
  onReject,
  onSave,
}: {
  functional: boolean
  analytics: boolean
  onFunctionalChange: (enabled: boolean) => void
  onAnalyticsChange: (enabled: boolean) => void
  onBack: () => void
  onReject: () => void
  onSave: () => void
}) {
  return (
    <>
      <SettingsDialogHeader title="Privacy settings" onBack={onBack} />
      <ScrollArea
        className="h-full min-h-0"
        thumbClassName="bg-[color-mix(in_oklch,var(--muted-foreground)_55%,transparent)]"
      >
        <div className="px-6 pt-[1.35rem] pb-6">
          <DialogDescription className="mt-0 mb-5">
            Choose what this guide can count and remember. You can change this
            anytime.
          </DialogDescription>
          <FieldGroup className="gap-0">
            <Field
              className="items-start justify-between gap-6 py-4"
              orientation="horizontal"
            >
              <FieldContent>
                <FieldTitle className="mb-1 text-[.82rem]">
                  Basic traffic counts
                </FieldTitle>
                <FieldDescription className="m-0 max-w-[38rem] text-[.76rem] leading-[1.5]">
                  Helps us estimate daily visitors and sessions. The counting
                  code resets every day, and no analytics ID is saved in your
                  browser. We do not collect searches or anything you type.
                </FieldDescription>
              </FieldContent>
              <Switch
                className="mt-[.15rem]"
                checked={analytics}
                onCheckedChange={onAnalyticsChange}
                aria-label="Allow basic traffic counts"
              />
            </Field>
            <Field
              className="items-start justify-between gap-6 border-t py-4"
              orientation="horizontal"
            >
              <FieldContent>
                <FieldTitle className="mb-1 text-[.82rem]">
                  Remember my progress
                </FieldTitle>
                <FieldDescription className="m-0 max-w-[38rem] text-[.76rem] leading-[1.5]">
                  Saves your searches, checked-off steps, theme, and other
                  preferences on this device so they are here next time.
                </FieldDescription>
              </FieldContent>
              <Switch
                className="mt-[.15rem]"
                checked={functional}
                onCheckedChange={onFunctionalChange}
                aria-label="Remember guide progress and preferences"
              />
            </Field>
          </FieldGroup>
          <p className="mt-5 mb-0 text-[.72rem] leading-[1.5] text-muted-foreground">
            Want the fine print? Read the <Link className="font-bold text-primary underline underline-offset-2" to="/privacy" onClick={() => onSave()}>privacy notice</Link>.
          </p>
        </div>
      </ScrollArea>
      <DialogFooter className="justify-stretch [&>button]:flex-1 max-[521px]:flex-col-reverse max-[521px]:[&>button]:w-full">
        <Button variant="outline" onClick={onReject}>
          Turn both off
        </Button>
        <Button onClick={() => onSave()}>Save choices</Button>
      </DialogFooter>
    </>
  )
}

export { PrivacySettings }
