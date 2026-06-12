import questsData from '@/data/quests.json';

interface QuestSkillReq {
  skill: string;
  level: number;
}

interface QuestData {
  name: string;
  difficulty: number;
  members: boolean;
  questPoints: number;
  requirements: {
    quest: string[];
    skill: QuestSkillReq[];
    other?: string[];
  };
}

interface QuestsJson {
  Quests: QuestData[];
}

export interface QuestTreeNode {
  name: string;
  children: QuestTreeNode[];
}

interface ResolvedRequirements {
  skills: QuestSkillReq[];
  quests: string[];
  questTree: QuestTreeNode[];
  other: string[];
}

const quests = (questsData as QuestsJson).Quests;

// Create a map for quick lookup
const questMap = new Map<string, QuestData>();
quests.forEach((quest) => {
  questMap.set(quest.name.toLowerCase(), quest);
});

/**
 * Find a quest by name (case-insensitive)
 */
export function findQuest(questName: string): QuestData | undefined {
  return questMap.get(questName.toLowerCase());
}

/**
 * Build a tree structure for a quest showing its prerequisites
 */
function buildQuestTree(questName: string, visited: Set<string>): QuestTreeNode {
  const normalizedName = questName.toLowerCase();
  const quest = questMap.get(normalizedName);

  const node: QuestTreeNode = {
    name: questName,
    children: [],
  };

  // Avoid infinite loops for circular dependencies
  if (visited.has(normalizedName)) {
    return node;
  }
  visited.add(normalizedName);

  if (quest && quest.requirements.quest.length > 0) {
    node.children = quest.requirements.quest.map((reqQuest) =>
      buildQuestTree(reqQuest, new Set(visited))
    );
  }

  return node;
}

/**
 * Recursively resolve all requirements for a list of quests
 */
export function resolveAllRequirements(
  questNames: string[],
  initialSkills: QuestSkillReq[] = [],
  initialOther: string[] = []
): ResolvedRequirements {
  const visitedQuests = new Set<string>();
  const allSkills = new Map<string, number>(); // skill -> highest level required
  const allQuests: string[] = [];
  const allOther = new Set<string>();

  // Add initial skills
  initialSkills.forEach((s) => {
    const existing = allSkills.get(s.skill.toLowerCase()) || 0;
    allSkills.set(s.skill.toLowerCase(), Math.max(existing, s.level));
  });

  // Add initial other requirements
  initialOther.forEach((o) => allOther.add(o));

  function resolveQuest(questName: string) {
    const normalizedName = questName.toLowerCase();

    if (visitedQuests.has(normalizedName)) {
      return;
    }
    visitedQuests.add(normalizedName);

    const quest = questMap.get(normalizedName);

    // Add this quest to the list
    allQuests.push(questName);

    if (!quest) {
      // Quest not found in our data, just add it as-is
      return;
    }

    // Add skill requirements (keep highest level for each skill)
    quest.requirements.skill.forEach((s) => {
      const skillKey = s.skill.toLowerCase();
      const existing = allSkills.get(skillKey) || 0;
      allSkills.set(skillKey, Math.max(existing, s.level));
    });

    // Add other requirements
    quest.requirements.other?.forEach((o) => allOther.add(o));

    // Recursively resolve quest requirements
    quest.requirements.quest.forEach((reqQuest) => {
      resolveQuest(reqQuest);
    });
  }

  // Resolve all provided quests
  questNames.forEach((questName) => {
    resolveQuest(questName);
  });

  // Build quest trees for display
  const questTree = questNames.map((name) => buildQuestTree(name, new Set()));

  // Convert skills map back to array with proper capitalization
  const skillsArray: QuestSkillReq[] = Array.from(allSkills.entries())
    .map(([skill, level]) => ({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      level,
    }))
    .sort((a, b) => a.skill.localeCompare(b.skill));

  return {
    skills: skillsArray,
    quests: allQuests,
    questTree,
    other: Array.from(allOther),
  };
}

/**
 * Get just the recursive quest chain for a single quest
 */
export function getQuestChain(questName: string): string[] {
  const chain: string[] = [];
  const visited = new Set<string>();

  function resolve(name: string) {
    const normalizedName = name.toLowerCase();
    if (visited.has(normalizedName)) return;
    visited.add(normalizedName);

    const quest = questMap.get(normalizedName);
    if (quest) {
      // First resolve prerequisites
      quest.requirements.quest.forEach((req) => resolve(req));
    }
    // Then add this quest
    chain.push(name);
  }

  resolve(questName);
  return chain;
}
