"use client";

import React, { useState } from "react";
import { usePlayerData } from "./player-data-context";
import { SkillContent } from "./skill-content";

const allSkills = [
  "attack", "strength", "defence", "constitution", "ranged", "prayer", "magic",
  "cooking", "woodcutting", "fletching", "fishing", "firemaking", "crafting",
  "smithing", "mining", "herblore", "agility", "thieving", "slayer", "farming",
  "runecrafting", "hunter", "construction", "summoning", "dungeoneering",
  "divination", "invention", "archaeology", "necromancy"
];

const SkillButton: React.FC<{
  skill: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ skill, isSelected, onClick }) => {
  const { playerData, getSkillLevel } = usePlayerData();
  const playerLevel = getSkillLevel(skill);
  const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);

  return (
    <button
      onClick={onClick}
      title={`${capitalizedSkill}${playerLevel ? ` (${playerLevel})` : ""}`}
      className={`w-7 h-7 flex items-center justify-center rounded border transition-all ${
        isSelected
          ? "border-fd-primary bg-fd-primary/20"
          : "border-transparent hover:border-fd-border hover:bg-fd-muted/50"
      }`}
    >
      <img
        src={`/skills/${skill.toLowerCase()}.png`}
        alt={capitalizedSkill}
        className="w-5 h-5 block"
      />
    </button>
  );
};

export const SkillTrainingLookup: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>("attack");

  return (
    <div className="space-y-4">
      {/* Skill Icon Grid */}
      <div className="flex flex-wrap justify-between items-start gap-y-1 p-2 border border-fd-border rounded-lg bg-fd-card h-fit">
        {allSkills.map((skill) => (
          <SkillButton
            key={skill}
            skill={skill}
            isSelected={selectedSkill === skill}
            onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
          />
        ))}
      </div>

      {/* Selected Skill Content */}
      {selectedSkill && (
        <div className="p-4 border border-fd-border rounded-lg bg-fd-card">
          <SkillContent skill={selectedSkill} />
        </div>
      )}

      {!selectedSkill && (
        <p className="text-center text-sm text-fd-muted-foreground py-4">
          Select a skill above to view training recommendations.
        </p>
      )}
    </div>
  );
};
