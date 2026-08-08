import type { Plugin } from 'vite'

export function validateDataTables(root: string): Promise<string[]>
export function dataTableValidationPlugin(options?: { root?: string }): Plugin
