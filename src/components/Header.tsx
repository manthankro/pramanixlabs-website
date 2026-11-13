import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

export default function Header() {
  const [open, setOpen] = useState(false)
  const links = [['Studio', '#studio'], ['Services', '#services'], ['Projects', '#projects'], ['Insights', '#insights']]
  return <header className="header"><a className="brand" href="#top" aria-label="PramanixLabs home"><span className="brand-symbol">P<span>×</span></span><span>PRAMANIX<span className="brand-light">LABS</span><small>IMAGINE. BUILD. EVOLVE.</small></span></a>
    <button className="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav className={open ? 'nav nav-open' : 'nav'} aria-label="Main navigation">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}<a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>Let’s talk <ArrowUpRight size={14} /></a></nav>
  </header>
}
