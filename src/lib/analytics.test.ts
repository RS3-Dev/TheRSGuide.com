import { describe, expect, it } from "vitest"

import {
  createAnonymousPageviewPayload,
  LEGACY_RYBBIT_STORAGE_KEYS,
  trackAnonymousPageview,
} from "@/lib/analytics"

describe("anonymous analytics", () => {
  it("sends only the fields needed for aggregate counts", () => {
    expect(createAnonymousPageviewPayload("thersguide.com")).toEqual({
      site_id: "d8c35c481bf4",
      hostname: "thersguide.com",
      pathname: "/",
      querystring: "",
      type: "pageview",
    })
  })

  it("cleans up identifiers left by the old Rybbit script", () => {
    expect(LEGACY_RYBBIT_STORAGE_KEYS).toContain("rybbit-visitor-id")
    expect(LEGACY_RYBBIT_STORAGE_KEYS).toContain("rybbit-user-id")
  })

  it("does nothing when a visitor opts out", () => {
    expect(() => trackAnonymousPageview("navigation", false)).not.toThrow()
  })
})
