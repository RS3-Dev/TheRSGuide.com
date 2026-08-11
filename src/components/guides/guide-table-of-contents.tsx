import {
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react"
import { useLocation } from "react-router"

import { ScrollArea } from "@/components/ui/scroll-area"
import type { Doc } from "@/lib/content"
import { cn } from "@/lib/utils"
import { createHeadingId } from "../../../shared/heading-id.js"

function GuideTableOfContents({
  doc,
  contentRef,
}: {
  doc: Doc
  contentRef: RefObject<HTMLElement | null>
}) {
  const { pathname } = useLocation()
  const [items, setItems] = useState(doc.tableOfContents)
  const [activeId, setActiveId] = useState("")
  const progressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const article = contentRef.current
    const update = () => {
      const headings = Array.from(
        article?.querySelectorAll<HTMLElement>("h2, h3") ?? []
      )
      const usedIds = new Set(
        headings.map((heading) => heading.id).filter(Boolean)
      )
      const renderedItems = headings.map((heading) => {
        if (!heading.id) {
          heading.id = createHeadingId(heading.textContent || "", usedIds)
        }
        return {
          id: heading.id,
          text: heading.textContent || "",
          level: Number(heading.tagName.slice(1)) as 2 | 3,
        }
      })
      setItems(renderedItems.length ? renderedItems : doc.tableOfContents)
    }

    setItems(doc.tableOfContents)
    update()
    const observer = new MutationObserver(update)
    if (article) observer.observe(article, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [contentRef, doc, pathname])

  useEffect(() => {
    if (!items.length) return

    let frame = 0
    const updateProgress = () => {
      frame = 0
      const headings = items
        .map((item) =>
          contentRef.current?.querySelector<HTMLElement>(
            `#${CSS.escape(item.id)}`
          )
        )
        .filter((heading): heading is HTMLElement => Boolean(heading))
      if (!headings.length) return

      const readingPosition =
        window.scrollY + Math.min(window.innerHeight * 0.3, 240)
      const headingPositions = headings.map(
        (heading) => heading.getBoundingClientRect().top + window.scrollY
      )
      const isAtPageEnd =
        window.scrollY > 0 &&
        Math.ceil(window.scrollY + window.innerHeight) >=
          document.documentElement.scrollHeight - 2
      let activeIndex = 0

      if (isAtPageEnd) {
        activeIndex = headings.length - 1
      } else {
        for (let index = 1; index < headingPositions.length; index += 1) {
          if (headingPositions[index] > readingPosition) break
          activeIndex = index
        }
      }

      const currentPosition = headingPositions[activeIndex]
      const nextPosition = headingPositions[activeIndex + 1]
      const sectionProgress = isAtPageEnd
        ? 0
        : nextPosition
          ? Math.min(
              Math.max(
                (readingPosition - currentPosition) /
                  (nextPosition - currentPosition),
                0
              ),
              1
            )
          : 0
      const progress = isAtPageEnd
        ? 1
        : Math.min(
            (activeIndex + sectionProgress + 1) / headings.length,
            1
          )

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleY(${progress})`
      }
      setActiveId((current) =>
        current === headings[activeIndex].id
          ? current
          : headings[activeIndex].id
      )
    }

    const scheduleProgressUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener("scroll", scheduleProgressUpdate, {
      passive: true,
    })
    window.addEventListener("resize", scheduleProgressUpdate)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", scheduleProgressUpdate)
      window.removeEventListener("resize", scheduleProgressUpdate)
    }
  }, [contentRef, items])

  if (!doc.hasTableOfContents) return null

  return (
    <aside className="sticky top-24 mt-[6.8rem] h-[calc(100svh-8rem)] self-start max-[1101px]:hidden">
      <ScrollArea className="h-full">
        <nav
          className="relative border-l py-0 pr-3 pl-4"
          aria-labelledby="toc-title"
        >
          <span
            ref={progressRef}
            className="pointer-events-none absolute top-0 -left-px h-full w-0.5 origin-top bg-primary transition-transform duration-100 ease-linear"
            style={{ transform: "scaleY(0)" }}
            aria-hidden="true"
          />
          <p
            className="mt-0 mb-[.8rem] font-display text-[.78rem] font-bold tracking-[.09em] text-foreground uppercase"
            id="toc-title"
          >
            On this page
          </p>
          <ul className="m-0 flex list-none flex-col gap-[.18rem] p-0">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  className={cn(
                    "block rounded-sm px-2 py-[.38rem] text-sm leading-[1.4] font-semibold transition-[color,background-color] duration-150 hover:bg-accent/65 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                    item.level === 3 &&
                      "pl-[1.15rem] text-[.825rem] font-medium",
                    activeId === item.id
                      ? "bg-accent/45 text-foreground"
                      : "text-muted-foreground"
                  )}
                  href={`#${item.id}`}
                  aria-current={activeId === item.id ? "location" : undefined}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
    </aside>
  )
}

export { GuideTableOfContents }
