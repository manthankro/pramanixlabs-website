import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import InquiryForm from './InquiryForm'

describe('InquiryForm', () => {
  it('offers the company service areas as focus options', () => {
    render(<InquiryForm />)
    expect(screen.getByLabelText('Service you need')).toBeInTheDocument()
    for (const topic of ['AI & AI agents', 'Web development', 'Automation & digital solutions']) {
      expect(screen.getByRole('option', { name: topic })).toBeInTheDocument()
    }
    expect(screen.getByLabelText('Your name')).toBeRequired()
    expect(screen.getByLabelText('Project details')).toBeRequired()
  })

  it('explains the direct email fallback when Supabase is not configured', async () => {
    const { container } = render(<InquiryForm />)
    fireEvent.submit(container.querySelector('form')!)
    expect(await screen.findByText(/email draft should open/i)).toBeInTheDocument()
  })
})
