import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

function NotFoundContent() {
  return (
    <main className="grid min-h-[calc(100svh-4rem)] place-content-center justify-items-center">
      <Empty className="gap-4 border-0">
        <EmptyHeader>
          <EmptyDescription>Lost in Gielinor</EmptyDescription>
          <EmptyTitle className="font-display text-[2.5rem]">
            That guide hasn't been written.
          </EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/">Return home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}

export { NotFoundContent }
