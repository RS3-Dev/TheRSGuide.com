'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface FooterNavItem {
  name: ReactNode;
  url: string;
}

interface FooterNavProps {
  previous?: FooterNavItem;
  next?: FooterNavItem;
}

export function FooterNav({ previous, next }: FooterNavProps) {
  if (!previous && !next) return null;

  return (
    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--border-subtle)]">
      {previous ? (
        <Link
          href={previous.url}
          className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors no-underline"
        >
          <ChevronLeft className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs text-[var(--text-muted)]">
              Previous
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {previous.name}
            </span>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.url}
          className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors no-underline"
        >
          <div className="flex flex-col gap-1 min-w-0 text-right flex-1">
            <span className="text-xs text-[var(--text-muted)]">
              Next
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {next.name}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
