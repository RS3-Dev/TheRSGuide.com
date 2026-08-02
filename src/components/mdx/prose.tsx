/* eslint-disable react-refresh/only-export-components -- MDX rendering policy intentionally shares one deep module. */
import { type ComponentProps, type ReactNode } from "react"
import { Link } from "react-router"
import { ExternalLink } from "lucide-react"
import Zoom from "react-medium-image-zoom"

import { cn } from "@/lib/utils"

function SmartLink({
  href = "",
  className,
  children,
  ...props
}: ComponentProps<"a">) {
  const linkClassName = cn(
    "text-primary underline decoration-[color-mix(in_oklch,var(--primary)_35%,transparent)] underline-offset-[3px] hover:decoration-primary",
    className
  )

  if (href.startsWith("/")) {
    return (
      <Link to={href} className={linkClassName} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className={linkClassName}
      {...props}
    >
      {children}
    </a>
  )
}

function ProseImage({ className, ...props }: ComponentProps<"img">) {
  if (!props.src) return null
  return (
    <Zoom wrapElement="span">
      <img
        loading="lazy"
        className={cn("h-auto max-w-full", className)}
        {...props}
      />
    </Zoom>
  )
}

function ProseHeading1({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "mt-[3.8rem] scroll-mt-[5.5rem] font-display text-[2.25rem] leading-[1.15] font-semibold text-balance",
        className
      )}
      {...props}
    />
  )
}

function ProseHeading2({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "mt-[3.3rem] scroll-mt-[5.5rem] font-display text-[1.75rem] leading-[1.25]",
        className
      )}
      {...props}
    />
  )
}

function ProseHeading3({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "mt-[2.4rem] scroll-mt-[5.5rem] font-display text-xl leading-[1.25]",
        className
      )}
      {...props}
    />
  )
}

function ProseHeading4({ className, ...props }: ComponentProps<"h4">) {
  return (
    <h4
      className={cn(
        "scroll-mt-[5.5rem] font-display leading-[1.25]",
        className
      )}
      {...props}
    />
  )
}

function ProseCode({ className, ...props }: ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "rounded-sm bg-muted px-[.35rem] py-[.15rem] text-[.875em]",
        className
      )}
      {...props}
    />
  )
}

function ProsePre({ className, ...props }: ComponentProps<"pre">) {
  return (
    <pre
      className={cn("overflow-x-auto border bg-card p-4", className)}
      {...props}
    />
  )
}

function ProseBlockquote({
  className,
  ...props
}: ComponentProps<"blockquote">) {
  return (
    <blockquote
      className={cn(
        "ml-0 border-l-[3px] border-primary bg-[color-mix(in_oklch,var(--primary)_7%,transparent)] px-[1.2rem] py-[.8rem] text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function ProseTable({ className, ...props }: ComponentProps<"table">) {
  return (
    <table
      className={cn(
        "w-full border-collapse text-[.9rem]",
        className
      )}
      {...props}
    />
  )
}

function ProseTableHeader({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "border bg-muted px-[.8rem] py-[.7rem] text-left font-display",
        className
      )}
      {...props}
    />
  )
}

function ProseTableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border px-[.8rem] py-[.7rem] text-left",
        className
      )}
      {...props}
    />
  )
}

function TableScroll({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="table-scroll"
      className={cn(
        "my-[1.15rem] max-w-full overflow-x-auto border [&_table]:m-0 [&_table]:w-full [&_table]:min-w-max [&_table]:border-collapse [&_table]:text-[.9rem] [&_td]:border [&_td]:px-[.8rem] [&_td]:py-[.7rem] [&_td]:text-left [&_th]:border [&_th]:bg-muted [&_th]:px-[.8rem] [&_th]:py-[.7rem] [&_th]:text-left [&_th]:font-display",
        className
      )}
      {...props}
    />
  )
}

function ProseUnorderedList({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul className={cn("list-disc pl-[1.4rem]", className)} {...props} />
  )
}

function ProseOrderedList({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol className={cn("list-decimal pl-[1.4rem]", className)} {...props} />
  )
}

function ProseListItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("my-[.35rem]", className)} {...props} />
}

function DocCard({
  title,
  href,
  children,
}: {
  title?: string
  href?: string
  children?: ReactNode
}) {
  const content = (
    <>
      <div className="font-display font-bold">{title ?? children}</div>
      {href && (
        <ExternalLink className="size-4 text-primary" aria-hidden="true" />
      )}
    </>
  )
  const className =
    "flex min-h-20 items-center justify-between gap-4 border bg-card/60 p-4 transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-primary"

  return href ? (
    <SmartLink href={href} className={className}>
      {content}
    </SmartLink>
  ) : (
    <div className={cn(className, "text-foreground")}>{content}</div>
  )
}

function Cards({ children }: { children?: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 max-[768px]:grid-cols-1">
      {children}
    </div>
  )
}

const proseComponents = {
  a: SmartLink,
  img: ProseImage,
  h1: ProseHeading1,
  h2: ProseHeading2,
  h3: ProseHeading3,
  h4: ProseHeading4,
  code: ProseCode,
  pre: ProsePre,
  blockquote: ProseBlockquote,
  table: ProseTable,
  th: ProseTableHeader,
  td: ProseTableCell,
  ul: ProseUnorderedList,
  ol: ProseOrderedList,
  li: ProseListItem,
}

const proseFlowClassName =
  "text-base leading-7 [&>:not([data-prose-header]):not([data-slot=table-scroll])]:my-[1.15rem]"

export {
  Cards,
  DocCard,
  ProseBlockquote,
  ProseCode,
  ProseHeading1,
  ProseHeading2,
  ProseHeading3,
  ProseHeading4,
  ProseImage,
  ProseListItem,
  ProseOrderedList,
  ProsePre,
  ProseTable,
  ProseTableCell,
  ProseTableHeader,
  ProseUnorderedList,
  SmartLink,
  TableScroll,
  proseComponents,
  proseFlowClassName,
}
