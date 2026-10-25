/* global process, console, fetch, URL, AbortSignal */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const discordLimit = 2000
const shaPattern = /^[a-f0-9]{40}$/i

export function buildMessages(event, commits) {
  const repoUrl = event.repository.html_url
  const initialPush = /^0+$/.test(event.before)
  const changesUrl = initialPush
    ? `${repoUrl}/commits/${event.after}`
    : `${repoUrl}/compare/${event.before}...${event.after}`
  const heading = '**The RS Guide updated** — changes merged or pushed to `main`'
  const footer = `\n[Full changelog](<${changesUrl}>) · [Website](<https://thersguide.com>)`
  const messages = []
  let message = heading
  for (const commit of commits) {
    // Commit messages are untrusted text: keep titles short and escape Discord Markdown.
    const subject = commit.subject.split(/\r?\n/)[0].slice(0, 120)
      .replace(/[\\`*_~|[\]<>]/g, '\\$&')
    const line = `\n- [${commit.sha.slice(0, 7)}](<${repoUrl}/commit/${commit.sha}>) ${subject}`
    if (message.length + line.length + footer.length > discordLimit) {
      messages.push(message + footer)
      message = '**The RS Guide changelog (continued)**'
    }
    message += line
  }
  messages.push(message + footer)
  return messages.map(content => ({ content, allowed_mentions: { parse: [] } }))
}

export async function notify({ event, webhookUrl, git = execFileSync, send = fetch, wait = sleep }) {
  if (event.deleted || event.ref !== 'refs/heads/main') return 0
  if (!webhookUrl) throw new Error('Configure the DISCORD_WEBHOOK_URL repository Actions secret.')
  if (!shaPattern.test(event.before) || !shaPattern.test(event.after)) {
    throw new Error('The push event contains invalid commit hashes.')
  }
  const range = /^0+$/.test(event.before) ? event.after : `${event.before}..${event.after}`
  const log = git('git', ['log', '--reverse', '--format=%H%x00%s', '-z', range, '--'], {
    encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  })
  const records = log.split('\0')
  const commits = []
  for (let index = 0; index + 1 < records.length; index += 2) {
    commits.push({ sha: records[index], subject: records[index + 1] })
  }
  const payloads = buildMessages(event, commits)
  // wait=true asks Discord to confirm the message was saved before reporting success.
  let endpoint
  try {
    endpoint = new URL(webhookUrl)
    if (endpoint.protocol !== 'https:' || endpoint.hostname !== 'discord.com'
      || !/^\/api\/webhooks\/\d+\/[^/]+$/.test(endpoint.pathname)) throw new Error()
    endpoint.searchParams.set('wait', 'true')
  } catch {
    throw new Error('DISCORD_WEBHOOK_URL must be a Discord incoming webhook URL.')
  }
  for (const payload of payloads) {
    let response
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        response = await send(endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload), signal: AbortSignal.timeout(30_000),
        })
      } catch {
        // Do not include fetch errors: they can contain the private webhook URL.
        throw new Error('Could not reach Discord. Check the webhook and rerun the workflow.')
      }
      if (response.status !== 429 || attempt === 3) break
      const { retry_after: retryAfter } = await response.json()
      if (!Number.isFinite(retryAfter) || retryAfter < 0 || retryAfter > 60) break
      await wait(Math.ceil(retryAfter * 1000) + 100)
    }
    if (!response.ok) throw new Error(`Discord notification failed (HTTP ${response.status}).`)
  }
  return payloads.length
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
    const count = await notify({ event, webhookUrl: process.env.DISCORD_WEBHOOK_URL })
    console.log(`Sent ${count} Discord changelog message(s).`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
