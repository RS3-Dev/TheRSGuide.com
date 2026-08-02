import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { PageLoading } from "@/components/ui/page-loading"

describe("PageLoading", () => {
  it("renders an accessible status label without announcing the nested icon", () => {
    const markup = renderToStaticMarkup(
      <PageLoading label="Loading player progression" />
    )

    expect(markup).toContain('role="status"')
    expect(markup).toContain('aria-label="Loading player progression"')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain("[animation-duration:.8s]")
  })
})
