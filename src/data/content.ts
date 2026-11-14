export type ProjectSource = 'public' | 'private' | 'concept'

export type Project = {
  id?: string
  name: string
  category: string
  code: string
  status: string
  description: string
  tags: string[]
  upcoming: boolean
  source: ProjectSource
  href?: string
  image_url?: string | null
  image_alt?: string | null
}

export const studio = {
  name: 'PramanixLabs',
  tagline: 'Imagine. Build. Evolve.',
  email: 'pramanixlabs@gmail.com',
  location: 'Pune, India',
  founder: 'Manthan Lonkar',
  founderUrl: 'https://www.linkedin.com/in/manthan-lonkar-0a18102a7/',
  linkedin: 'https://www.linkedin.com/company/pramanix-labs/',
  github: 'https://github.com/manthankro',
} as const

/**
 * Portfolio copy follows the public company profile and the project sources.
 * `source: 'private'` projects intentionally carry no repository link.
 * `source: 'concept'` marks work that is still in exploration.
 */
export const projects: Project[] = [
  {
    name: 'Restovra',
    category: 'Cyber resilience',
    code: '01',
    status: 'In development',
    description:
      'A self-hosted recovery assurance workbench. It turns authorised database backups into reviewed recovery drills and evidence teams can inspect.',
    tags: ['Recovery assurance', 'SQLite', 'PostgreSQL'],
    upcoming: false,
    source: 'private',
  },
  {
    name: 'KavachScan',
    category: 'Cybersecurity',
    code: '02',
    status: 'Controlled evaluation',
    description:
      'A consent-first, read-only website security checker for small businesses in India. It turns selected public website and email settings into plain-language observations and practical next steps.',
    tags: ['Read-only checks', 'Digital safety'],
    upcoming: false,
    source: 'private',
  },
  {
    name: 'Pramanix AI',
    category: 'AI learning',
    code: '03',
    status: 'Public repository',
    description:
      'An AI engineering mentor and capstone companion exploring project architecture, software concepts, debugging and viva preparation for engineering students.',
    tags: ['AI', 'Learning', 'Web + Android'],
    upcoming: false,
    source: 'public',
    href: 'https://github.com/manthankro/pramanix-ai-',
  },
  {
    name: 'SECOND LIFE ID',
    category: 'Digital identity',
    code: '04',
    status: 'In exploration',
    description:
      'An early-stage identity concept in the PramanixLabs portfolio. Scope and product details are still being explored and will be shared once they are defined.',
    tags: ['Identity', 'Concept'],
    upcoming: true,
    source: 'concept',
  },
  {
    name: 'Pramanix Shelf / Reading Room',
    category: 'Digital learning',
    code: '05',
    status: 'In exploration',
    description:
      'A reading and learning experience in early exploration. The shape of the product is still being worked out before anything is claimed about it.',
    tags: ['Learning', 'Reading'],
    upcoming: true,
    source: 'concept',
  },
]

export const services = [
  {
    no: '01',
    title: 'AI & AI agents',
    mark: 'AI',
    copy: 'AI features, assistants and workflow support built around a specific business task, with clear boundaries and human review where needed.',
  },
  {
    no: '02',
    title: 'SaaS products & dashboards',
    mark: 'SAAS',
    copy: 'Web software, dashboards and internal tools that help teams manage information and everyday operations.',
  },
  {
    no: '03',
    title: 'Web development',
    mark: 'WEB',
    copy: 'Business websites and web applications with clear information, accessible pages and a practical path for customers to get in touch.',
  },
  {
    no: '04',
    title: 'Mobile applications',
    mark: 'APP',
    copy: 'Mobile applications for customer or team workflows, scoped around the core features people need to use.',
  },
  {
    no: '05',
    title: 'Custom software',
    mark: 'CODE',
    copy: 'Tools designed around your team’s process when off-the-shelf software does not fit the work.',
  },
  {
    no: '06',
    title: 'Automation & digital solutions',
    mark: 'FLOW',
    copy: 'Connect repeatable tasks and tools to reduce manual data entry, routine follow-ups and hand-offs.',
  },
] as const

export const insights = [
  {
    category: 'Build notes',
    kind: 'Editorial theme',
    title: 'Building in the open, one useful idea at a time.',
    copy: 'Notes from exploring product ideas across AI, security and software — and deciding what deserves to become real.',
  },
  {
    category: 'Cyber resilience',
    kind: 'Editorial theme',
    title: 'A recovery plan matters when a backup has to work.',
    copy: 'Why recovery assurance deserves its own place in the resilience conversation, next to prevention.',
  },
  {
    category: 'Product thinking',
    kind: 'Editorial theme',
    title: 'From a promising concept to a product people can use.',
    copy: 'A practical way to think about prototyping, scope and learning from the first real build.',
  },
] as const

/** Topics accepted by the public form and by the submit-inquiry Edge Function. */
export const inquiryTopics = [
  'AI & AI agents',
  'SaaS products & dashboards',
  'Web development',
  'Mobile applications',
  'Custom software',
  'Automation & digital solutions',
  'Something else',
] as const
