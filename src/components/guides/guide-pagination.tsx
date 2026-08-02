import { Link } from "react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { guideCatalog, type Doc } from "@/lib/content"

function GuidePagination({ doc }: { doc: Doc }) {
  const { previous, next } = guideCatalog.adjacent(doc)

  return (
    <div className="grid grid-cols-2 gap-4 pt-6">
      {previous ? (
        <Link
          className="flex items-center gap-2 font-display text-[.8rem] text-muted-foreground [&>svg]:size-4"
          to={previous.path}
        >
          <ChevronLeft />
          <span>
            <small className="block font-sans text-[.68rem] tracking-[.1em] text-primary uppercase">
              Previous
            </small>
            {previous.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          className="flex items-center justify-end gap-2 text-right font-display text-[.8rem] text-muted-foreground [&>svg]:size-4"
          to={next.path}
        >
          <span>
            <small className="block font-sans text-[.68rem] tracking-[.1em] text-primary uppercase">
              Next
            </small>
            {next.title}
          </span>
          <ChevronRight />
        </Link>
      )}
    </div>
  )
}

export { GuidePagination }
