import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { UnderConstruction } from './under-construction'

describe('UnderConstruction', () => {
  it('does not render its children before the visitor reveals them', () => {
    const renderChild = vi.fn(() => <p>Unfinished content</p>)
    const Child = renderChild

    const markup = renderToStaticMarkup(
      <UnderConstruction>
        <Child />
      </UnderConstruction>,
    )

    expect(markup).toContain('Page is under construction')
    expect(markup).toContain('Click to see the progress')
    expect(markup).not.toContain('Unfinished content')
    expect(renderChild).not.toHaveBeenCalled()
  })
})
