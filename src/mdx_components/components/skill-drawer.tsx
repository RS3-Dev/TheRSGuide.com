"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SkillContent } from "./skill-content";
import { usePlayerData } from "./player-data-context";

interface SkillDrawerProps {
  skill: string | null;
  requiredLevel?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SkillLevelSubtitle: React.FC<{ skill: string; requiredLevel?: number }> = ({ skill, requiredLevel }) => {
  const { playerData, getSkillLevel } = usePlayerData();
  const playerLevel = getSkillLevel(skill);

  if (!playerData && requiredLevel) {
    return (
      <div className="text-sm text-fd-muted-foreground">
        Required: Level {requiredLevel}
      </div>
    );
  }

  if (playerData && playerLevel !== null) {
    const meetsRequirement = requiredLevel ? playerLevel >= requiredLevel : null;
    return (
      <div className="text-sm text-fd-muted-foreground">
        Current Level: {playerLevel}
        {requiredLevel && meetsRequirement === false && (
          <span className="ml-2 text-[#8b4d4d] dark:text-[#c4a2a2]">
            (Need {requiredLevel})
          </span>
        )}
        {requiredLevel && meetsRequirement === true && (
          <span className="ml-2 text-[#3d6b35] dark:text-[#a8c4a2]">
            (Requirement met!)
          </span>
        )}
      </div>
    );
  }

  return null;
};

export const SkillDrawer: React.FC<SkillDrawerProps> = ({
  skill,
  requiredLevel,
  open,
  onOpenChange,
}) => {
  // Track if we should render (stays true during exit animation)
  const [shouldRender, setShouldRender] = useState(open);
  // Track animation state
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsAnimating(true);
    } else if (shouldRender) {
      // Start exit animation
      setIsAnimating(true);
    }
  }, [open, shouldRender]);

  const handleAnimationEnd = () => {
    setIsAnimating(false);
    if (!open) {
      setShouldRender(false);
    }
  };

  if (!shouldRender || !skill) return null;

  const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
  const animationClass = open ? "drawer-enter" : "drawer-exit";

  return (
    <Dialog.Root open={shouldRender} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        {/* Overlay */}
        <Dialog.Overlay
          className={`fixed inset-0 bg-black/50 z-50 ${animationClass}-overlay`}
          onAnimationEnd={handleAnimationEnd}
        />

        {/* Drawer Content */}
        <Dialog.Content
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-fd-card border-l border-fd-border shadow-xl z-50 overflow-hidden flex flex-col ${animationClass}-content`}
          onAnimationEnd={handleAnimationEnd}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-fd-border">
            <Dialog.Title className="text-fd-foreground flex items-center gap-3">
              <img
                src={`/skills/${skill.toLowerCase()}.png`}
                alt={capitalizedSkill}
                className="w-8 h-8"
              />
              <div>
                <div className="text-lg font-semibold">{capitalizedSkill} Training Guide</div>
                <SkillLevelSubtitle skill={skill} requiredLevel={requiredLevel} />
              </div>
            </Dialog.Title>
            <Dialog.Close className="p-2 rounded-md hover:bg-fd-muted transition-colors text-fd-muted-foreground hover:text-fd-foreground">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <SkillContent skill={skill} requiredLevel={requiredLevel} hideHeader />
          </div>

          {/* Footer hint */}
          <div className="p-3 border-t border-fd-border bg-fd-muted/30">
            <p className="text-xs text-fd-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 rounded bg-fd-muted text-fd-muted-foreground font-mono text-xs">Esc</kbd> or click outside to close
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
