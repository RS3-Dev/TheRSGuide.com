'use client';

import React from 'react';

interface GearItem {
  name: string;
  tier: number;
}

interface GearProgressionProps {
  title: string;
  items: GearItem[];
}

export const GearProgression: React.FC<GearProgressionProps> = ({ title, items }) => {
  return (
    <div className="my-4">
      <h3 className="text-sm font-medium text-fd-muted-foreground uppercase tracking-wide mb-3">
        {title}
      </h3>
      <div className="border border-fd-border rounded-lg overflow-hidden">
        {items.map((item, index) => (
          <div
            key={item.name}
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
