import { lazy, Suspense, useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowUpRight,
  Atom,
  BookOpen,
  Compass,
  Github,
  Linkedin,
  LockKeyhole,
  Shield,
  Sparkles,
  Terminal,
  Workflow,
} from 'lucide-react'
import Brand from '../components/Brand'
import Header from '../components/Header'
import InquiryForm from '../components/InquiryForm'
import { insights, projects as initialProjects, services, studio, type Project } from '../data/content'
import { supabase } from '../lib/supabase'
import { useSeo } from '../lib/useSeo'

const Vortex = lazy(() => import('../components/Vortex'))

function useLocalTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const format = () =>
      setTime(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date()),
      )
    format()
    const id = window.setInterval(format, 30_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

function mergeProjects(rows: Record<string, unknown>[]): Project[] {
  return rows.map(row => {
    const code = String(row.id)
    const base = initialProjects.find(project => project.code === code)
    return {
      ...base,
      name: String(row.name ?? base?.name ?? 'Untitled project'),
      category: String(row.category ?? base?.category ?? 'Project'),
      description: String(row.description ?? base?.description ?? ''),
      status: String(row.status ?? base?.status ?? 'Project'),
      upcoming: Boolean(row.upcoming),
      image_url: (row.image_url as string | null) ?? null,
      image_alt: (row.image_alt as string | null) ?? null,
      tags: base?.tags ?? [],
      source: base?.source ?? (row.upcoming ? 'concept' : 'private'),
      href: base?.href,
      code,
    } satisfies Project
  })
}

export default function HomePage() {
  useSeo({
    title: 'PramanixLabs — Imagine. Build. Evolve.',
    description:
      'PramanixLabs is an independent technology studio in Pune building AI systems, SaaS products, web and mobile applications, custom software and automation.',
  })

  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const time = useLocalTime()

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase
      .from('projects')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (active && data?.length) setProjects(mergeProjects(data))
      })
    return () => {
      active = false
    }
  }, [])

  const upcoming = projects.filter(project => project.upcoming)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-backdrop" aria-hidden="true">
            <span className="hero-grid" />
            <span className="hero-aurora" />
          </div>
          <div className="hero-art">
            <Suspense fallback={null}>
              <Vortex />
            </Suspense>
          </div>

          <div className="container hero-inner">
            <div className="hero-topline">
              <span>
                <i className="status-dot" aria-hidden="true" /> INDEPENDENT TECHNOLOGY STUDIO
              </span>
              <span>
                PUNE, INDIA <b>·</b> {time || '—'} IST
              </span>
            </div>

            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-mark" aria-hidden="true">
                  ✳
                </span>
                IMAGINE. BUILD. EVOLVE.
              </p>
              <h1 id="hero-title">
                Ideas into
                <br />
                <em>intelligent</em> things.
              </h1>
              <p className="hero-lede">
                An independent studio in Pune building AI systems, SaaS products, web and mobile
                applications, custom software and automation — with a standing interest in cybersecurity
                and digital learning.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#work">
                  Explore the work
                  <ArrowUpRight aria-hidden="true" size={17} />
                </a>
                <a className="text-link" href="#studio">
                  Meet the studio
                  <ArrowDown aria-hidden="true" size={15} />
                </a>
              </div>
            </div>

            <div className="hero-footer">
              <ul className="hero-facts">
                <li>INDEPENDENT BY DESIGN</li>
                <li>CURIOUS BY DEFAULT</li>
                <li>BUILT TO KEEP EVOLVING</li>
              </ul>
              <div className="floating-toolbar">
                <a href="#services">
                  <Workflow aria-hidden="true" />
                  <span>What we do</span>
                </a>
                <a href="#work">
                  <Atom aria-hidden="true" />
                  <span>What we build</span>
                </a>
                <a href="#contact">
                  <Compass aria-hidden="true" />
                  <span>Start a conversation</span>
                </a>
              </div>
            </div>
          </div>

          <a className="scroll-cue" href="#studio">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown aria-hidden="true" size={15} />
          </a>
        </section>

        <section className="section intro" id="studio" aria-labelledby="studio-title">
          <div className="container">
            <div className="section-label">
              <span>01 / THE STUDIO</span>
              <span>SMALL STUDIO. OPEN HORIZONS.</span>
            </div>
            <div className="intro-layout">
              <div className="intro-heading">
                <p className="eyebrow">A DIFFERENT KIND OF LAB</p>
                <h2 id="studio-title">
                  Curiosity is our
                  <br />
                  starting point.
                </h2>
              </div>
              <div className="intro-body">
                <p className="lead">
                  PramanixLabs is an independent technology studio founded by{' '}
                  <strong>{studio.founder}</strong> in {studio.location}.
                </p>
                <p>
                  The studio works across artificial intelligence, software and digital learning. Projects
                  move from questions to prototypes to products, and each one is described at the stage it
                  has actually reached.
                </p>
                <a
                  className="arrow-link"
                  href={studio.founderUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  A little more about the founder
                  <ArrowUpRight aria-hidden="true" size={15} />
                </a>
                <ul className="principles">
                  <li>
                    <span>01</span>
                    <b>Make it useful</b>
                  </li>
                  <li>
                    <span>02</span>
                    <b>Keep asking why</b>
                  </li>
                  <li>
                    <span>03</span>
                    <b>Build with care</b>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section services" id="services" aria-labelledby="services-title">
          <div className="container">
            <div className="section-label">
              <span>02 / CAPABILITIES</span>
              <span>SIX FIELDS, ONE CURIOSITY</span>
            </div>
            <div className="section-head">
              <h2 id="services-title">
                Where ideas
                <br />
                <span>take shape.</span>
              </h2>
              <p>
                Six areas of work, one approach: start with the problem, build something understandable,
                and keep it maintainable after launch.
              </p>
            </div>
            <div className="service-grid">
              {services.map(service => (
                <article className="service-card" key={service.no}>
                  <div className="service-card-top">
                    <span>{service.no} / 06</span>
                    <span className="service-mark">{service.mark}</span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>
                  <a href="#contact" className="service-link" aria-label={`Ask about ${service.title}`}>
                    <ArrowUpRight aria-hidden="true" size={17} />
                  </a>
                </article>
              ))}
            </div>
            <p className="services-note">
              Cybersecurity and digital learning are areas of active interest, expressed through projects
              such as Restovra, KavachScan and Pramanix AI.
            </p>
          </div>
        </section>

        <section className="section portfolio" id="work" aria-labelledby="work-title">
          <div className="container">
            <div className="section-label">
              <span>03 / SELECTED WORK</span>
              <span>MADE OF QUESTIONS, CODE &amp; CARE</span>
            </div>
            <div className="section-head">
              <h2 id="work-title">
                Made here.
                <br />
                <span>Going somewhere.</span>
              </h2>
              <p>Projects at different points in their journey. Each entry reflects its current stage.</p>
            </div>

            <div className="project-list">
              {projects.map((project, index) => (
                <article className="project" key={project.code}>
                  <div className="project-index" aria-hidden="true">
                    {project.code}
                  </div>
                  <div className="project-body">
                    <div className="project-meta">
                      <span>{project.category}</span>
                      <span className={`status-chip${project.upcoming ? ' is-exploring' : ''}`}>
                        {project.status}
                      </span>
                    </div>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <ul className="tag-list">
                      {project.tags.map(tag => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    <div className="project-actions">
                      {project.href ? (
                        <a className="arrow-link" href={project.href} target="_blank" rel="noreferrer">
                          View repository
                          <ArrowUpRight aria-hidden="true" size={15} />
                        </a>
                      ) : (
                        <a className="arrow-link" href="#contact">
                          Ask about {project.name}
                          <ArrowUpRight aria-hidden="true" size={15} />
                        </a>
                      )}
                      {project.source === 'private' && (
                        <span className="private-note">
                          <LockKeyhole aria-hidden="true" size={12} /> Source kept private
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`project-visual${project.image_url ? ' has-image' : ''}`}>
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.image_alt || `${project.name} portfolio image`}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className={`orbit orbit--${(index % 3) + 1}`} aria-hidden="true">
                        <span className="orbit-ring" />
                        <span className="orbit-ring orbit-ring--inner" />
                        <span className="orbit-core" />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="portfolio-foot">
              <span>THE NEXT CHAPTER IS STILL BEING WRITTEN.</span>
              <a href={studio.github} target="_blank" rel="noreferrer">
                More on GitHub
                <Github aria-hidden="true" size={15} />
              </a>
            </div>
          </div>
        </section>

        <section className="section horizon" id="horizon" aria-labelledby="horizon-title">
          <div className="horizon-orb" aria-hidden="true">
            <span />
            <i />
          </div>
          <div className="container horizon-grid">
            <div className="horizon-copy">
              <p className="eyebrow">
                <Sparkles aria-hidden="true" size={14} /> ON THE HORIZON
              </p>
              <h2 id="horizon-title">
                Not every idea
                <br />
                is ready to be <span>revealed.</span>
              </h2>
              <p>
                Some concepts are still being worked out. They are listed here as explorations, not as
                products you can use today.
              </p>
              <ul className="horizon-tags">
                {upcoming.map(project => (
                  <li key={project.code}>
                    {project.name}
                    <small>In exploration</small>
                  </li>
                ))}
              </ul>
              <a className="arrow-link" href="#contact">
                Ask what’s next
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </div>
            <div className="horizon-count" aria-hidden="true">
              {String(upcoming.length).padStart(2, '0')}
              <span>IN EXPLORATION</span>
            </div>
          </div>
        </section>

        <section className="section insights" id="insights" aria-labelledby="insights-title">
          <div className="container">
            <div className="section-label">
              <span>04 / NOTES FROM THE LAB</span>
              <span>THINKING OUT LOUD</span>
            </div>
            <div className="section-head">
              <h2 id="insights-title">
                Ideas worth
                <br />
                <span>following.</span>
              </h2>
              <p>
                Themes the studio is thinking about. These are editorial directions, not published
                articles.
              </p>
            </div>
            <div className="insight-grid">
              {insights.map((item, index) => (
                <article className="insight-card" key={item.title}>
                  <div className={`insight-art art-${index + 1}`} aria-hidden="true">
                    {index === 0 ? <Terminal /> : index === 1 ? <Shield /> : <BookOpen />}
                    <span>PRX / {String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="insight-meta">
                    <span>{item.category}</span>
                    <span>{item.kind}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  <a href="#contact" aria-label={`Discuss the theme: ${item.title}`}>
                    Discuss this theme
                    <ArrowUpRight aria-hidden="true" size={15} />
                  </a>
                </article>
              ))}
            </div>
            <p className="editorial-note">
              Editorial themes from the studio. New writing will be published here when it is ready.
            </p>
          </div>
        </section>

        <section className="section contact" id="contact" aria-labelledby="contact-title">
          <div className="container">
            <div className="section-label">
              <span>05 / SAY HELLO</span>
              <span>GOOD THINGS START SOMEWHERE</span>
            </div>
            <div className="contact-grid">
              <div className="contact-copy">
                <p className="eyebrow">HAVE A QUESTION OR AN IDEA?</p>
                <h2 id="contact-title">
                  Let’s make
                  <br />
                  something <span>matter.</span>
                </h2>
                <p>
                  Whether you are exploring a collaboration, curious about a project, or simply want to
                  compare notes, write to the studio. Email always reaches us.
                </p>
                <a className="contact-email" href={`mailto:${studio.email}`}>
                  {studio.email}
                  <ArrowUpRight aria-hidden="true" size={16} />
                </a>
                <div className="contact-social">
                  <a href={studio.linkedin} target="_blank" rel="noreferrer">
                    <Linkedin aria-hidden="true" size={14} />
                    LinkedIn
                  </a>
                  <a href={studio.github} target="_blank" rel="noreferrer">
                    <Github aria-hidden="true" size={14} />
                    GitHub
                  </a>
                </div>
              </div>
              <div className="form-wrap">
                <InquiryForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <Brand />
          <nav className="footer-nav" aria-label="Footer navigation">
            <a href="#studio">Studio</a>
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#insights">Insights</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="footer-meta">
            <span>AN INDEPENDENT TECHNOLOGY STUDIO · PUNE, INDIA</span>
            <span>© {new Date().getFullYear()} PRAMANIXLABS</span>
            <a className="admin-link" href="/admin">
              Studio access
              <LockKeyhole aria-hidden="true" size={12} />
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
