import { z } from 'zod'

export type DataTableHeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type DataTableRow = Record<string, string | number | boolean | null>

export type DataTableFilterOption = {
  label: string
  value: string | number | boolean
}

type DataTableFilter = {
  label?: string
  options?: readonly DataTableFilterOption[]
}

export type DataTableColumn = {
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
  align?: 'left' | 'center' | 'right'
  width?: 'sm' | 'md' | 'lg'
  emphasis?: boolean
  wrap?: boolean
}

type DataTableSearch = {
  label?: string
  placeholder?: string
}

export type DataTableConfig = {
  $schema?: string
  title: string
  titleAs?: DataTableHeadingTag
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

const dataTableFilterOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
}).strict()

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
    }).strict(),
  ]).optional(),
  link: z.object({
    hrefKey: z.string().min(1),
    external: z.boolean().optional(),
  }).strict().optional(),
  info: z.union([
    z.boolean(),
    z.object({
      contentKey: z.string().optional(),
      label: z.string().optional(),
    }).strict(),
  ]).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  width: z.enum(['sm', 'md', 'lg']).optional(),
  emphasis: z.boolean().optional(),
  wrap: z.boolean().optional(),
}).strict()

const dataTableValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
])

export const dataTableConfigSchema = z.object({
  $schema: z.string().optional(),
  title: z.string().min(1),
  titleAs: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).optional(),
  headingId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  collapsed: z.boolean().optional(),
  sortable: z.boolean().optional(),
  columns: z.array(dataTableColumnSchema).min(1),
  rows: z.array(z.record(z.string(), dataTableValueSchema)),
  caption: z.string().optional(),
  emptyMessage: z.string().optional(),
  rowId: z.string().min(1).optional(),
  search: z.union([
    z.boolean(),
    z.object({
      label: z.string().optional(),
      placeholder: z.string().optional(),
    }).strict(),
  ]).optional(),
}).strict()
