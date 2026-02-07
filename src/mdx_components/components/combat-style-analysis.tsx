'use client';

import React from 'react';

interface Metric {
  label: string;
  rating: number;
}

interface CombatStyleAnalysisProps {
  metrics: Metric[];
}

export const CombatStyleAnalysis: React.FC<CombatStyleAnalysisProps> = ({
  metrics,
}) => {
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--color-fd-border)',
        backgroundColor: 'var(--color-fd-card)',
      }}
    >
      <h3
        style={{
          margin: '0 0 1.25rem 0',
          fontSize: '1.125rem',
          fontWeight: 600,
        }}
      >
        Combat Style Analysis
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {metrics.map((metric, index) => (
          <div key={index}>
            {/* Label and rating row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.375rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-fd-muted-foreground)',
                }}
              >
                {metric.label}
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-fd-muted-foreground)',
                }}
              >
                {metric.rating}/10
              </span>
            </div>

            {/* Bar chart */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '8px',
                    borderRadius: '2px',
                    backgroundColor:
                      i < metric.rating
                        ? 'var(--color-fd-primary)'
                        : 'var(--color-fd-muted)',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
