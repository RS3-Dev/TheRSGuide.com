"use client";

import { Check, ChevronDown, ExternalLink, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlayerSearch } from "@/mdx_components/components/player-search";
import { usePlayerData } from "@/mdx_components/components/player-data-context";

export interface EfficiencyGuideRow {
  id: string;
  type: "quest" | "task";
  title: string;
  questName?: string;
  notes?: string;
}

export interface EfficiencyGuideSection {
  id: string;
  title: string;
  rows: EfficiencyGuideRow[];
}

export interface EfficiencyGuideData {
  sourceTitle: string;
  sourceUrl: string;
  sections: EfficiencyGuideSection[];
}

interface EfficiencyGuideTrackerProps {
  guide: EfficiencyGuideData;
}

type CheckedState = Record<string, boolean>;

const STORAGE_KEY = "rs-guide-efficiency-guide";

function loadCheckedState(): CheckedState {
  if (typeof window === "undefined") return {};

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function questUrl(questName: string) {
  return `https://runescape.wiki/w/${questName.replaceAll(" ", "_")}/Quick_guide`;
}

export function EfficiencyGuideTracker({ guide }: EfficiencyGuideTrackerProps) {
  const { playerData, isQuestComplete } = usePlayerData();
  const [manualChecked, setManualChecked] = useState<CheckedState>({});
  const [openSections, setOpenSections] = useState<CheckedState>(() => ({
    [guide.sections[0]?.id || ""]: true,
  }));

  useEffect(() => {
    setManualChecked(loadCheckedState());
  }, []);

  const rows = useMemo(
    () => guide.sections.flatMap((section) => section.rows.map((row) => ({ ...row, sectionId: section.id }))),
    [guide.sections],
  );

  const questCompletion = useMemo(() => {
    const next: CheckedState = {};

    for (const row of rows) {
      if (row.type !== "quest" || !row.questName) continue;
      next[row.id] = isQuestComplete(row.questName) === true;
    }

    return next;
  }, [isQuestComplete, rows]);

  const isComplete = (row: EfficiencyGuideRow) => {
    return manualChecked[row.id] === true || questCompletion[row.id] === true;
  };

  const completedCount = rows.filter(isComplete).length;

  const updateManualChecked = (next: CheckedState) => {
    setManualChecked(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const toggleRow = (row: EfficiencyGuideRow) => {
    const next = { ...manualChecked };

    if (next[row.id]) {
      delete next[row.id];
    } else {
      next[row.id] = true;
    }

    updateManualChecked(next);
  };

  const clearManualChecks = () => {
    updateManualChecked({});
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  return (
    <div className="not-prose flex flex-col gap-5">
      <div className="border border-fd-border bg-fd-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <PlayerSearch />
          <button
            type="button"
            onClick={clearManualChecks}
            className="inline-flex items-center justify-center gap-2 border border-fd-border px-3 py-2 text-sm font-medium text-fd-foreground transition-colors hover:border-fd-primary hover:text-fd-primary"
          >
            <RotateCcw className="size-4" />
            Clear
          </button>
        </div>

        <div className="flex flex-col gap-3 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-fd-foreground">
              {completedCount} of {rows.length} steps complete
            </div>
          </div>
          <a
            href={guide.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-fd-primary hover:underline"
          >
            <img
              src="/images/favicon/wiki-favicon.ico"
              alt=""
              aria-hidden="true"
              className="size-4"
            />
            Wiki Link
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>

      {guide.sections.map((section) => {
        const sectionCompleted = section.rows.filter(isComplete).length;
        const isOpen = openSections[section.id] === true;

        return (
          <section key={section.id} className="overflow-hidden border border-fd-border bg-fd-card">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggleSection(section.id)}
              className="flex w-full flex-col gap-2 border-b border-fd-border bg-fd-muted/40 px-4 py-3 text-left transition-colors hover:bg-fd-muted/60 md:flex-row md:items-center md:justify-between"
            >
              <span className="flex items-center gap-2">
                <ChevronDown
                  className={`size-4 text-fd-muted-foreground transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}
                />
                <span className="text-base font-semibold text-fd-foreground">{section.title}</span>
              </span>
              <span className="text-sm text-fd-muted-foreground">
                {sectionCompleted} of {section.rows.length} complete
              </span>
            </button>

            {isOpen ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-sm">
                  <thead className="bg-fd-muted/40 text-left text-xs uppercase text-fd-muted-foreground">
                    <tr>
                      <th className="w-12 px-3 py-3">Done</th>
                      <th className="px-3 py-3">Task</th>
                      <th className="px-3 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row) => {
                      const checked = isComplete(row);

                      return (
                        <tr key={row.id} className="border-t border-fd-border align-top">
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              aria-label={`Mark ${row.title} ${manualChecked[row.id] ? "incomplete" : "complete"}`}
                              onClick={() => toggleRow(row)}
                              className={`flex size-6 items-center justify-center border transition-colors ${
                                checked
                                  ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                                  : "border-fd-border text-transparent hover:border-fd-primary"
                              }`}
                            >
                              <Check className="size-4" />
                            </button>
                          </td>
                          <td className="px-3 py-3 font-medium text-fd-foreground">
                            {row.type === "quest" && row.questName ? (
                              <a
                                href={questUrl(row.questName)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 hover:text-fd-primary"
                              >
                                {row.title}
                                <ExternalLink className="size-3" />
                              </a>
                            ) : (
                              row.title
                            )}
                          </td>
                          <td className="max-w-xl px-3 py-3 text-fd-muted-foreground">{row.notes || ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
