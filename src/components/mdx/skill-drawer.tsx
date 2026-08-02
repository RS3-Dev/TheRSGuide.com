import { X } from "lucide-react"

import { SkillContent } from "@/components/mdx/skill-content"
import { usePlayerData } from "@/components/player/player-data-context"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface SkillDrawerProps {
  skill: string | null
  requiredLevel?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SkillLevelSubtitle({
  skill,
  requiredLevel,
}: Pick<SkillDrawerProps, "skill" | "requiredLevel"> & { skill: string }) {
  const { playerData, getSkillLevel } = usePlayerData()
  const playerLevel = getSkillLevel(skill)

  if (!playerData && requiredLevel) {
    return (
      <div className="text-sm text-muted-foreground">
        Required: Level {requiredLevel}
      </div>
    )
  }

  if (playerData && playerLevel !== null) {
    const meetsRequirement = requiredLevel
      ? playerLevel >= requiredLevel
      : null

    return (
      <div className="text-sm text-muted-foreground">
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
    )
  }

  return null
}

function SkillDrawer({
  skill,
  requiredLevel,
  open,
  onOpenChange,
}: SkillDrawerProps) {
  if (!skill) return null

  const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full max-w-md gap-0 overflow-hidden bg-card sm:max-w-md"
      >
        <SheetHeader className="flex-row items-center justify-between gap-4 border-b border-border">
          <SheetTitle className="flex items-center gap-3 text-foreground">
            <img
              src={`/skills/${skill.toLowerCase()}.png`}
              alt={capitalizedSkill}
              className="size-8"
            />
            <span>
              <span className="block text-lg font-semibold">
                {capitalizedSkill} Training Guide
              </span>
              <SkillLevelSubtitle
                skill={skill}
                requiredLevel={requiredLevel}
              />
            </span>
          </SheetTitle>
          <SheetClose asChild>
            <Button
              aria-label="Close skill guide"
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-4">
            <SkillContent
              skill={skill}
              requiredLevel={requiredLevel}
              hideHeader
            />
          </div>
        </ScrollArea>

        <div className="border-t border-border bg-muted/30 p-3">
          <p className="text-center text-xs text-muted-foreground">
            Press <Kbd>Esc</Kbd> or click outside to close
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { SkillDrawer }
export type { SkillDrawerProps }
