import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { buildMessages, notify } from './notify-discord.mjs'

const before = 'a'.repeat(40)
const after = 'b'.repeat(40)
const event = {
  ref: 'refs/heads/main', before, after,
  repository: { html_url: 'https://github.com/RS3-Dev/TheRSGuide.com' },
}
const webhookUrl = 'https://discord.com/api/webhooks/123/test-token'

test('reads a real Git merge range with one link per commit', async () => {
  const base = execFileSync('git', ['rev-parse', 'HEAD^'], { encoding: 'utf8' }).trim()
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  const expected = execFileSync('git', ['rev-list', `${base}..${head}`], { encoding: 'utf8' }).trim().split('\n')
  const messages = []
  await notify({ event: { ...event, before: base, after: head }, webhookUrl,
    send: async (_url, options) => { messages.push(JSON.parse(options.body).content); return { ok: true } },
  })
  for (const sha of expected) assert.ok(messages.some(message => message.includes(`/commit/${sha}`)))
  assert.equal(messages.join('').match(/\/commit\//g).length, expected.length)
})

test('includes all merged commits, their titles, and the exact comparison', async () => {
  const requests = []
  const count = await notify({
    event, webhookUrl,
    git(command, args) {
      assert.equal(command, 'git')
      assert.ok(args.includes(`${before}..${after}`))
      return `${before}\0Fix a guide\0${after}\0Merge pull request #123\0`
    },
    async send(url, options) {
      assert.equal(url.searchParams.get('wait'), 'true')
      requests.push(JSON.parse(options.body))
      return { ok: true }
    },
  })
  assert.equal(count, 1)
  assert.match(requests[0].content, /Fix a guide/)
  assert.match(requests[0].content, /Merge pull request #123/)
  assert.ok(requests[0].content.includes(`/commit/${after}`))
  assert.ok(requests[0].content.includes(`/compare/${before}...${after}`))
  assert.deepEqual(requests[0].allowed_mentions, { parse: [] })
})

test('large changelogs retain every commit while fitting Discord messages', () => {
  const commits = Array.from({ length: 100 }, (_, index) => ({
    sha: index.toString(16).padStart(40, '0'), subject: '[link](bad) @everyone ' + '*'.repeat(200),
  }))
  const messages = buildMessages(event, commits)
  assert.ok(messages.length > 1)
  for (const message of messages) {
    assert.ok(message.content.length <= 2000)
    assert.deepEqual(message.allowed_mentions, { parse: [] })
  }
  for (const commit of commits) {
    assert.equal(messages.filter(message => message.content.includes(`/commit/${commit.sha}`)).length, 1)
  }
})

test('does not send for other branches or deleted main', async () => {
  const send = () => assert.fail('unexpected Discord request')
  assert.equal(await notify({ event: { ...event, ref: 'refs/heads/feature' }, send }), 0)
  assert.equal(await notify({ event: { ...event, deleted: true }, send }), 0)
})

test('fails clearly for missing secrets and does not expose webhook failures', async () => {
  await assert.rejects(notify({ event }), /DISCORD_WEBHOOK_URL/)
  const git = () => `${after}\0Update\0`
  await assert.rejects(notify({ event, webhookUrl, git, send: async () => ({ ok: false, status: 403 }) }), /HTTP 403/)
  await assert.rejects(notify({ event, webhookUrl, git, send: async () => { throw new Error(webhookUrl) } }), error => {
    assert.ok(!error.message.includes('test-token'))
    return true
  })
})

test('waits and retries when Discord rate limits a changelog message', async () => {
  let attempts = 0
  await notify({
    event, webhookUrl, git: () => `${after}\0Update\0`,
    wait: async milliseconds => assert.equal(milliseconds, 1600),
    send: async () => ++attempts === 1
      ? { ok: false, status: 429, json: async () => ({ retry_after: 1.5 }) }
      : { ok: true },
  })
  assert.equal(attempts, 2)
})

test('handles creation of main without comparing against an all-zero SHA', () => {
  const [message] = buildMessages({ ...event, before: '0'.repeat(40) }, [{ sha: after, subject: 'Initial' }])
  assert.ok(message.content.includes(`/commits/${after}`))
  assert.ok(!message.content.includes('/compare/'))
})
