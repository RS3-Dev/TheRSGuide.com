"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePlayerData } from "./player-data-context";

export const PlayerSearch: React.FC = () => {
  const { playerData, loading, error, lastSearch, searchPlayer } =
    usePlayerData();
  const [inputValue, setInputValue] = useState(lastSearch);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    setInputValue(lastSearch);
  }, [lastSearch]);

  useEffect(() => {
    if (lastSearch && !playerData && !loading) {
      searchPlayer(lastSearch);
    }
  }, [lastSearch, playerData, loading, searchPlayer]);

  const debouncedSearch = useCallback(
    (username: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        if (username.trim()) {
          searchPlayer(username.trim());
        }
      }, 1000);

      setDebounceTimer(timer);
    },
    [debounceTimer, searchPlayer],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      searchPlayer(inputValue.trim());
    }
  };

  const handleSearch = () => {
    if (inputValue.trim()) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      searchPlayer(inputValue.trim());
    }
  };

  const hasStatus = error || (playerData && !loading);

  return (
    <div className="my-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search input group */}
        <div className="relative flex-1 max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-fd-muted-foreground"
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
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            maxLength={15}
            className="w-full pl-9 pr-20 py-2 text-sm border border-fd-border rounded-lg bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-ring focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSearch}
            disabled={!inputValue.trim() || loading}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-fd-primary hover:text-fd-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
        {hasStatus && (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              error
                ? "bg-[#a07878]/15 text-[#8b4d4d] dark:text-[#c4a2a2]"
                : "bg-[#7d9a78]/15 text-[#3d6b35] dark:text-[#a8c4a2]"
            }`}
          >
            {error ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {error === "Profile is private" ? "Private profile" : "Not found"}
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {playerData?.username}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
