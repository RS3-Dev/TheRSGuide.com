const slugifyHeading = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'

const createHeadingId = (value, usedIds) => {
  const slug = slugifyHeading(value)
  let id = slug
  let duplicate = 2

  while (usedIds.has(id)) {
    id = `${slug}-${duplicate}`
    duplicate += 1
  }

  usedIds.add(id)
  return id
}

export { createHeadingId, slugifyHeading }
