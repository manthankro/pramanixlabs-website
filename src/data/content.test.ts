import { describe, expect, it } from 'vitest'
import { inquiryTopics, insights, projects, services } from './content'

const serviceTitles = [
  'AI & AI agents',
  'SaaS products & dashboards',
  'Web development',
  'Mobile applications',
  'Custom software',
  'Automation & digital solutions',
]

describe('PramanixLabs editorial content', () => {
  it('includes the five named portfolio projects', () => {
    expect(projects.map(project => project.name)).toEqual([
      'Restovra',
      'KavachScan',
      'Pramanix AI',
      'SECOND LIFE ID',
      'Pramanix Shelf / Reading Room',
    ])
  })

  it('avoids unsupported customer, award and outcome claims', () => {
    const copy = [
      ...projects.map(project => `${project.name} ${project.description}`),
      ...insights.map(item => `${item.title} ${item.copy}`),
    ].join(' ')
    expect(copy).not.toMatch(/trusted by|customer|award|guarantee|fortune 500|\d+% (faster|increase|growth)/i)
  })

  it('never links to a private repository', () => {
    const privateProjects = projects.filter(project => project.source === 'private')
    expect(privateProjects.map(project => project.name)).toEqual(['Restovra', 'KavachScan'])
    expect(privateProjects.every(project => !project.href)).toBe(true)
    expect(projects.find(project => project.name === 'Pramanix AI')?.href).toBe(
      'https://github.com/manthankro/pramanix-ai-',
    )
  })

  it('marks planned innovations as explorations', () => {
    const upcoming = projects.filter(project => project.upcoming)
    expect(upcoming.map(project => project.name)).toEqual(['SECOND LIFE ID', 'Pramanix Shelf / Reading Room'])
    expect(upcoming.every(project => project.status === 'In exploration')).toBe(true)
    expect(upcoming.every(project => project.source === 'concept')).toBe(true)
  })

  it('lists exactly the six company service areas', () => {
    expect(services.map(service => service.title)).toEqual(serviceTitles)
    expect(services.map(service => service.title).join(' ')).not.toMatch(/cybersecurity/i)
  })

  it('treats insight cards as editorial themes, not articles', () => {
    expect(insights).toHaveLength(3)
    expect(insights.every(item => item.kind === 'Editorial theme')).toBe(true)
  })

  it('keeps the form topics aligned with the service areas', () => {
    expect([...inquiryTopics]).toEqual([...serviceTitles, 'Something else'])
  })
})
