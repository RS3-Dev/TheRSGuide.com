export type PrivacyRegion = "strict" | "standard"

const PRIVACY_REGION_META = "rs-guide-privacy-region"

function readPrivacyRegion(
  source: Pick<Document, "querySelector"> = document
): PrivacyRegion {
  const region = source
    .querySelector<HTMLMetaElement>(`meta[name="${PRIVACY_REGION_META}"]`)
    ?.content.toLowerCase()

  return region === "standard" ? "standard" : "strict"
}

export { PRIVACY_REGION_META, readPrivacyRegion }
