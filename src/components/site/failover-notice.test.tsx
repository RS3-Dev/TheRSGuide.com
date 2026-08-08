// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { FailoverNotice } from '@/components/site/failover-notice'

describe('FailoverNotice', () => {
  it('does not render on the primary deployment', () => {
    const { container } = render(<FailoverNotice deploymentRole="primary" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('announces the failover and lets the visitor dismiss it', async () => {
    const user = userEvent.setup()
    render(<FailoverNotice deploymentRole="failover" />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'higher-than-usual traffic',
    )
    const dismiss = screen.getByRole('button', {
      name: 'Dismiss traffic notice',
    })

    await user.click(dismiss)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
