import { describe, expect, it } from 'vitest'
import { insights, projects, services } from './content'

describe('PramanixLabs editorial content', () => {
  it('includes the five named portfolio projects without customer claims', () => {
    expect(projects.map(project => project.name)).toEqual(['Restovra', 'KavachScan', 'Pramanix AI', 'SECOND LIFE ID', 'Pramanix Shelf / Reading Room'])
    expect(projects.every(project => !/customer|trusted by|award-winning/i.test(project.description))).toBe(true)
  })
  it('marks planned innovations as upcoming', () => {
    expect(projects.filter(project => project.upcoming).map(project => project.status)).toEqual(['Upcoming innovation', 'Upcoming innovation'])
  })
  it('has the six declared service areas and studio notes', () => {
    expect(services).toHaveLength(6)
    expect(insights).toHaveLength(3)
  })
})
