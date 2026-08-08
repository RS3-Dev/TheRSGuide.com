// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PageLoading } from '@/components/ui/page-loading'

describe('PageLoading', () => {
  it('announces its label while hiding the decorative spinner', () => {
    render(<PageLoading label="Loading player progression" />)

    const status = screen.getByRole('status', {
      name: 'Loading player progression',
    })
    expect(status).toBeVisible()
    expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })
})
