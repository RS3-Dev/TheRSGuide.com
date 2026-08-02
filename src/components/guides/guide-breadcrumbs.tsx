import { Fragment } from "react"
import { Link } from "react-router"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { guideCatalog, type Doc } from "@/lib/content"

function GuideBreadcrumbs({ doc }: { doc: Doc }) {
  const breadcrumbs = guideCatalog.breadcrumbs(doc.path)

  return (
    <Breadcrumb className="mb-[2.2rem] overflow-hidden">
      <BreadcrumbList className="flex-nowrap gap-[.4rem] overflow-hidden whitespace-nowrap text-xs [&_[data-slot=breadcrumb-page]]:truncate [&_[data-slot=breadcrumb-page]]:font-semibold">
        {breadcrumbs.map((breadcrumb, index) => (
          <Fragment key={breadcrumb.path}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {breadcrumb.current ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export { GuideBreadcrumbs }
