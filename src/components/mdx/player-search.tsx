"use client";

import React from "react";
import { usePlayerLookup } from "@/components/player/use-player-lookup";

export const PlayerSearch: React.FC = () => {
  const { value, changeValue, submit, loading, status } = usePlayerLookup({
    initialValueFromUrl: true,
    debounceMs: 1000,
  });

  return (
    <div className="my-4">
      <div className="flex flex-col sm:flex-row xs:items-center gap-3">
        {/* Search input group */}
        <div className="relative flex-1 min-[512px]:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Load your stats..."
            value={value}
            onChange={(event) => changeValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              submit();
            }}
            disabled={loading}
            maxLength={15}
            className="w-full pl-9 pr-20 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || loading}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              "Search"
            )}
          </button>
        </div>

        {/* Status pill */}
        {status && (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              status.kind === "error"
                ? "bg-[#a07878]/15 text-[#8b4d4d] dark:text-[#c4a2a2]"
                : "bg-[#7d9a78]/15 text-[#3d6b35] dark:text-[#a8c4a2]"
            }`}
          >
            {status.kind === "error" ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {status.label}
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {status.label}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
