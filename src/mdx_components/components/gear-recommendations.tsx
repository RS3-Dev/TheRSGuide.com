'use client';

import React, { useState, useMemo } from 'react';
import gearData from '@/data/gear-by-style.json';

type CombatStyle = 'magic' | 'ranged' | 'melee' | 'necromancy';
type GearMode = 'training' | 'pvm';

interface GearItem {
  name: string;
  tier: number;
  ironman?: boolean;
  note?: string;
}

interface GearCategory {
  weapons: GearItem[];
  armour: GearItem[];
}

interface GearStyle {
  training: GearCategory;
  pvm: GearCategory;
}

type GearDataType = Record<CombatStyle, GearStyle>;

interface GearRecommendationsProps {
  style: CombatStyle;
}

// Group items by tier for displaying alternatives
interface TierGroup {
  tier: number;
  items: GearItem[];
}

const groupItemsByTier = (items: GearItem[]): TierGroup[] => {
  const groups: TierGroup[] = [];
  let currentGroup: TierGroup | null = null;

  items.forEach((item) => {
    if (currentGroup && currentGroup.tier === item.tier) {
      currentGroup.items.push(item);
    } else {
      currentGroup = { tier: item.tier, items: [item] };
      groups.push(currentGroup);
    }
  });

  return groups;
};

const GearList: React.FC<{ title: string; items: GearItem[] }> = ({ title, items }) => {
  const tierGroups = groupItemsByTier(items);

  return (
    <div className="my-4">
      <h3 className="text-sm font-medium text-fd-muted-foreground uppercase tracking-wide mb-3">
        {title}
      </h3>
      <div className="border border-fd-border rounded-lg overflow-hidden">
        {tierGroups.map((group, groupIndex) => (
          <div
            key={`tier-${group.tier}-${groupIndex}`}
            className={`flex items-center justify-between px-4 py-3 ${
              groupIndex !== tierGroups.length - 1 ? 'border-b border-fd-border' : ''
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-xs font-mono text-fd-muted-foreground w-8 flex-shrink-0">
                T{group.tier}
              </span>
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                {group.items.map((item, itemIndex) => (
                  <React.Fragment key={`${item.name}-${itemIndex}`}>
                    {itemIndex > 0 && (
                      <span className="text-xs text-fd-muted-foreground mx-1">OR</span>
                    )}
                    <span className="font-medium">{item.name}</span>
                    {item.ironman && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded bg-[#4a5d4a]/20 text-[#6b8b6b]"
                        title="Ironman friendly"
                      >
                        IM
                      </span>
                    )}
                    {item.note && (
                      <span className="text-xs text-fd-muted-foreground hidden sm:inline">
                        ({item.note})
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {groupIndex < tierGroups.length - 1 && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-fd-muted-foreground"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper to compare if two gear categories are identical
const areGearCategoriesEqual = (a: GearCategory, b: GearCategory): boolean => {
  if (a.weapons.length !== b.weapons.length || a.armour.length !== b.armour.length) {
    return false;
  }

  const weaponsEqual = a.weapons.every((item, idx) =>
    item.name === b.weapons[idx].name && item.tier === b.weapons[idx].tier
  );

  const armourEqual = a.armour.every((item, idx) =>
    item.name === b.armour[idx].name && item.tier === b.armour[idx].tier
  );

  return weaponsEqual && armourEqual;
};

export const GearRecommendations: React.FC<GearRecommendationsProps> = ({ style }) => {
  const [activeTab, setActiveTab] = useState<GearMode>('training');

  const styleData = (gearData as GearDataType)[style];

  const hasDifferentGear = useMemo(() => {
    if (!styleData) return false;
    return !areGearCategoriesEqual(styleData.training, styleData.pvm);
  }, [styleData]);

  if (!styleData) {
    return <div>No gear data found for {style}</div>;
  }

  const currentGear = styleData[activeTab];

  if (!currentGear) {
    return <div>No gear data found for {style} - {activeTab}</div>;
  }

  const styleLabels: Record<CombatStyle, { training: string; pvm: string }> = {
    melee: { training: 'Training (Halberds)', pvm: 'PvM (Single Target)' },
    ranged: { training: 'Training (Chinchompas)', pvm: 'PvM (Single Target)' },
    magic: { training: 'Training', pvm: 'PvM' },
    necromancy: { training: 'Training', pvm: 'PvM' },
  };

  return (
    <div>
      {/* Tabbed Container */}
      <div className="border border-fd-border rounded-lg overflow-hidden">
        {/* Tab Header - only show if gear differs */}
        {hasDifferentGear && (
          <div className="flex border-b border-fd-border bg-fd-muted/30">
            <button
              onClick={() => setActiveTab('training')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'training'
                  ? 'bg-fd-card text-fd-primary border-b-2 border-fd-primary -mb-px'
                  : 'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted/50'
              }`}
            >
              {styleLabels[style].training}
            </button>
            <button
              onClick={() => setActiveTab('pvm')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors border-l border-fd-border ${
                activeTab === 'pvm'
                  ? 'bg-fd-card text-fd-primary border-b-2 border-fd-primary -mb-px'
                  : 'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted/50'
              }`}
            >
              {styleLabels[style].pvm}
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-4 bg-fd-card">
          <h2 className="text-xl font-semibold mb-4">Weapons</h2>
          <GearList title="Weapon Progression" items={currentGear.weapons} />

          <h2 className="text-xl font-semibold mb-4 mt-8">Armour</h2>
          <GearList title="Armour Progression" items={currentGear.armour} />
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
};
