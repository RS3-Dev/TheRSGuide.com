'use client';

import React from 'react';
import gearData from 'public/data/gear-by-style.json';

type CombatStyle = 'magic' | 'ranged' | 'melee' | 'necromancy';

interface GearItem {
  name: string;
  tier: number;
  description: string | string[];
}

interface GearRecommendationsProps {
  style: CombatStyle;
}

const GearList: React.FC<{ title: string; items: GearItem[] }> = ({ title, items }) => {
  return (
    <div className="my-4">
      <h3 className="text-sm font-medium text-fd-muted-foreground uppercase tracking-wide mb-3">
        {title}
      </h3>
      <div className="border border-fd-border rounded-lg overflow-hidden">
        {items.map((item, index) => (
          <div
            key={`${item.name}-${item.tier}`}
            className={`flex items-center justify-between px-4 py-3 ${
              index !== items.length - 1 ? 'border-b border-fd-border' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-fd-muted-foreground w-8">
                T{item.tier}
              </span>
              <span className="font-medium">{item.name}</span>
            </div>
            {index < items.length - 1 && (
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
        ))}
      </div>
    </div>
  );
};

export const GearRecommendations: React.FC<GearRecommendationsProps> = ({ style }) => {
  const styleData = gearData[style];

  if (!styleData) {
    return <div>No gear data found for {style}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Weapons</h2>
      <GearList title="Weapon Progression" items={styleData.weapons} />

      <h2 className="text-xl font-semibold mb-4 mt-8">Armour</h2>
      <GearList title="Armour Progression" items={styleData.armour} />

      <div className="h-8" />
    </div>
  );
};
