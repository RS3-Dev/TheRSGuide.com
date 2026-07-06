"use client";

import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { PlayerDataProvider } from "@/mdx_components/components/player-data-context";
import { StableSearchDialog } from "@/components/search-dialog";

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <RootProvider search={{ SearchDialog: StableSearchDialog }}>
      <PlayerDataProvider>{children}</PlayerDataProvider>
    </RootProvider>
  );
}
