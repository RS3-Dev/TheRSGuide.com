import { type FormEvent, useState } from "react"
import { MessageSquareIcon } from "lucide-react"

import { GithubIssueLink } from "@/components/settings/github-issue-link"
import { SettingsDialogHeader } from "@/components/settings/settings-dialog-header"
import { Button } from "@/components/ui/button"
import { DialogDescription } from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

const MAX_FEEDBACK_LENGTH = 1500

function FeedbackSettings({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<{
    type: "error" | "success"
    message: string
  } | null>(null)
  const [sending, setSending] = useState(false)

  const sendFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage || sending) return

    setSending(true)
    setStatus(null)
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmedMessage,
          page: window.location.pathname,
        }),
      })
      const payload = (await response
        .json()
        .catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        throw new Error(
          payload?.error || "Unable to send this message right now"
        )
      }

      setMessage("")
      setStatus({
        type: "success",
        message: "Thanks! Your message was sent.",
      })
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to send this message right now",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <SettingsDialogHeader title="Send us a message" onBack={onBack} />
      <form
        className="flex min-h-0 flex-col items-stretch gap-5 overflow-y-auto px-6 pt-[1.35rem] pb-6 [&_[data-slot=field-group]]:gap-4 [&_[data-slot=textarea]]:min-h-36 [&_[data-slot=textarea]]:resize-y [&>button]:self-end"
        onSubmit={sendFeedback}
      >
        <DialogDescription>
          Found an error or have an idea? Send it directly to the guide team.
        </DialogDescription>
        <FieldGroup>
          <Field data-invalid={status?.type === "error"}>
            <FieldLabel htmlFor="settings-feedback-message">Message</FieldLabel>
            <Textarea
              id="settings-feedback-message"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                setStatus(null)
              }}
              placeholder="Tell us what could be clearer, what is missing, or what went wrong."
              maxLength={MAX_FEEDBACK_LENGTH}
              rows={7}
              disabled={sending}
              aria-invalid={status?.type === "error"}
            />
            <FieldDescription>
              {message.length}/{MAX_FEEDBACK_LENGTH} characters. Please do not
              include passwords or other private information.
            </FieldDescription>
            {status?.type === "error" && (
              <FieldError>{status.message}</FieldError>
            )}
            {status?.type === "success" && (
              <p
                className="m-0 text-[.76rem] font-bold text-foreground"
                role="status"
              >
                {status.message}
              </p>
            )}
          </Field>
        </FieldGroup>
        <Button type="submit" disabled={!message.trim() || sending}>
          {sending ? (
            <Spinner data-icon="inline-start" aria-hidden="true" />
          ) : (
            <MessageSquareIcon data-icon="inline-start" />
          )}
          {sending ? "Sending…" : "Send message"}
        </Button>
        <GithubIssueLink />
      </form>
    </>
  )
}

export { FeedbackSettings }
