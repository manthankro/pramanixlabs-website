import { useEffect, useState } from 'react'
import { useSeo } from '../lib/useSeo'
import Header from '../components/Header'
import InquiryForm from '../components/InquiryForm'
import { projects as initialProjects, services, studio, type Project } from '../data/content'
import { supabase } from '../lib/supabase'

function mergeStudioProjects(rows: Record<string, unknown>[]): Project[] {
  return rows.flatMap(row => {
    const code = String(row.id)
    const base = initialProjects.find(project => project.code === code)
    if (!base) return []
    return [{
      ...base,
      name: String(row.name ?? base.name),
      category: String(row.category ?? base.category),
      description: String(row.description ?? base.description),
      status: String(row.status ?? base.status),
      upcoming: Boolean(row.upcoming),
      image_url: typeof row.image_url === 'string' ? row.image_url : null,
      image_alt: typeof row.image_alt === 'string' ? row.image_alt : null,
    }]
  })
}

function chooseService(topic: string) {
  const select = document.querySelector<HTMLSelectElement>('#inquiry-topic')
  if (select) select.value = topic
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects.filter(project => !project.upcoming))

  useEffect(() => {
    if (!supabase) return
    let active = true
    void (async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*').order('sort_order')
        if (active && !error && data) setProjects(mergeStudioProjects(data).filter(project => !project.upcoming))
      } catch {
        // Keep the source-controlled project details if the database is unreachable.
      }
    })()
    return () => { active = false }
  }, [])

  useSeo({
    title: 'PramanixLabs | Software and digital product development',
    description:
      'Plan and build AI-enabled products, SaaS, websites, mobile apps, custom software and workflow automation with PramanixLabs in Pune.',
  })

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <section className="hero business-hero" aria-labelledby="hero-title">
          <div className="hero-backdrop" aria-hidden="true">
            <div className="hero-aurora" />
          </div>
          <div className="hero-inner">
            <div className="hero-topline">
              <span>Independent technology studio <b>·</b> Pune, India</span>
              <span>AI · Software · Digital products</span>
            </div>
            <div className="business-hero-layout">
              <div className="hero-copy">
                <p className="eyebrow"><span className="eyebrow-mark">●</span>PramanixLabs — digital product partner</p>
                <h1 id="hero-title">Build the software your business needs <em>next.</em></h1>
                <p className="hero-lede">
                  We help founders and teams plan and build AI-enabled products, websites, apps, internal tools and automation around a real business need.
                </p>
                <div className="hero-actions">
                  <a className="button button-primary" href="#contact">
                    Request a project call <span aria-hidden="true">↗</span>
                  </a>
                  <a className="text-link" href="#services">Explore services <span aria-hidden="true">↓</span></a>
                </div>
              </div>
              <aside className="business-hero-card" aria-label="Services overview">
                <p className="business-card-label">WHAT WE CAN BUILD WITH YOU</p>
                <ul>
                  <li><span>01</span><div><strong>Digital products</strong><small>SaaS, dashboards and custom tools</small></div></li>
                  <li><span>02</span><div><strong>Web & mobile</strong><small>Customer-facing sites and applications</small></div></li>
                  <li><span>03</span><div><strong>AI & automation</strong><small>Useful systems for defined workflows</small></div></li>
                </ul>
                <p className="business-card-foot">Start with the problem. Choose the right build after.</p>
              </aside>
            </div>
            <div className="business-hero-bottom">
              <span>For teams with a problem worth solving</span>
              <a href="#process">See how a project starts <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </section>

        <section id="studio" className="section business-intro">
          <div className="container">
            <div className="section-label"><span>01 / The studio</span><span>Clear scope · Practical software</span></div>
            <div className="business-intro-grid">
              <h2>From a business challenge to a <span>working product.</span></h2>
              <div>
                <p>PramanixLabs is an independent technology studio based in Pune, India. We work across AI, software and digital products, helping turn a defined need into a useful first release.</p>
                <p>Bring an idea, an inefficient workflow or a product that needs a technical partner. We’ll start by understanding the goal and what a sensible first step looks like.</p>
                <a className="arrow-link" href="#contact">Tell us what you’re working on <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="section services business-services">
          <div className="container">
            <div className="section-label"><span>02 / Services</span><span>Choose a starting point</span></div>
            <div className="section-head">
              <h2>What we can <span>help you build.</span></h2>
              <p>Engage us for a focused piece of work or start with a conversation to shape the right scope.</p>
            </div>
            <div className="service-grid">
              {services.map(service => (
                <article className="service-card" key={service.no}>
                  <div className="service-card-top"><span>{service.no} / CAPABILITY</span><span className="service-mark">{service.mark}</span></div>
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>
                  <a className="service-link" href="#contact" aria-label={`Ask about ${service.title}`} onClick={() => chooseService(service.title)}>↗</a>
                </article>
              ))}
            </div>
            <p className="services-note">Not sure which service fits? Choose “Something else” in the form and describe the outcome you need.</p>
          </div>
        </section>

        <section id="process" className="section business-process">
          <div className="container">
            <div className="section-label"><span>03 / How we work</span><span>A straightforward project start</span></div>
            <div className="section-head">
              <h2>Start with a <span>clear next step.</span></h2>
              <p>No long brief is needed to begin. A few details help us understand whether we’re a good fit.</p>
            </div>
            <ol className="business-steps">
              <li><span>01</span><h3>Share the challenge</h3><p>Tell us what you’re trying to improve, launch or automate.</p></li>
              <li><span>02</span><h3>Scope the first step</h3><p>We’ll discuss users, constraints and what belongs in an initial version.</p></li>
              <li><span>03</span><h3>Agree how to proceed</h3><p>If there’s a fit, we’ll follow up with a proposed scope and next steps.</p></li>
            </ol>
            <div className="business-brief">
              <div><p className="eyebrow">A useful first conversation</p><h3>What to include in your request</h3></div>
              <ul><li>The business problem or goal</li><li>Who will use the product or workflow</li><li>Your preferred timing and any constraints</li></ul>
            </div>
          </div>
        </section>

        {projects.length > 0 && (
          <section className="section business-work" aria-labelledby="studio-work-title">
            <div className="container">
              <div className="section-label"><span>Studio products</span><span>In-house work</span></div>
              <div className="business-work-head">
                <div><p className="eyebrow">Built inside PramanixLabs</p><h2 id="studio-work-title">We work on <span>our own products, too.</span></h2></div>
                <p>These are in-house products at different stages of development, shown with their current status. They are not client case studies.</p>
              </div>
              <div className="business-work-list">
                {projects.map(project => (
                  <article key={project.code} className="business-work-item">
                    <div className="business-work-status"><span>{project.category}</span><span>{project.status}</span></div>
                    {project.image_url && <img className="business-work-image" src={project.image_url} alt={project.image_alt || `${project.name} product image`} loading="lazy" />}
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    {project.href && <a href={project.href} target="_blank" rel="noreferrer">View public repository <span aria-hidden="true">↗</span></a>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="contact" className="section contact business-contact">
          <div className="container">
            <div className="section-label"><span>04 / Project inquiry</span><span>Replies go to your email</span></div>
            <div className="contact-grid">
              <div className="contact-copy">
                <p className="eyebrow"><span className="eyebrow-mark">●</span>Start a project conversation</p>
                <h2>Tell us what you <span>need to build.</span></h2>
                <p>Send a short project request. We’ll review it and email you to discuss fit and arrange an initial call. Submitting this form requests a conversation; it does not reserve a calendar slot.</p>
                <a className="contact-email" href={`mailto:${studio.email}`}>{studio.email} <span aria-hidden="true">↗</span></a>
                <div className="business-contact-facts"><span>{studio.location}</span><span>AI · Software · Product development</span></div>
              </div>
              <div className="form-wrap">
                <InquiryForm />
              </div>
            </div>
          </div>
        </section>

        <section className="section business-faq">
          <div className="container">
            <div className="section-label"><span>Good to know</span><span>Before you get in touch</span></div>
            <div className="business-faq-grid">
              <div><h3>Do you have a fixed package or price list?</h3><p>Projects vary by scope. After understanding the need, we can discuss a suitable first phase and estimate.</p></div>
              <div><h3>Can I ask about one specific service?</h3><p>Yes. Choose the closest focus area in the form and include what you want to achieve.</p></div>
              <div><h3>Can I book a call directly?</h3><p>Send a project request first. We’ll reply by email to confirm a time that works.</p></div>
              <div><h3>Is the inquiry form a confirmed booking?</h3><p>No. It sends a request to the studio inbox. A meeting is arranged after we reply to you.</p></div>
            </div>
          </div>
        </section>
        <section id="privacy" className="section business-privacy">
          <div className="container">
            <div className="section-label"><span>Privacy notice</span><span>Project inquiries</span></div>
            <div className="business-privacy-copy">
              <h2>How we use your <span>inquiry details.</span></h2>
              <div>
                <p>We collect the name and email you provide, your selected service, project description, and any optional company or timing details. We use them to review and respond to your request and arrange a conversation.</p>
                <p>When online delivery is configured, the request is stored in the PramanixLabs Supabase inbox. If email notifications are enabled, the details are also processed by the configured notification provider. If online delivery is not configured, the form opens an email draft; nothing is sent until you press Send in your email app.</p>
                <p>We do not use inquiry details for advertising. To ask about or request deletion of a message, contact <a href={'mailto:' + studio.email}>{studio.email}</a>. Please do not include passwords, financial account data or other sensitive information in the form.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <a className="brand" href="#main"><span className="brand-symbol">P<span>.</span></span><span className="brand-word">PRAMANIX<span className="brand-light">LABS</span><small>IMAGINE. BUILD. EVOLVE.</small></span></a>
          <nav className="footer-nav" aria-label="Footer navigation">
            <a href="#services">Services</a><a href="#process">How we work</a><a href="#contact">Project inquiry</a><a href="#privacy">Privacy</a>
          </nav>
          <div className="footer-meta"><span>© {new Date().getFullYear()} PramanixLabs</span><span>{studio.location}</span></div>
        </div>
      </footer>
    </>
  )
}
