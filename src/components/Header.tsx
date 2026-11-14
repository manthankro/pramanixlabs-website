import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import Brand from './Brand'
import { bookingUrl } from '../lib/booking'

const links = [
  { label: 'Studio', href: '#studio' },
  { label: 'Services', href: '#services' },
  { label: 'How we work', href: '#process' },
] as const

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const toggle = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = links
      .map(link => document.querySelector<HTMLElement>(link.href))
      .filter((section): section is HTMLElement => section !== null)
    if (!sections.length || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`)
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 861px)')
    const onChange = () => media.matches && setOpen(false)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="header-inner">
        <Brand />
        <button
          ref={toggle}
          className="menu-toggle"
          type="button"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(open => !open)}
        >
          {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
        <div id="primary-nav" ref={panel} className={`nav-panel${open ? ' is-open' : ''}`}>
          <nav aria-label="Main navigation">
            <ul>
              {links.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={active === link.href ? 'true' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a className="nav-cta" href={bookingUrl ?? "#contact"} target={bookingUrl ? "_blank" : undefined} rel={bookingUrl ? "noopener noreferrer" : undefined} onClick={() => setOpen(false)}>
            {bookingUrl ? "Book a call" : "Start a conversation"}
            <ArrowUpRight aria-hidden="true" size={14} />
          </a>
        </div>
      </div>
    </header>
  )
}
