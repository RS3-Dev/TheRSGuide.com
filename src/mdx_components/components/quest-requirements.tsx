"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { usePlayerData } from "./player-data-context";
import { resolveAllRequirements, QuestTreeNode } from "@/utils/quest-requirements";
import { SkillDrawer } from "./skill-drawer";
import questsData from "@/data/quests.json";

interface SkillRequirement {
  skill: string;
  level: number;
}

interface ManualRequirements {
  quest?: string;
  quests?: string[];
  totalSkills?: SkillRequirement[];
  other?: string[];
}

interface QuestRequirementsProps {
  questName?: string;
  skills?: SkillRequirement[];
  quests?: string[];
  other?: string[];
  manualRequirements?: ManualRequirements;
}

interface SkillRequirementItemProps {
  skill: string;
  level: number;
  onClick: () => void;
}

const SkillRequirementItem: React.FC<SkillRequirementItemProps> = ({ skill, level, onClick }) => {
  const { playerData, getSkillLevel } = usePlayerData();

  const playerLevel = getSkillLevel(skill);
  const hasRequirement = playerLevel !== null && playerLevel >= level;
  const showStatus = playerData !== null;

  const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
  const skillLower = skill.toLowerCase();

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-left text-sm w-full transition-colors cursor-pointer ${
        !showStatus
          ? "border-fd-border bg-fd-muted/30 hover:bg-fd-muted/50"
          : hasRequirement
          ? "border-[#7d9a78]/50 bg-[#7d9a78]/10 text-[#3d6b35] dark:text-[#a8c4a2] hover:bg-[#7d9a78]/20"
          : "border-[#a07878]/50 bg-[#a07878]/10 text-[#8b4d4d] dark:text-[#c4a2a2] hover:bg-[#a07878]/20"
      }`}
    >
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
        <image href={`/skills/${skillLower}.png`} width="16" height="16" />
      </svg>
      <span className="flex-1">{level} {capitalizedSkill}</span>
      {showStatus && (
        hasRequirement ? (
          <svg className="w-4 h-4 text-[#7d9a78] dark:text-[#a8c4a2] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="text-xs text-fd-muted-foreground flex-shrink-0">({playerLevel ?? 1})</span>
        )
      )}
      {/* Training guide indicator */}
      <svg className="w-3 h-3 opacity-40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

const QuestRequirementItem: React.FC<{ quest: string; depth?: number }> = ({ quest, depth = 0 }) => {
  const { playerData, isQuestComplete } = usePlayerData();

  const completed = isQuestComplete(quest);
  const showStatus = playerData !== null && completed !== null;

  const handleClick = () => {
    const formattedName = quest.replace(/ /g, "_");
    window.open(`https://runescape.wiki/w/${formattedName}/Quick_guide`, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-left text-sm transition-colors w-full ${
        !showStatus
          ? "border-fd-border bg-fd-muted/30 hover:bg-fd-muted/50"
          : completed
          ? "border-[#7d9a78]/50 bg-[#7d9a78]/10 text-[#3d6b35] dark:text-[#a8c4a2] hover:bg-[#7d9a78]/20"
          : "border-[#a07878]/50 bg-[#a07878]/10 text-[#8b4d4d] dark:text-[#c4a2a2] hover:bg-[#a07878]/20"
      }`}
    >
      <span className="flex-1">{quest}</span>
      {showStatus && completed && (
        <svg className="w-4 h-4 text-[#7d9a78] dark:text-[#a8c4a2] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      <svg className="w-3 h-3 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </button>
  );
};

const QuestTreeItem: React.FC<{ node: QuestTreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  return (
    <div>
      <div style={{ marginLeft: `${depth * 20}px` }}>
        <QuestRequirementItem quest={node.name} depth={depth} />
      </div>
      {node.children.length > 0 && (
        <div className="mt-1 space-y-1">
          {node.children.map((child, idx) => (
            <QuestTreeItem key={`${child.name}-${idx}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const QuestRequirements: React.FC<QuestRequirementsProps> = ({
  questName,
  skills = [],
  quests = [],
  other = [],
  manualRequirements,
}) => {
  const { playerData, loading, error, lastSearch, searchPlayer } = usePlayerData();
  const [selectedSkill, setSelectedSkill] = useState<{ skill: string; level: number } | null>(null);
  const [inputValue, setInputValue] = useState(lastSearch);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasInitializedInput, setHasInitializedInput] = useState(false);

  // Look up quest data from JSON if questName is provided
  const questFromJson = useMemo(() => {
    if (manualRequirements) return null; // Manual overrides skip JSON lookup
    if (!questName) return null;
    return questsData.Quests.find(
      (q: { name: string }) => q.name.toLowerCase() === questName.toLowerCase()
    );
  }, [questName, manualRequirements]);

  // Determine the effective requirements
  const effectiveRequirements = useMemo(() => {
    // Manual requirements take priority
    if (manualRequirements) {
      return {
        name: manualRequirements.quest || questName || "",
        skills: manualRequirements.totalSkills || [],
        quests: manualRequirements.quests || [],
        other: other,
      };
    }

    // Use quest from JSON if found
    if (questFromJson) {
      return {
        name: questFromJson.name,
        skills: questFromJson.requirements?.skill || [],
        quests: questFromJson.requirements?.quest || [],
        other: other,
      };
    }

    // Fall back to props (legacy behavior)
    return {
      name: questName || "",
      skills: skills,
      quests: quests,
      other: other,
    };
  }, [manualRequirements, questFromJson, questName, skills, quests, other]);

  // Sync input with lastSearch
  useEffect(() => {
    if (!hasInitializedInput) {
      setInputValue(lastSearch);
      setHasInitializedInput(true);
    }
  }, [hasInitializedInput, lastSearch]);

  const debouncedSearch = useCallback(
    (username: string) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        if (username.trim()) searchPlayer(username.trim());
      }, 1000);
      setDebounceTimer(timer);
    },
    [debounceTimer, searchPlayer],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      if (debounceTimer) clearTimeout(debounceTimer);
      searchPlayer(inputValue.trim());
    }
  };

  const handleSearch = () => {
    if (inputValue.trim()) {
      if (debounceTimer) clearTimeout(debounceTimer);
      searchPlayer(inputValue.trim());
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  // Recursively resolve all requirements
  const resolved = useMemo(() => {
    return resolveAllRequirements(
      effectiveRequirements.quests,
      effectiveRequirements.skills,
      effectiveRequirements.other
    );
  }, [effectiveRequirements]);

  const hasSkills = resolved.skills.length > 0;
  const hasQuests = resolved.questTree.length > 0;
  const hasOther = resolved.other.length > 0;

  // Only show the empty state if there's no quest name and no requirements at all
  if (!effectiveRequirements.name && !hasSkills && !hasQuests && !hasOther) {
    return (
      <div className="my-4 p-4 border border-fd-border rounded-lg bg-fd-muted/20">
        <p className="text-fd-muted-foreground">No requirements for this content.</p>
      </div>
    );
  }

  return (
    <>
      <div className="my-4 border border-fd-border rounded-lg bg-fd-card overflow-hidden">
        {/* Wiki Link Header */}
        {effectiveRequirements.name && (
          <a
            href={`https://runescape.wiki/w/${effectiveRequirements.name.replace(/ /g, "_")}/Quick_guide`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between w-full px-4 bg-fd-primary/10 border-b border-fd-border hover:bg-fd-primary/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <img src="/images/favicon/wiki-favicon.ico" alt="" className="w-5 h-5" />
              <span className="font-medium text-fd-foreground">{effectiveRequirements.name} quest guide</span>
            </div>
            <svg className="w-4 h-4 text-fd-muted-foreground group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}

        <div className="p-4">
          {/* Player Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 pb-4 border-b border-fd-border">
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-fd-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Load your stats..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                maxLength={15}
                className="w-full pl-9 pr-20 py-2 text-sm border border-fd-border rounded-lg bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-ring focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={handleSearch}
                disabled={!inputValue.trim() || loading}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-fd-primary hover:text-fd-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  "Search"
                )}
              </button>
            </div>

            {/* Status pill */}
            {(error || (playerData && !loading)) && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  error
                    ? "bg-[#a07878]/15 text-[#8b4d4d] dark:text-[#c4a2a2]"
                    : "bg-[#7d9a78]/15 text-[#3d6b35] dark:text-[#a8c4a2]"
                }`}
              >
                {error ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {error === "Profile is private" ? "Private profile" : "Not found"}
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {playerData?.username}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Skills Column */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-fd-foreground mb-3 flex items-center gap-2">
                Skill Requirements
              </h4>
              {hasSkills ? (
                <div className="space-y-1">
                  {resolved.skills.map((req, idx) => (
                    <SkillRequirementItem
                      key={idx}
                      skill={req.skill}
                      level={req.level}
                      onClick={() => setSelectedSkill({ skill: req.skill, level: req.level })}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-fd-muted-foreground">No skill requirements</p>
              )}
            </div>

            {/* Quests Column */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-fd-foreground mb-3 flex items-center gap-2">
                Quest Requirements {hasQuests && `(${resolved.quests.length})`}
              </h4>
              {hasQuests ? (
                <div className="space-y-1">
                  {resolved.questTree.map((tree, idx) => (
                    <QuestTreeItem key={`${tree.name}-${idx}`} node={tree} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-fd-muted-foreground">No quest requirements</p>
              )}
            </div>
          </div>

          {/* Other Requirements */}
          {hasOther && (
            <div className="mt-4 pt-4 border-t border-fd-border">
              <h4 className="text-sm font-semibold text-fd-foreground mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Other Requirements
              </h4>
              <ul className="list-disc list-inside text-sm text-fd-muted-foreground space-y-1">
                {resolved.other.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>

      {/* Skill Training Drawer */}
      <SkillDrawer
        skill={selectedSkill?.skill ?? null}
        requiredLevel={selectedSkill?.level}
        open={selectedSkill !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSkill(null);
        }}
      />
    </>
  );
};
