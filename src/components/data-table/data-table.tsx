import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsUpDown,
  ExternalLink,
  Info,
  ListFilter,
} from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type DataTableHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
type DataTableRow = Record<string, unknown>

type DataTableFilterOption = {
  label: string
  value: string | number | boolean
}

type DataTableFilter = {
  label?: string
  options?: readonly DataTableFilterOption[]
}

type DataTableColumn = {
  key: string
  header?: string
  hidden?: boolean
  sortable?: boolean
  filter?: boolean | DataTableFilter
  link?: {
    hrefKey: string
    external?: boolean
  }
  info?: boolean | {
    contentKey?: string
    label?: string
  }
  align?: string
  width?: string
  emphasis?: boolean
  wrap?: boolean
}

type DataTableSearch = {
  label?: string
  placeholder?: string
}

type DataTableConfig = {
  title: string
  titleAs?: string
  headingId?: string
  collapsed?: boolean
  sortable?: boolean
  columns: readonly DataTableColumn[]
  rows: readonly DataTableRow[]
  caption?: string
  emptyMessage?: string
  rowId?: string
  search?: boolean | DataTableSearch
}

type DataTableProps = {
  config: DataTableConfig
  className?: string
}

type ResolvedDataTableColumn = Omit<DataTableColumn, "filter" | "header"> & {
  header: string
  filter?: DataTableFilter & { options: readonly DataTableFilterOption[] }
}

const dataTableFilterOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
})

const dataTableColumnSchema = z.object({
  key: z.string().min(1),
  header: z.string().optional(),
  hidden: z.boolean().optional(),
  sortable: z.boolean().optional(),
  filter: z.union([
    z.boolean(),
    z.object({
      label: z.string().optional(),
      options: z.array(dataTableFilterOptionSchema).optional(),
    }),
  ]).optional(),
  link: z.object({
    hrefKey: z.string().min(1),
    external: z.boolean().optional(),
  }).optional(),
  info: z.union([
    z.boolean(),
    z.object({
      contentKey: z.string().optional(),
      label: z.string().optional(),
    }),
  ]).optional(),
  align: z.string().optional(),
  width: z.string().optional(),
  emphasis: z.boolean().optional(),
  wrap: z.boolean().optional(),
})

const dataTableConfigSchema = z.object({
  title: z.string().min(1),
  titleAs: z.string().optional(),
  headingId: z.string().optional(),
  collapsed: z.boolean().optional(),
  sortable: z.boolean().optional(),
  columns: z.array(dataTableColumnSchema).min(1),
  rows: z.array(z.record(z.string(), z.unknown())),
  caption: z.string().optional(),
  emptyMessage: z.string().optional(),
  rowId: z.string().optional(),
  search: z.union([
    z.boolean(),
    z.object({
      label: z.string().optional(),
      placeholder: z.string().optional(),
    }),
  ]).optional(),
})

const headingTags = new Set<DataTableHeadingTag>([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
])

const resolveHeadingTag = (value?: string): DataTableHeadingTag =>
  headingTags.has(value as DataTableHeadingTag)
    ? value as DataTableHeadingTag
    : "h2"

const humanizeKey = (key: string): string =>
  key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase())

const slugifyHeading = (value: string): string =>
  value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "table"

const searchableValue = (value: unknown): string => {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const displayValue = (value: unknown): ReactNode => {
  if (value == null) return null
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "string" || typeof value === "number") return value
  return searchableValue(value)
}

