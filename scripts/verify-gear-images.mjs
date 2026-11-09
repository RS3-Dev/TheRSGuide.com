// Checks that every item in src/data/gear-pieces.json has an image on the CDN.
// Usage: node scripts/verify-gear-images.mjs
import { readFile } from "node:fs/promises"

const GEAR_IMAGE_BASE = "https://cdn.featfinder.net/BankTags"
const CONCURRENCY = 12

const { weapons, armour } = JSON.parse(
  await readFile(new URL("../src/data/gear-pieces.json", import.meta.url), "utf8")
)

const configs = new Set(
  [...Object.values(weapons), ...Object.values(armour)].flatMap((slots) =>
    Object.values(slots).map((piece) => piece.config)
  )
)

const queue = configs.values()
const failures = []

await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (const config of queue) {
      const url = `${GEAR_IMAGE_BASE}/${config}.png`
      try {
        const response = await fetch(url)
        await response.arrayBuffer()
        const contentType = response.headers.get("content-type") ?? ""
        if (!response.ok || !contentType.startsWith("image/")) {
          failures.push(`${config}: ${response.status} ${contentType}`)
        }
      } catch (error) {
        failures.push(`${config}: ${error.message}`)
      }
    }
  })
)

console.log(`Checked ${configs.size} gear images, ${failures.length} failed.`)
if (failures.length > 0) {
  console.error(failures.join("\n"))
  process.exitCode = 1
}
