import { describe, expect, it } from 'vitest'
import questsData from '@/data/quests.json'
import {
  filterQuestTree,
  findQuest,
  resolveAllRequirements,
  type QuestTreeNode,
} from './quest-requirements'

const flatten = (nodes: QuestTreeNode[]): string[] =>
  nodes.flatMap((node) => [node.name, ...flatten(node.children)])

const depthOf = (nodes: QuestTreeNode[], name: string, depth = 0): number | null => {
  for (const node of nodes) {
    if (node.name.toLowerCase() === name.toLowerCase()) return depth
    const found = depthOf(node.children, name, depth + 1)
    if (found !== null) return found
  }
  return null
}

const sliskesEndgame = () => {
  const quest = findQuest("Sliske's Endgame")
  if (!quest) throw new Error("Sliske's Endgame is missing from quests.json")
  return resolveAllRequirements(quest.requirements.quest, quest.requirements.skill, quest.requirements.other ?? [])
}

describe('resolveAllRequirements quest tree', () => {
  it('lists every quest exactly once', () => {
    const names = flatten(sliskesEndgame().questTree).map((name) => name.toLowerCase())
    const duplicateNames = names.filter(
      (name, index) => names.indexOf(name) !== index,
    )

    expect(duplicateNames).toEqual([])
  })

  it('aggregates the skill requirements of every quest it lists', () => {
    const resolved = sliskesEndgame()
    const highest = new Map(resolved.skills.map((s) => [s.skill.toLowerCase(), s.level]))

    const uncounted = resolved.quests.flatMap((name) =>
      (findQuest(name)?.requirements.skill ?? [])
        .filter(({ skill, level }) => (highest.get(skill.toLowerCase()) ?? 0) < level)
        .map(({ skill, level }) => `${name} needs ${level} ${skill}`)
    )

    expect(uncounted).toEqual([])
  })

  it('places each quest at the shallowest depth that requires it', () => {
    const { questTree } = sliskesEndgame()

    expect(depthOf(questTree, 'One of a Kind')).toBe(0)
    expect(depthOf(questTree, 'Missing, Presumed Death')).toBe(1)
  })

  it('handles repeated and unknown quest names', () => {
    const names = flatten(
      resolveAllRequirements(['Stolen Hearts', 'Stolen Hearts', 'Not A Real Quest']).questTree
    )

    expect(names).toEqual(['Stolen Hearts', 'Not A Real Quest'])
  })
})

describe('quests.json integrity', () => {
  it('only lists real quests as quest requirements', () => {
    const known = new Set(questsData.Quests.map((quest) => quest.name.toLowerCase()))
    const unresolved = questsData.Quests.flatMap((quest) =>
      quest.requirements.quest
        .filter((required) => !known.has(required.toLowerCase()))
        .map((required) => `${quest.name} -> ${required}`)
    )

    expect(unresolved).toEqual([])
  })

  it('omits the other key rather than leaving it empty', () => {
    const empty = questsData.Quests
      .filter((quest) => Array.isArray(quest.requirements.other) && quest.requirements.other.length === 0)
      .map((quest) => quest.name)

    expect(empty).toEqual([])
  })

  it('has no quest requiring itself', () => {
    const selfReferential = questsData.Quests
      .filter((quest) =>
        quest.requirements.quest.some((r) => r.toLowerCase() === quest.name.toLowerCase())
      )
      .map((quest) => quest.name)

    expect(selfReferential).toEqual([])
  })
})

describe('filterQuestTree', () => {
  const tree: QuestTreeNode[] = [
    { name: 'a', children: [
      { name: 'a1', children: [{ name: 'a1a', children: [] }] },
      { name: 'a2', children: [] },
    ] },
    { name: 'b', children: [] },
  ]

  it('keeps matching nodes and drops the rest', () => {
    const kept = filterQuestTree(tree, (name) => name !== 'b')

    expect(flatten(kept)).toEqual(['a', 'a1', 'a1a', 'a2'])
  })

  it('lifts kept descendants into a dropped parent\'s place', () => {
    const kept = filterQuestTree(tree, (name) => name !== 'a1')

    expect(kept.map((node) => node.name)).toEqual(['a', 'b'])
    expect(kept[0].children.map((node) => node.name)).toEqual(['a1a', 'a2'])
  })

  it('returns nothing when everything is filtered out', () => {
    expect(filterQuestTree(tree, () => false)).toEqual([])
  })

  it('leaves the tree untouched when everything matches', () => {
    expect(filterQuestTree(tree, () => true)).toEqual(tree)
  })

  it('drops completed quests from a real requirement tree', () => {
    const { questTree } = sliskesEndgame()
    const completed = new Set(['the death of chivalry', 'holy grail'])

    const kept = filterQuestTree(questTree, (name) => !completed.has(name.toLowerCase()))
    const names = flatten(kept)

    expect(names).not.toContain('The Death of Chivalry')
    expect(names).not.toContain('Holy Grail')
    expect(names).toContain("Merlin's Crystal")
  })
})
