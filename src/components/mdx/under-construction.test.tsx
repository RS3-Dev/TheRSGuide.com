// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { UnderConstruction } from './under-construction'

describe('UnderConstruction', () => {
  it('keeps unfinished content visible beneath its notice', () => {
    render(
      <UnderConstruction>
        <p>Unfinished content</p>
      </UnderConstruction>,
    )

    expect(screen.getByText('This page is currently under construction.'))
      .toBeVisible()
    expect(screen.getByText('Unfinished content')).toBeVisible()
  })

  it('renders a standalone notice when there is no content', () => {
    render(<UnderConstruction />)

    expect(screen.getByText('Pages under construction')).toBeVisible()
    expect(screen.queryByText('This page is currently under construction.'))
      .not.toBeInTheDocument()
  })
})
