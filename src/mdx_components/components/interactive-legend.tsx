'use client';

import React, { useState } from 'react';

interface LegendItem {
  id: string;
  name: string;
  description: string;
  hoverImage: string;
  icon?: string;
}

interface InteractiveLegendProps {
  baseImage: string;
  items: LegendItem[];
}

export const InteractiveLegend: React.FC<InteractiveLegendProps> = ({
  baseImage,
  items,
}) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [lockedItem, setLockedItem] = useState<string | null>(null);

  const hasIcons = items.some((item) => item.icon);

  const handleHover = (itemId: string | null) => {
    if (!lockedItem) {
      setActiveItem(itemId);
    }
  };

  const handleClick = (itemId: string) => {
    if (lockedItem === itemId) {
      setLockedItem(null);
      setActiveItem(null);
    } else {
      setLockedItem(itemId);
      setActiveItem(itemId);
    }
  };

  const displayedItem = lockedItem || activeItem;
  const currentImage = displayedItem
    ? items.find((item) => item.id === displayedItem)?.hoverImage || baseImage
    : baseImage;

  return (
    <div className="md:my-4 select-none grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 items-start">
      {/* Image */}
      <div>
        <img
          src={currentImage}
          alt="Interactive view"
          className="block w-full rounded-lg border border-[var(--color-fd-border)]"
        />
        <p className="mt-2 text-xs text-[var(--color-fd-muted-foreground)] text-center">
          <span className="md:hidden">Tap to view on map</span>
          <span className="hidden md:inline">Hover to preview, click to lock</span>
        </p>
      </div>

      {/* Table */}
      <table
        style={{
          width: '100%',
          fontSize: '0.875rem',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--color-fd-border)',
              backgroundColor: 'var(--color-fd-muted)',
            }}
          >
            {hasIcons && (
              <th style={{ width: '3rem', padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500 }}>
                Icon
              </th>
            )}
            <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500 }}>
              Name
            </th>
            <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500 }}>
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isLocked = lockedItem === item.id;
            const isActive = activeItem === item.id;

            let rowStyle: React.CSSProperties = {
              borderBottom: '1px solid var(--color-fd-border)',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            };

            if (isLocked) {
              rowStyle.backgroundColor = 'rgba(125, 154, 120, 0.2)';
            } else if (isActive) {
              rowStyle.backgroundColor = 'var(--color-fd-muted)';
            }

            return (
              <tr
                key={item.id}
                style={rowStyle}
                onMouseEnter={() => handleHover(item.id)}
                onMouseLeave={() => handleHover(null)}
                onClick={() => handleClick(item.id)}
              >
                {hasIcons && (
                  <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '1.25rem' }}>
                    {item.icon || ''}
                  </td>
                )}
                <td style={{ padding: '0.5rem', fontWeight: 500 }}>
                  {item.name}
                </td>
                <td style={{ padding: '0.5rem', color: 'var(--color-fd-muted-foreground)' }}>
                  {item.description}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
