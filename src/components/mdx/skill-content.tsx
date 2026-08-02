"use client";

import React from "react";
import { usePlayerData } from "@/components/player/player-data-context";
import skillsData from "@/utils/skills.json";

export interface LevelRange {
  start: number;
  end: number;
  desc: string;
  link?: string;
}

interface SkillContentProps {
  skill: string;
  requiredLevel?: number;
  hideHeader?: boolean;
  linkRanges?: boolean;
}

export const SkillContent: React.FC<SkillContentProps> = ({
  skill,
  requiredLevel,
  hideHeader = false,
  linkRanges = false,
}) => {
  const { playerData, getSkillLevel } = usePlayerData();
  const playerLevel = getSkillLevel(skill);
  const skillInfo = (skillsData as Record<string, LevelRange[]>)[skill.toLowerCase()] || [];
  const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);

  if (skillInfo.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No leveling guide available for {capitalizedSkill} yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - can be hidden when used in drawer */}
      {!hideHeader && (
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <img
            src={`/skills/${skill.toLowerCase()}.png`}
            alt={capitalizedSkill}
            className="w-8 h-8"
          />
          <div>
            <h3 className="font-semibold text-lg">{capitalizedSkill}</h3>
            {playerData && playerLevel !== null && (
              <p className="text-sm text-muted-foreground">
                Current Level: {playerLevel}
                {requiredLevel && playerLevel < requiredLevel && (
                  <span className="ml-2 text-[#8b4d4d] dark:text-[#c4a2a2]">
                    (Need {requiredLevel})
                  </span>
                )}
                {requiredLevel && playerLevel >= requiredLevel && (
                  <span className="ml-2 text-[#3d6b35] dark:text-[#a8c4a2]">
                    (Requirement met!)
                  </span>
                )}
              </p>
            )}
            {!playerData && requiredLevel && (
              <p className="text-sm text-muted-foreground">
                Required Level: {requiredLevel}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Level Brackets */}
      <div className="space-y-3">
        {skillInfo.map((range, idx) => {
          const isCompleted = playerLevel !== null && playerLevel > range.end;
          const isCurrent = playerLevel !== null && playerLevel >= range.start && playerLevel <= range.end;
          const isTarget = requiredLevel !== undefined && range.start <= requiredLevel && range.end >= requiredLevel;

          // Format level display - show single level if start equals end
          const levelDisplay = range.start === range.end
            ? `Level ${range.start}`
            : `Levels ${range.start} - ${range.end}`;
          const rangeId = `${skill.toLowerCase()}-levels-${range.start}-${range.end}-${idx}`;

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                isCompleted
                  ? "border-[#7d9a78]/50 bg-[#7d9a78]/10"
                  : isCurrent
                  ? "border-primary/50 bg-primary/10"
                  : isTarget
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {linkRanges ? (
                    <h3 id={rangeId} className="m-0 font-display text-sm leading-5 font-semibold">
                      {levelDisplay}
                    </h3>
                  ) : (
                    <span className="font-semibold text-sm">{levelDisplay}</span>
                  )}
                  {isCompleted && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#7d9a78]/20 text-[#3d6b35] dark:text-[#a8c4a2]">
                      Completed
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                      Current
                    </span>
                  )}
                  {!isCompleted && !isCurrent && isTarget && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      Target
                    </span>
                  )}
                </div>
                {range.link && (
                  <a
                    href={range.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Wiki
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{range.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
