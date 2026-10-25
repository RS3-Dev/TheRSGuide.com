# Discord update notifications

The `Discord main changelog` GitHub Actions workflow posts whenever commits are
pushed to `main`, including merge, squash, and rebase merges and direct pushes.
Other branches and pull request events do not send notifications.

Each notification includes commit titles, short commit hashes linked to the full
commits, a comparison link for the complete update, and a link to the website.
Large updates are split into multiple messages. Mentions are disabled, so commit
titles cannot ping users or roles.

## One-time setup

1. In the destination Discord server, open the channel's **Edit Channel →
   Integrations → Webhooks**, create a webhook, and copy its URL.
2. In this repository, open **Settings → Secrets and variables → Actions →
   New repository secret**.
3. Set the name to `DISCORD_WEBHOOK_URL` and paste the webhook URL as its value.

Do not commit the URL or put it in an Actions variable. The workflow requires
only read access to the repository; it does not need a Discord bot or npm install.

After setup and merging the workflow, the next push to `main` sends a notification.
Merging the workflow itself also triggers it if the secret is already present.
This announces source changes, not confirmation that Railway has deployed them.

## Troubleshooting

Check **Actions → Discord main changelog** for the run associated with a push.
A missing secret or failed Discord request fails the job with a diagnostic.
After fixing the secret or a temporary Discord failure, use **Re-run failed jobs**.
Rerunning a successful job sends the changelog again; a partially delivered large
changelog can also be repeated when rerun.

Run the notification tests locally without sending Discord messages:

```bash
npx vitest run .github/scripts/notify-discord.test.mjs
```
