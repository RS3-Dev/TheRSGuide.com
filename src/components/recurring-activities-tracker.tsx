"use client";

import { Check, ExternalLink, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ActivityFrequency = "daily" | "weekly" | "monthly";

export interface RecurringActivity {
  id: string;
  frequency: ActivityFrequency;
  activity: string;
  priority: number;
  stoppingPoint: string;
  notes: string;
  details?: string;
  href?: string;
}

interface RecurringActivitiesTrackerProps {
  activities: RecurringActivity[];
}

type CheckedState = Record<string, string>;

const STORAGE_KEY = "rs-guide-recurring-activities";

const frequencyLabels: Record<ActivityFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

function utcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day));
}

function formatCycleDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getCycleStart(frequency: ActivityFrequency, now: Date) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  if (frequency === "daily") {
    return utcDate(year, month, day);
  }

  if (frequency === "monthly") {
    return utcDate(year, month, 1);
  }

  const todayMidnight = utcDate(year, month, day);
  const daysSinceWednesday = (now.getUTCDay() - 3 + 7) % 7;
  return new Date(todayMidnight.getTime() - daysSinceWednesday * 24 * 60 * 60 * 1000);
}

function getNextReset(frequency: ActivityFrequency, now: Date) {
  const start = getCycleStart(frequency, now);

  if (frequency === "daily") {
    return new Date(start.getTime() + 24 * 60 * 60 * 1000);
  }

  if (frequency === "monthly") {
    return utcDate(start.getUTCFullYear(), start.getUTCMonth() + 1, 1);
  }

  return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
}

function getCycleKey(frequency: ActivityFrequency, now: Date) {
  return `${frequency}:${formatCycleDate(getCycleStart(frequency, now))}`;
}

function formatCountdown(target: Date, now: Date) {
  const remainingMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

function loadCheckedState(): CheckedState {
  if (typeof window === "undefined") return {};

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function RecurringActivitiesTracker({ activities }: RecurringActivitiesTrackerProps) {
  const [checked, setChecked] = useState<CheckedState>({});
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setChecked(loadCheckedState());

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const cycleKeys = useMemo(
    () => ({
      daily: getCycleKey("daily", now),
      weekly: getCycleKey("weekly", now),
      monthly: getCycleKey("monthly", now),
    }),
    [now],
  );

  const sortedActivities = useMemo(
    () =>
      [...activities].sort((a, b) => {
        const frequencyOrder = { daily: 0, weekly: 1, monthly: 2 };
        return frequencyOrder[a.frequency] - frequencyOrder[b.frequency] || b.priority - a.priority;
      }),
    [activities],
  );

  const completedCount = sortedActivities.filter(
    (activity) => checked[activity.id] === cycleKeys[activity.frequency],
  ).length;

  const updateChecked = (next: CheckedState) => {
    setChecked(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const toggleActivity = (activity: RecurringActivity) => {
    const cycleKey = cycleKeys[activity.frequency];
    const next = { ...checked };

    if (next[activity.id] === cycleKey) {
      delete next[activity.id];
    } else {
      next[activity.id] = cycleKey;
    }

    updateChecked(next);
  };

  const clearCurrentCycles = () => {
    const next = { ...checked };

    for (const activity of sortedActivities) {
      if (next[activity.id] === cycleKeys[activity.frequency]) {
        delete next[activity.id];
      }
    }

    updateChecked(next);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {(["daily", "weekly", "monthly"] as ActivityFrequency[]).map((frequency) => (
          <div key={frequency} className="border border-fd-border bg-fd-card p-4">
            <div className="text-xs uppercase text-fd-muted-foreground">{frequencyLabels[frequency]} resets in</div>
            <div className="mt-1 text-sm font-semibold text-fd-foreground">
              {formatCountdown(getNextReset(frequency, now), now)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border border-fd-border bg-fd-card p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-fd-foreground">
            {completedCount} of {sortedActivities.length} current activities completed
          </div>
          <div className="text-sm text-fd-muted-foreground">
            Checked items reset automatically at 00:00 game time for their daily, weekly, or monthly cycle.
          </div>
        </div>
        <button
          type="button"
          onClick={clearCurrentCycles}
          className="inline-flex items-center justify-center gap-2 border border-fd-border px-3 py-2 text-sm font-medium text-fd-foreground transition-colors hover:border-fd-primary hover:text-fd-primary"
        >
          <RotateCcw className="size-4" />
          Clear current
        </button>
      </div>

      <div className="overflow-x-auto border border-fd-border">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-fd-muted/60 text-left text-fd-muted-foreground">
            <tr>
              <th className="w-12 px-3 py-3">Done</th>
              <th className="px-3 py-3">Activity</th>
              <th className="px-3 py-3">Time Left</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sortedActivities.map((activity) => {
              const isChecked = checked[activity.id] === cycleKeys[activity.frequency];

              return (
                <tr key={activity.id} className="border-t border-fd-border align-top">
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      aria-label={`Mark ${activity.activity} ${isChecked ? "incomplete" : "complete"}`}
                      onClick={() => toggleActivity(activity)}
                      className={`flex size-6 items-center justify-center border transition-colors ${
                        isChecked
                          ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                          : "border-fd-border text-transparent hover:border-fd-primary"
                      }`}
                    >
                      <Check className="size-4" />
                    </button>
                  </td>
                  <td className="px-3 py-3 font-medium text-fd-foreground">
                    {activity.href ? (
                      <a
                        href={activity.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-fd-primary"
                      >
                        {activity.activity}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      activity.activity
                    )}
                  </td>
                  <td className="px-3 py-3 text-fd-muted-foreground">
                    {formatCountdown(getNextReset(activity.frequency, now), now)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex min-w-8 justify-center bg-fd-muted px-2 py-1 text-xs font-semibold text-fd-foreground">
                      {activity.priority}
                    </span>
                  </td>
                  <td className="max-w-md px-3 py-3 text-fd-muted-foreground">
                    <div className="font-medium text-fd-foreground">Stopping point: {activity.stoppingPoint}</div>
                    <div>{activity.notes}</div>
                    {activity.details ? <div className="mt-1 text-xs opacity-80">{activity.details}</div> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
