import React, { ReactNode } from "react";

// SplitItem component for individual content sections
export const SplitItem = ({
  children,
  width,
}: {
  children: ReactNode;
  width?: number;
}) => {
  // On mobile, items are full width. On desktop (md+), apply width constraints
  const style = width
    ? ({
        '--split-width': `calc(${width}% - 0.5rem)`,
      } as React.CSSProperties)
    : {};

  const className = width
    ? "not-prose min-w-0 w-full md:w-auto md:flex-none md:[flex-basis:var(--split-width)] md:max-w-[var(--split-width)]"
    : "not-prose flex-1 min-w-0 w-full md:w-auto";

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

// SplitContent component for side-by-side layouts
export const SplitContent = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      {children}
    </div>
  );
};

// Center component for centering content horizontally
export const Center = ({ children }: { children: ReactNode }) => {
  return (
    <div className="not-prose flex justify-center items-center w-full">
      {children}
    </div>
  );
};
