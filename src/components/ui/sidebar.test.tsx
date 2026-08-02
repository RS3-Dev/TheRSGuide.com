import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

describe("SidebarMenuButton", () => {
  it("only emits the data-active attribute for active items", () => {
    const markup = renderToStaticMarkup(
      <SidebarProvider>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Inactive</SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton isActive>Active</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarProvider>
    )

    expect(markup).not.toContain('data-active="false"')
    expect(markup).toContain('data-active="true"')
  })
})
