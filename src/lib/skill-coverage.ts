export type SkillGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

type SkillSolve = {
  grade: SkillGrade
  skill: string
}

export type Relic = {
  image: string
  name: string
  skillSolves: SkillSolve[]
  tagline: string
  tier: number
}

export type RegionSkillGrades = {
  grades: Record<string, SkillGrade>
  id: string
  name: string
}

export type SkillResult = {
  grade: SkillGrade | null
  isSolved: boolean
  sourceName: string | null
}

export const SKILLS = [
  ['attack', 'Attack'],
  ['strength', 'Strength'],
  ['defence', 'Defence'],
  ['constitution', 'Constitution'],
  ['ranged', 'Ranged'],
  ['prayer', 'Prayer'],
  ['magic', 'Magic'],
  ['cooking', 'Cooking'],
  ['woodcutting', 'Woodcutting'],
  ['fletching', 'Fletching'],
  ['fishing', 'Fishing'],
  ['firemaking', 'Firemaking'],
  ['crafting', 'Crafting'],
  ['smithing', 'Smithing'],
  ['mining', 'Mining'],
  ['herblore', 'Herblore'],
  ['agility', 'Agility'],
  ['thieving', 'Thieving'],
  ['slayer', 'Slayer'],
  ['farming', 'Farming'],
  ['runecrafting', 'Runecrafting'],
  ['hunter', 'Hunter'],
  ['construction', 'Construction'],
  ['summoning', 'Summoning'],
  ['dungeoneering', 'Dungeoneering'],
  ['divination', 'Divination'],
  ['invention', 'Invention'],
  ['archaeology', 'Archaeology'],
  ['necromancy', 'Necromancy'],
] as const

const GRADE_RANK: Record<SkillGrade, number> = {
  S: 6,
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 1,
}

export function calculateSkillResults(
  selectedRelics: readonly Relic[],
  selectedRegions: readonly RegionSkillGrades[] = [],
) {
  const results = new Map<string, SkillResult>()

  SKILLS.forEach(([skill]) => {
    results.set(skill, { grade: null, isSolved: false, sourceName: null })
  })

  selectedRelics.forEach((relic) => {
    relic.skillSolves.forEach(({ grade, skill }) => {
      const current = results.get(skill)
      if (!current || (current.grade && GRADE_RANK[current.grade] >= GRADE_RANK[grade])) {
        return
      }

      results.set(skill, {
        grade,
        isSolved: grade === 'S' || grade === 'A',
        sourceName: relic.name,
      })
    })
  })

  selectedRegions.forEach((region) => {
    Object.entries(region.grades).forEach(([skill, grade]) => {
      const current = results.get(skill)
      if (!current || (current.grade && GRADE_RANK[current.grade] >= GRADE_RANK[grade])) {
        return
      }

      results.set(skill, {
        grade,
        isSolved: grade === 'S' || grade === 'A',
        sourceName: region.name,
      })
    })
  })

  return results
}
