import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import InquiryForm from './InquiryForm'

describe('InquiryForm', () => {
  it('offers the company service areas as focus options', () => {
    render(<InquiryForm />)
    expect(screen.getByLabelText('Focus area')).toBeInTheDocument()
    for (const topic of ['AI & AI agents', 'Web development', 'Automation & digital solutions']) {
      expect(screen.getByRole('option', { name: topic })).toBeInTheDocument()
    }
    expect(screen.getByLabelText('Your name')).toBeRequired()
    expect(screen.getByLabelText('A little about it')).toBeRequired()
  })

  it('explains the direct email fallback when Supabase is not configured', async () => {
    const { container } = render(<InquiryForm />)
    fireEvent.submit(container.querySelector('form')!)
    expect(await screen.findByText(/not configured yet/i)).toBeInTheDocument()
  })
})
