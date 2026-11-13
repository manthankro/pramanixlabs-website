type BrandProps = {
  href?: string
  compact?: boolean
}

export default function Brand({ href = '#top', compact = false }: BrandProps) {
  return (
    <a className="brand" href={href} aria-label="PramanixLabs — home">
      <span className="brand-symbol" aria-hidden="true">
        P<span>×</span>
      </span>
      {!compact && (
        <span className="brand-word">
          PRAMANIX<span className="brand-light">LABS</span>
          <small>IMAGINE. BUILD. EVOLVE.</small>
        </span>
      )}
    </a>
  )
}