function DataTableInfo({
  content,
  label,
}: {
  content: ReactNode
  label: string
}) {
  const [hoverOpen, setHoverOpen] = useState(false)
  const [tapOpen, setTapOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }

  const handlePointerEnter = (pointerType: string) => {
    if (pointerType !== "mouse") return
    clearCloseTimer()
    setHoverOpen(true)
  }

  const handlePointerLeave = (pointerType: string) => {
    if (pointerType !== "mouse") return
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setHoverOpen(false), 100)
  }

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  return (
    <Popover open={hoverOpen || tapOpen} onOpenChange={setTapOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={label}
          onPointerEnter={(event) => handlePointerEnter(event.pointerType)}
          onPointerLeave={(event) => handlePointerLeave(event.pointerType)}
        >
          <Info aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64"
        onPointerEnter={(event) => handlePointerEnter(event.pointerType)}
        onPointerLeave={(event) => handlePointerLeave(event.pointerType)}
      >
        <PopoverHeader>
          <PopoverTitle className="sr-only">{label}</PopoverTitle>
          <PopoverDescription className="text-foreground">
            {content}
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

function DataTableMultiSelect({
  id,
  label,
  onChange,
  options,
  selectedValues,
}: {
  id: string
  label: string
  onChange: (values: string[]) => void
  options: readonly DataTableFilterOption[]
  selectedValues: string[]
}) {
  const [open, setOpen] = useState(false)
  const selectedLabel = selectedValues.length === 1
    ? options.find((option) => String(option.value) === selectedValues[0])?.label
    : undefined

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={`Filter by ${label}`}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {selectedLabel
                ?? (selectedValues.length
                  ? `${selectedValues.length} selected`
                  : "All options")}
            </span>
            <ChevronsUpDown data-icon="inline-end" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput placeholder={`Search ${label.toLocaleLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const optionValue = String(option.value)
                  const checked = selectedValues.includes(optionValue)

                  return (
                    <CommandItem
                      key={optionValue}
                      value={`${option.label} ${optionValue}`}
                      data-checked={checked}
                      onSelect={() => onChange(
                        checked
                          ? selectedValues.filter((value) => value !== optionValue)
                          : [...selectedValues, optionValue]
                      )}
                    >
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Field>
  )
}

function DataTableContent({
  config,
  className,
}: DataTableProps) {
  const {
    title,
    caption,
    columns: configuredColumns,
    emptyMessage = "No results.",
    rowId,
    rows,
    search,
    sortable = false,
  } = config
  const Heading = resolveHeadingTag(config.titleAs)
  const id = useId()
  const headingId = config.headingId ?? slugifyHeading(title)
  const collapsible = typeof config.collapsed === "boolean"
  const [isCollapsed, setIsCollapsed] = useState(config.collapsed ?? false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const textFilterFn = useMemo<FilterFn<DataTableRow>>(
    () => (row, columnId, filterValue) =>
      searchableValue(row.getValue(columnId))
        .toLocaleLowerCase()
        .includes(String(filterValue).toLocaleLowerCase()),
    []
  )
  const optionFilterFn = useMemo<FilterFn<DataTableRow>>(
    () => (row, columnId, filterValue) => {
      const selectedValues = filterValue as string[] | undefined
      return !selectedValues?.length
        || selectedValues.includes(searchableValue(row.getValue(columnId)))
    },
    []
  )
  const tableData = useMemo(() => [...rows], [rows])
  const columns = useMemo<ResolvedDataTableColumn[]>(
    () => configuredColumns.map((column) => {
      const configuredFilter = typeof column.filter === "object"
        ? column.filter
        : undefined
      const options = configuredFilter?.options ?? (
        column.filter
          ? Array.from(new Set(
            rows.map((row) => searchableValue(row[column.key])).filter(Boolean)
          )).map((value) => ({ label: value, value }))
          : []
      )

      return {
        ...column,
        header: column.header ?? humanizeKey(column.key),
        sortable: column.sortable ?? sortable,
        filter: column.filter
          ? { label: configuredFilter?.label, options }
          : undefined,
      }
    }),
    [configuredColumns, rows, sortable]
  )
  const searchConfig = typeof search === "object"
    ? search
    : search
      ? {}
      : undefined
  const allColumnHeadersHidden = columns.every((column) => column.hidden)

  const tableColumns = useMemo<ColumnDef<DataTableRow, unknown>[]>(
    () => columns.map((column) => ({
      id: column.key,
      accessorFn: (row) => row[column.key],
      header: column.header,
      cell: ({ getValue, row }) => {
        const value = getValue()
        const href = column.link
          ? row.original[column.link.hrefKey]
          : undefined
        const infoConfig = typeof column.info === "object" ? column.info : undefined
        const infoValue = column.info
          ? row.original[infoConfig?.contentKey ?? "info"]
          : undefined
        const renderedValue = column.link && typeof href === "string" ? (
          <a
            href={href}
            target={column.link.external ? "_blank" : undefined}
            rel={column.link.external ? "noreferrer" : undefined}
            className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4 hover:text-foreground [&_svg]:size-3.5"
          >
            {displayValue(value)}
            {column.link.external ? <ExternalLink aria-hidden="true" /> : null}
          </a>
        ) : displayValue(value)

        return searchableValue(infoValue) ? (
          <span className="inline-flex items-center gap-1">
            {renderedValue}
            <DataTableInfo
              content={displayValue(infoValue)}
              label={
                infoConfig?.label
                  ?? `More information about ${searchableValue(value) || column.header}`
              }
            />
          </span>
        ) : renderedValue
      },
      enableSorting: column.sortable ?? false,
      enableColumnFilter: Boolean(column.filter),
      enableGlobalFilter: true,
      filterFn: column.filter ? optionFilterFn : textFilterFn,
    })),
    [columns, optionFilterFn, textFilterFn]
  )

  // TanStack Table intentionally exposes a mutable table instance that the
  // React compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns: tableColumns,
    data: tableData,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: textFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: rowId ? (row) => String(row[rowId]) : undefined,
  })

  const filterableColumns = columns.filter((column) => column.filter)
  const activeFilterCount = table.getState().columnFilters.reduce(
    (total, columnFilter) =>
      total + (Array.isArray(columnFilter.value) ? columnFilter.value.length : 0),
    0
  )

  const controls = (searchConfig || filterableColumns.length) ? (
    <div
      data-slot="data-table-controls"
      className="flex min-w-0 items-center gap-2 border-b p-3"
    >
      {searchConfig ? (
        <Field className="min-w-0 max-w-xs flex-1 sm:w-64 sm:flex-none">
          <FieldLabel htmlFor={`${id}-search`} className="sr-only">
            {searchConfig.label ?? `Search ${title}`}
          </FieldLabel>
          <Input
            id={`${id}-search`}
            type="search"
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={searchConfig.placeholder ?? "Search table..."}
          />
        </Field>
      ) : null}

      {filterableColumns.length ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={
                activeFilterCount
                  ? `Filters, ${activeFilterCount} active`
                  : "Filters"
              }
            >
              <ListFilter aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end">
            <PopoverHeader>
              <PopoverTitle>Filter {title}</PopoverTitle>
              <PopoverDescription>
                Select one or more values
              </PopoverDescription>
            </PopoverHeader>

            <FieldGroup className="gap-3">
              {filterableColumns.map((definition) => {
                const tableColumn = table.getColumn(definition.key)
                const selectedValues = (
                  tableColumn?.getFilterValue() as string[] | undefined
                ) ?? []

                return (
                  <DataTableMultiSelect
                    key={definition.key}
                    id={`${id}-${definition.key}-filter`}
                    label={definition.filter?.label ?? definition.header}
                    options={definition.filter?.options ?? []}
                    selectedValues={selectedValues}
                    onChange={(nextValues) => tableColumn?.setFilterValue(
                      nextValues.length ? nextValues : undefined
                    )}
                  />
                )
              })}
            </FieldGroup>

            {activeFilterCount ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-end"
                onClick={() => table.resetColumnFilters()}
              >
                Clear filters
              </Button>
            ) : null}
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  ) : null

  const renderedTable = (
    <Table aria-labelledby={headingId}>
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className={cn(
              "bg-muted/60",
              allColumnHeadersHidden && "h-0 border-0 bg-transparent"
            )}
          >
            {headerGroup.headers.map((header, index) => {
              const definition = columns[index]
              const sorted = header.column.getIsSorted()

              return (
                <TableHead
                  key={header.id}
                  scope="col"
                  aria-sort={
                    definition.hidden
                      ? undefined
                      : sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : definition.sortable
                            ? "none"
                            : undefined
                  }
                  className={cn(
                    definition.width === "sm" && "w-32",
                    definition.width === "md" && "w-40",
                    definition.width === "lg" && "w-64",
                    definition.align === "center" && "text-center",
                    definition.align === "right" && "text-right",
                    allColumnHeadersHidden && "h-0 p-0"
                  )}
                >
                  {definition.hidden ? (
                    <span className="sr-only">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </span>
                  ) : definition.sortable ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="-ml-2 w-fit"
                      onClick={header.column.getToggleSortingHandler()}
                      aria-label={`Sort by ${definition.header}`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {sorted === "asc" ? (
                        <ArrowUp data-icon="inline-end" aria-hidden="true" />
                      ) : sorted === "desc" ? (
                        <ArrowDown data-icon="inline-end" aria-hidden="true" />
                      ) : (
                        <ChevronsUpDown data-icon="inline-end" aria-hidden="true" />
                      )}
                    </Button>
                  ) : (
                    <span className="font-display font-medium text-foreground">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </span>
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell, index) => {
                const definition = columns[index]
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      definition.wrap !== false && "whitespace-normal",
                      definition.emphasis && "font-semibold",
                      definition.align === "center" && "text-center",
                      definition.align === "right" && "text-right"
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                )
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  if (collapsible) {
    return (
      <Collapsible
        asChild
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <div
          data-slot="data-table"
          className={cn("overflow-hidden border bg-card", className)}
        >
          <Heading
            id={headingId}
            data-slot="data-table-title-row"
            className="scroll-mt-[5.5rem]"
          >
            <CollapsibleTrigger
              className="group flex w-full items-center justify-between gap-3 p-3 text-left font-display text-base font-semibold outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
              aria-controls={`${id}-body`}
              aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
            >
              <span>{title}</span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0 transition-transform duration-200",
                  isCollapsed && "-rotate-90"
                )}
              />
            </CollapsibleTrigger>
          </Heading>
          <CollapsibleContent
            id={`${id}-body`}
            className="overflow-hidden border-t motion-safe:data-[state=closed]:animate-[data-table-accordion-up_140ms_ease-in] motion-safe:data-[state=open]:animate-[data-table-accordion-down_180ms_ease-out]"
          >
            {controls}
            {renderedTable}
          </CollapsibleContent>
        </div>
      </Collapsible>
    )
  }

  return (
    <div
      data-slot="data-table"
      className={cn("overflow-hidden border bg-card", className)}
    >
      <div data-slot="data-table-title-row" className="border-b p-3">
        <Heading
          id={headingId}
          className="scroll-mt-[5.5rem] font-display text-base font-semibold"
        >
          {title}
        </Heading>
      </div>
      {controls}
      {renderedTable}
    </div>
  )
}

function DataTable({ config, className }: DataTableProps) {
  const result = dataTableConfigSchema.safeParse(config)

  if (!result.success) {
    return (
      <div
        role="alert"
        data-slot="data-table-error"
        className={cn(
          "border border-destructive/40 bg-destructive/5 p-4 text-sm text-muted-foreground",
          className
        )}
      >
        This table is temporarily unavailable because its data is invalid.
      </div>
    )
  }

  return <DataTableContent config={config} className={className} />
}

export { DataTable }
export type {
  DataTableColumn,
  DataTableConfig,
  DataTableFilterOption,
  DataTableHeadingTag,
  DataTableProps,
  DataTableRow,
}
