"use client";

import React, { useState } from "react";
import { usePlayerData } from "@/components/player/player-data-context";
import { RUNESCAPE_SKILLS } from "@/lib/player-profile";
import { SkillContent } from "./skill-content";

const allSkills = RUNESCAPE_SKILLS.map((skill) => skill.toLowerCase());

const skillSlots: Array<string | null> = allSkills.length % 2
  ? [...allSkills, null]
  : allSkills;

const SkillButton: React.FC<{
  skill: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ skill, isSelected, onClick }) => {
  const { getSkillLevel } = usePlayerData();
  const playerLevel = getSkillLevel(skill);
  const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);

  return (
    <button
      onClick={onClick}
      title={`${capitalizedSkill}${playerLevel ? ` (${playerLevel})` : ""}`}
      className={`size-9 flex items-center justify-center rounded border transition-all ${
        isSelected
          ? "border-primary bg-primary/20"
          : "border-transparent hover:border-border hover:bg-muted/50"
      }`}
    >
      <img
        src={`/skills/${skill.toLowerCase()}.png`}
        alt={capitalizedSkill}
        className="size-7 block"
      />
    </button>
  );
};

export const SkillTrainingLookup: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>("attack");

  return (
    <div className="space-y-4">
      {/* Skill Icon Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] place-items-center gap-1 p-2 border border-border rounded-lg bg-card md:grid-cols-[repeat(15,minmax(0,1fr))] ">
        {skillSlots.map((skill, index) => (
          skill
            ? (
              <SkillButton
                key={skill}
                skill={skill}
                isSelected={selectedSkill === skill}
                onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
              />
            )
            : <span key={`empty-skill-${index}`} className="size-9" aria-hidden="true" />
        ))}
      </div>

      {/* Selected Skill Content */}
      {selectedSkill && (
        <div className="p-4 border border-border rounded-lg bg-card">
          <SkillContent skill={selectedSkill} linkRanges />
        </div>
      )}

      {!selectedSkill && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Select a skill above to view training recommendations.
        </p>
      )}
    </div>
  );
};
