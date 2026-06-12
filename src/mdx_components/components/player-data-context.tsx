"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";

// Types for API responses
interface SkillLevel {
  name: string;
  level: number;
  xp: number;
  rank: number;
}

interface ApiSkillValue {
  id: number;
  level: number;
  xp: number;
  rank: number;
}

interface DirectPlayerDataResponse {
  name?: string;
  skillvalues?: ApiSkillValue[];
  quests?: QuestStatus[];
  error?: string;
  loggedIn?: string;
}

interface PlayerLevels {
  username: string;
  skills: SkillLevel[];
}

interface QuestStatus {
  id?: string;
  title?: string;
  name?: string;
  status: "Completed" | "Started" | "Not Started" | string;
  difficulty?: string;
  members?: boolean;
  questPoints?: number;
  userEligible?: boolean;
}

interface QuestsResponse {
  username: string;
  quests: QuestStatus[];
}

interface PlayerData {
  username: string;
  levels: PlayerLevels | null;
  quests: QuestsResponse | null;
}

interface PlayerDataContextType {
  playerData: PlayerData | null;
  loading: boolean;
  error: string | null;
  lastSearch: string;
  searchPlayer: (username: string) => Promise<void>;
  getSkillLevel: (skillName: string) => number | null;
  isQuestComplete: (questName: string) => boolean | null;
}

const PlayerDataContext = createContext<PlayerDataContextType | undefined>(undefined);

const STORAGE_KEY = "rs3_player_search";

const SKILL_ID_MAP: Record<number, string> = {
  0: "Attack",
  1: "Defence",
  2: "Strength",
  3: "Constitution",
  4: "Ranged",
  5: "Prayer",
  6: "Magic",
  7: "Cooking",
  8: "Woodcutting",
  9: "Fletching",
  10: "Fishing",
  11: "Firemaking",
  12: "Crafting",
  13: "Smithing",
  14: "Mining",
  15: "Herblore",
  16: "Agility",
  17: "Thieving",
  18: "Slayer",
  19: "Farming",
  20: "Runecrafting",
  21: "Hunter",
  22: "Construction",
  23: "Summoning",
  24: "Dungeoneering",
  25: "Divination",
  26: "Invention",
  27: "Archaeology",
  28: "Necromancy",
};

function normalizeUsername(username: string) {
  return username.trim();
}

function mapDirectApiSkills(skillValues: ApiSkillValue[] = []): SkillLevel[] {
  return skillValues
    .map((skill) => {
      const name = SKILL_ID_MAP[skill.id];
      if (!name) return null;

      return {
        name,
        level: skill.level,
        xp: skill.xp,
        rank: skill.rank,
      };
    })
    .filter((skill): skill is SkillLevel => skill !== null);
}

function normalizeQuestStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Skill name normalization map
const SKILL_NAME_MAP: { [key: string]: string } = {
  attack: "Attack",
  defence: "Defence",
  strength: "Strength",
  constitution: "Constitution",
  ranged: "Ranged",
  prayer: "Prayer",
  magic: "Magic",
  cooking: "Cooking",
  woodcutting: "Woodcutting",
  fletching: "Fletching",
  fishing: "Fishing",
  firemaking: "Firemaking",
  crafting: "Crafting",
  smithing: "Smithing",
  mining: "Mining",
  herblore: "Herblore",
  agility: "Agility",
  thieving: "Thieving",
  slayer: "Slayer",
  farming: "Farming",
  runecrafting: "Runecrafting",
  hunter: "Hunter",
  construction: "Construction",
  summoning: "Summoning",
  dungeoneering: "Dungeoneering",
  divination: "Divination",
  invention: "Invention",
  archaeology: "Archaeology",
  necromancy: "Necromancy",
};

export function PlayerDataProvider({ children }: { children: ReactNode }) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const autoLoadedSearchRef = useRef<string | null>(null);
  const activeRequestIdRef = useRef(0);
  const activeAbortControllerRef = useRef<AbortController | null>(null);

  // Load last search from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLastSearch(normalizeUsername(saved));
      }
    }
    setHasHydrated(true);
  }, []);

  const searchPlayer = useCallback(async (username: string) => {
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) return;

    activeRequestIdRef.current += 1;
    const requestId = activeRequestIdRef.current;

    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const questsUrl = `/api/player/${encodeURIComponent(normalizedUsername)}`;
      const questsRes = await fetch(questsUrl, {
        signal: abortController.signal,
      });

      if (!questsRes.ok) {
        if (questsRes.status === 404) {
          throw new Error("User not found");
        }
        const data = await questsRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch player data");
      }

      const data: DirectPlayerDataResponse = await questsRes.json();

      if (data.error === "NO_PROFILE") {
        throw new Error("User not found");
      }

      if (data.error === "PROFILE_PRIVATE") {
        throw new Error("Profile is private");
      }

      if (!data.skillvalues) {
        throw new Error("Failed to fetch player data");
      }

      if (requestId !== activeRequestIdRef.current) {
        return;
      }

      const resolvedUsername = data.name || normalizedUsername;

      setPlayerData({
        username: resolvedUsername,
        levels: {
          username: resolvedUsername,
          skills: mapDirectApiSkills(data.skillvalues),
        },
        quests: data.quests
          ? {
              username: resolvedUsername,
              quests: data.quests.map((quest) => ({
                ...quest,
                status: normalizeQuestStatus(quest.status),
              })),
            }
          : null,
      });

      setLastSearch(resolvedUsername);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, resolvedUsername);
      }
    } catch (err) {
      if (abortController.signal.aborted || requestId !== activeRequestIdRef.current) {
        return;
      }

      setError(err instanceof Error ? err.message : "Unknown error");
      setPlayerData(null);
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated || !lastSearch) return;
    if (autoLoadedSearchRef.current === lastSearch) return;

    autoLoadedSearchRef.current = lastSearch;
    void searchPlayer(lastSearch);
  }, [hasHydrated, lastSearch, searchPlayer]);

  useEffect(() => {
    return () => {
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
    };
  }, []);

  const getSkillLevel = useCallback((skillName: string): number | null => {
    if (!playerData?.levels?.skills) return null;

    const normalizedName = SKILL_NAME_MAP[skillName.toLowerCase()] || skillName;
    const skill = playerData.levels.skills.find(
      (s) => s.name.toLowerCase() === normalizedName.toLowerCase()
    );
    return skill?.level ?? null;
  }, [playerData]);

  const isQuestComplete = useCallback((questName: string): boolean | null => {
    if (!playerData?.quests?.quests) return null;

    const quest = playerData.quests.quests.find((q) => {
      // API may use 'title' or 'name' for quest name
      const qName = q.title || q.name;
      if (!qName) return false;
      return qName.toLowerCase() === questName.toLowerCase();
    });
    if (!quest) return null;
    return quest.status === "Completed";
  }, [playerData]);

  return (
    <PlayerDataContext.Provider
      value={{
        playerData,
        loading,
        error,
        lastSearch,
        searchPlayer,
        getSkillLevel,
        isQuestComplete,
      }}
    >
      {children}
    </PlayerDataContext.Provider>
  );
}

export function usePlayerData() {
  const context = useContext(PlayerDataContext);
  if (context === undefined) {
    throw new Error("usePlayerData must be used within a PlayerDataProvider");
  }
  return context;
}
