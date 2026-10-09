import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge tone="success">Successful</Badge>)
    expect(screen.getByText('Successful')).toBeInTheDocument()
  })

  it('applies the tone', () => {
    render(<Badge tone="danger">Failed</Badge>)
    expect(screen.getByText('Failed')).toHaveClass('danger')
  })
})
