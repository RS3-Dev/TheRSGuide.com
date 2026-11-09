'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Link2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { PlayerSearch } from '@/components/mdx/player-search';
import { usePlayerData } from '@/components/player/player-data-context';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  buildGearStages,
  buildProgressionRows,
  DEFAULT_GEAR_STYLE,
  findStageIndex,
  formatRequirement,
  gearByStyle,
  gearCategoriesMatch,
  gearDollSlots,
  gearImageUrl,
  gearModeLabels,
  gearSlotLabels,
  gearStyles,
  parseGearStyle,
  pickRequirements,
  pieceRequirements,
  unmetRequirements,
  upgradedSlots,
  wornGear,
  type CombatStyle,
  type GearMode,
  type GearPick,
  type GearPiece,
  type GearPieces,
  type GearRequirement,
  type GearSlot,
  type GearStage,
  type GearTrack,
  type ProgressionOption,
  type ProgressionStep,
} from '@/lib/gear-progression';
import { cn } from '@/lib/utils';

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const lockedIcon = 'opacity-40 grayscale';
const overviewBand = 'bg-foreground/[0.04]';
// The same band over an opaque base, since items scroll underneath the sticky labels.
const overviewLabelBand =
  'bg-background bg-linear-to-r from-foreground/[0.04] to-foreground/[0.04]';

// Nothing is unmet until a player is loaded, so the guide reads normally without one.
const useUnmetRequirements = () => {
  const { playerData, getSkillLevel } = usePlayerData();
  return (requirements: readonly GearRequirement[]) =>
    playerData ? unmetRequirements(requirements, getSkillLevel) : [];
};

const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter((word) => /^[a-z]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

const ItemIcon: React.FC<{
  piece: GearPiece;
  alt?: string;
  lazy?: boolean;
}> = ({ piece, alt = '', lazy = false }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        data-gear-icon-fallback
        className="flex h-8 w-9 items-center justify-center text-[0.7rem] font-semibold text-[#d9c7a8]"
      >
        {initials(piece.name)}
      </span>
    );
  }

  return (
    <img
      src={gearImageUrl(piece.config)}
      alt={alt}
      width={36}
      height={32}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className="block object-contain select-none [image-rendering:pixelated]"
    />
  );
};

const DependencyMarker: React.FC = () => (
  <span
    className="absolute top-0.5 left-0.5 flex size-4 items-center justify-center rounded-sm bg-primary text-primary-foreground"
    data-gear-dependency-marker
  >
    <Link2 aria-hidden="true" className="size-3" strokeWidth={3} />
  </span>
);

const IconFrame: React.FC<{
  piece: GearPiece;
  lazy?: boolean;
  locked?: boolean;
  marked?: boolean;
}> = ({ piece, lazy, locked = false, marked = false }) => (
  <span className="relative flex size-11 flex-shrink-0 items-center justify-center rounded-sm border border-[#8a7557] bg-[#2b251e] dark:border-primary/40 dark:bg-[#0d0b09]">
    {marked && <DependencyMarker />}
    <span className={cn(locked && lockedIcon)}>
      <ItemIcon key={piece.config} piece={piece} lazy={lazy} />
    </span>
  </span>
);

const TOOLTIP_DELAY_MS = 200;

// Follows the pointer rather than Radix's defaults, so a tooltip only ever shows for the item
// under it: never after a click, or when focus returns to the window. Touch screens have no
// hover, so a tap opens it instead, until the next tap elsewhere.
const GearTooltip: React.FC<{ label: React.ReactNode; children: React.ReactElement }> = ({ label, children }) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pointerType = useRef<string>('');

  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), TOOLTIP_DELAY_MS);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Tooltip open={open} onOpenChange={(next) => !next && hide()} disableHoverableContent>
      <TooltipTrigger
        asChild
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') show();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') hide();
        }}
        onPointerDown={(event) => {
          pointerType.current = event.pointerType;
          hide();
        }}
        onClick={(event) => {
          if (pointerType.current !== 'touch') return;
          // Stops Radix closing the tooltip on click; a button here has no default action to lose.
          event.preventDefault();
          setOpen(true);
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) show();
        }}
        onBlur={hide}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent sideOffset={6} className="pointer-events-none">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

// Just the name, unless there is something more the player needs to know about this item.
const PieceTooltipContent: React.FC<{ piece: GearPiece; pick?: GearPick }> = ({ piece, pick }) => {
  const missing = useUnmetRequirements()(pieceRequirements(piece));
  const details = [
    pick?.note,
    pick?.exampleSet && `Example set shown: ${pick.exampleSet}`,
    missing.length > 0 && `Needs ${missing.map(formatRequirement).join(', ')}`,
    piece.dependsOn && `Only after: ${piece.dependsOn.name}`,
    piece.dependsOn?.reason,
  ].filter(Boolean);

  if (details.length === 0) return piece.name;
  return (
    <span className="grid max-w-64 gap-0.5">
      <span className="font-semibold">{piece.name}</span>
      {details.map((detail) => (
        <span key={String(detail)}>{detail}</span>
      ))}
    </span>
  );
};

// Slot centres sit on the 3 x 5 grid, so connectors can be drawn in grid units.
const DollConnectors: React.FC = () => (
  <svg
    aria-hidden="true"
    className="absolute inset-0 size-full text-[#a8977f] dark:text-primary/30"
    viewBox="0 0 300 500"
    preserveAspectRatio="none"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      vectorEffect="non-scaling-stroke"
      d="M150 50V450M50 150H250M50 250H250M50 250V450M250 250V450"
    />
  </svg>
);

const PaperDoll: React.FC<{
  worn: Partial<Record<GearSlot, GearPiece>>;
  upgraded: ReadonlySet<GearSlot>;
  upgrade: number;
}> = ({ worn, upgraded, upgrade }) => {
  const unmet = useUnmetRequirements();

  return (
    <div className="relative mx-auto w-[11.25rem]" data-gear-doll>
      <DollConnectors />
      <ul
        aria-label={`Equipment slots at upgrade ${upgrade}`}
        className="relative grid grid-cols-3 grid-rows-[repeat(5,3.75rem)]"
      >
        {gearDollSlots.map(({ slot, column, row }) => {
          const piece = worn[slot];
          const label = gearSlotLabels[slot];
          const needs = piece
            ? unmet(pieceRequirements(piece)).map(formatRequirement).join(', ')
            : '';
          return (
            <li
              key={slot}
              className="flex items-center justify-center"
              style={{ gridColumn: column, gridRow: row }}
              data-gear-slot={slot}
            >
              {piece ? (
                <GearTooltip label={<PieceTooltipContent piece={piece} />}>
                  <span className="relative flex size-12 items-center justify-center rounded-sm border border-[#8a7557] bg-[#2b251e] shadow-[inset_0_0_0_1px_rgb(0_0_0/35%)] dark:border-primary/50 dark:bg-[#0d0b09]">
                    {upgraded.has(slot) && (
                      <span
                        className="absolute top-0.5 left-0.5 flex size-4 items-center justify-center rounded-sm bg-progress-complete text-progress-complete-foreground"
                        data-gear-upgraded
                      >
                        <ArrowUp aria-hidden="true" className="size-3" strokeWidth={3} />
                        <span className="sr-only">Upgraded at this step</span>
                      </span>
                    )}
                    {piece.dependsOn && !upgraded.has(slot) && <DependencyMarker />}
                    <span className={cn(needs && lockedIcon)}>
                      <ItemIcon
                        key={piece.config}
                        piece={piece}
                        alt={`${label}: ${piece.name}${needs ? `, requires ${needs}` : ''}`}
                      />
                    </span>
                  </span>
                </GearTooltip>
              ) : (
                <span className="flex size-12 items-center justify-center rounded-sm border border-dashed border-[#a8977f] bg-card text-center text-[0.65rem] leading-tight text-muted-foreground dark:border-primary/25">
                  {label}
                  <span className="sr-only">: empty at this upgrade</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const StageRail: React.FC<{
  stages: readonly GearStage[];
  activeIndex: number;
  onSelectTier: (tier: number) => void;
}> = ({ stages, activeIndex, onSelectTier }) => {
  const unmet = useUnmetRequirements();

  return (
    <ol aria-label="Upgrades" className="flex flex-wrap gap-1.5">
      {stages.map((stage, index) => {
        const active = index === activeIndex;
        const locked = [...stage.weapons, ...stage.armour].every(
          (pick) => unmet(pickRequirements(pick)).length > 0
        );
        const contents = [
          stage.weapons.length > 0 ? 'weapon' : null,
          stage.armour.length > 0 ? 'armour' : null,
        ].filter(Boolean);
        return (
          <li key={stage.tier}>
            <button
              type="button"
              aria-current={active ? 'step' : undefined}
              aria-label={`Upgrade ${index + 1}: ${contents.join(' and ')}${locked ? ', levels too low' : ''}`}
              onClick={() => onSelectTier(stage.tier)}
              className={cn(
                'flex h-11 min-w-11 items-center justify-center rounded-sm border px-2 text-sm font-semibold tabular-nums transition-colors motion-reduce:transition-none',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : locked
                    ? 'border-dashed border-border bg-card text-muted-foreground hover:bg-accent'
                    : index < activeIndex
                      ? 'border-primary/40 bg-primary/10 hover:bg-primary/20'
                      : 'border-border bg-card hover:bg-accent',
                focusRing
              )}
            >
              {index + 1}
            </button>
          </li>
        );
      })}
    </ol>
  );
};

const UpgradeOverviewItem: React.FC<{
  option: ProgressionOption;
  step: ProgressionStep;
  worn: boolean;
  isDependency: boolean;
  onHighlightDependency: (name: string | null) => void;
  onSelect: (stage: GearStage, track: GearTrack, pick: GearPick) => void;
}> = ({ option: { track, pick, piece }, step, worn, isDependency, onHighlightDependency, onSelect }) => {
  const unmet = useUnmetRequirements();
  const requirements = pieceRequirements(piece);
  const label = [
    piece.name,
    `upgrade ${step.upgrade}`,
    requirements.length > 0 && `requires ${requirements.map(formatRequirement).join(', ')}`,
    piece.dependsOn && `only after ${piece.dependsOn.name}`,
  ]
    .filter(Boolean)
    .join(', ');
  const dependencyName = piece.dependsOn?.name;

  return (
    <GearTooltip label={<PieceTooltipContent piece={piece} pick={pick} />}>
      <button
        type="button"
        aria-label={label}
        aria-current={worn ? 'true' : undefined}
        onClick={() => onSelect(step.stage, track, pick)}
        onPointerEnter={(event) => {
          if (dependencyName && event.pointerType === 'mouse') onHighlightDependency(dependencyName);
        }}
        onPointerLeave={() => dependencyName && onHighlightDependency(null)}
        onFocus={(event) => {
          if (dependencyName && event.currentTarget.matches(':focus-visible')) {
            onHighlightDependency(dependencyName);
          }
        }}
        onBlur={() => dependencyName && onHighlightDependency(null)}
        className={cn(
          'block rounded-sm transition-[filter] hover:brightness-125 motion-reduce:transition-none',
          worn && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
          isDependency && 'ring-2 ring-progress-complete ring-offset-1 ring-offset-background',
          focusRing
        )}
        data-gear-dependency-highlight={isDependency ? '' : undefined}
      >
        <IconFrame
          piece={piece}
          lazy
          locked={unmet(requirements).length > 0}
          marked={Boolean(piece.dependsOn)}
        />
      </button>
    </GearTooltip>
  );
};

// Alternatives share one line when they all fit, and otherwise stack with each OR on its own
// line: the OR's basis collapses to its content above the fitting width and fills the line below it.
const orFlexBasis = (options: number) => {
  const iconWidth = 44;
  const orWithGaps = 25;
  const fittingWidth = options * iconWidth + (options - 1) * orWithGaps;
  return `calc((${fittingWidth}px - 100%) * 999)`;
};

const UpgradeOverview: React.FC<{
  stages: readonly GearStage[];
  activeIndex: number;
  worn: GearPieces;
  onSelect: (stage: GearStage, track: GearTrack, pick: GearPick) => void;
}> = ({ stages, activeIndex, worn, onSelect }) => {
  const rows = buildProgressionRows(stages);
  const [highlightedDependency, setHighlightedDependency] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <div
        className="grid"
        style={{ gridTemplateColumns: `max-content repeat(${stages.length}, minmax(3.5rem, auto))` }}
      >
        {/* Faint bands on every other column, starting from the labels, so an upgrade reads straight down. */}
        {stages.map(
          (stage, index) =>
            index % 2 === 1 && (
              <span
                key={stage.tier}
                aria-hidden="true"
                className={overviewBand}
                style={{ gridColumn: index + 2, gridRow: `1 / span ${rows.length + 1}` }}
              />
            )
        )}
        <div
          aria-hidden="true"
          className="col-span-full grid grid-cols-subgrid border-b border-border"
          style={{ gridRow: 1 }}
        >
          <span className={cn(overviewLabelBand, 'sticky left-0 z-20 px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase')}>
            Upgrade
          </span>
          {stages.map((stage, index) => (
            <span
              key={stage.tier}
              className={cn(
                'flex min-w-6 items-center justify-center self-center justify-self-center rounded-sm px-1 py-0.5 text-xs font-semibold tabular-nums',
                index === activeIndex && 'bg-primary text-primary-foreground'
              )}
              style={{ gridColumn: index + 2 }}
              data-gear-upgrade={index + 1}
            >
              {index + 1}
            </span>
          ))}
        </div>
        {rows.map(({ id, label, slot, steps }, rowIndex) => (
          <div
            key={id}
            className="col-span-full grid grid-cols-subgrid border-b border-border last:border-b-0"
            style={{ gridRow: rowIndex + 2 }}
            data-gear-progression-row={id}
          >
            <span className={cn(overviewLabelBand, 'sticky left-0 z-20 flex items-center px-3 text-sm font-semibold whitespace-nowrap')}>
              {label}
            </span>
            <ol
              aria-label={`${label} upgrades`}
              className="grid grid-cols-subgrid py-2"
              style={{ gridColumn: '2 / -1' }}
            >
              {steps.map((step) => (
                <li
                  key={step.upgrade}
                  className="flex w-full flex-wrap items-center justify-center gap-1 self-center"
                  style={{ gridColumn: step.upgrade, gridRow: 1 }}
                  data-gear-upgrade-cell={step.upgrade}
                >
                  {step.options.map((option, optionIndex) => (
                    <React.Fragment key={option.piece.config}>
                      {optionIndex > 0 && (
                        <span
                          className="max-w-full text-center text-[0.7rem] leading-4 font-semibold text-muted-foreground"
                          style={{ flexBasis: orFlexBasis(step.options.length) }}
                        >
                          OR
                        </span>
                      )}
                      <UpgradeOverviewItem
                        option={option}
                        step={step}
                        worn={worn[slot]?.config === option.piece.config}
                        isDependency={highlightedDependency === option.piece.name}
                        onHighlightDependency={setHighlightedDependency}
                        onSelect={onSelect}
                      />
                    </React.Fragment>
                  ))}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GearRecommendations: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPicks, setSelectedPicks] = useState<Record<string, string>>({});

  const style = parseGearStyle(searchParams.get('style'));
  const styleData = gearByStyle[style];
  const hasDifferentGear = !gearCategoriesMatch(styleData.training, styleData.pvm);
  const mode: GearMode = searchParams.get('mode') === 'pvm' ? 'pvm' : 'training';
  const ironmanOnly = searchParams.get('ironman') === '1';
  const tierParam = Number.parseFloat(searchParams.get('tier') ?? '');

  const stages = useMemo(
    () => buildGearStages(style, styleData[mode], { ironmanOnly }),
    [style, styleData, mode, ironmanOnly]
  );
  const stageIndex = findStageIndex(stages, Number.isNaN(tierParam) ? null : tierParam);
  const stage = stages[stageIndex];

  // Keeps every other option, so switching style only changes the gear shown.
  const styleSearch = (id: CombatStyle) => {
    const next = new URLSearchParams(searchParams);
    if (id === DEFAULT_GEAR_STYLE) next.delete('style');
    else next.set('style', id);
    return next.toString();
  };

  const updateParams = (changes: Record<string, string | null>) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value === null) next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  };
  const selectTier = (tier: number) => updateParams({ tier: String(tier) });

  const selectedPick = (track: GearTrack, from: GearStage) => {
    const picks = from[track];
    const name = selectedPicks[`${style}:${track}:${mode}:${from.tier}`];
    return picks.find((pick) => pick.name === name) ?? picks[0];
  };
  const selectPick = (track: GearTrack, from: GearStage, pick: GearPick) =>
    setSelectedPicks((current) => ({
      ...current,
      [`${style}:${track}:${mode}:${from.tier}`]: pick.name,
    }));

  const selectFromOverview = (from: GearStage, track: GearTrack, pick: GearPick) => {
    selectPick(track, from, pick);
    selectTier(from.tier);
  };

  const worn = wornGear(stages, stageIndex, selectedPick);

  return (
    <div
      className="grid max-w-[68rem] grid-cols-[minmax(0,1fr)] gap-6 pb-8 min-[1400px]:max-w-[84rem] min-[1400px]:grid-cols-[minmax(0,1fr)_auto] min-[1400px]:gap-x-8"
      data-gear-progression
    >
      <PlayerSearch />

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        {hasDifferentGear ? (
          <div role="group" aria-label="Gear purpose" className="flex flex-wrap gap-1.5">
            {(['pvm', 'training'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => updateParams({ mode: option === 'pvm' ? 'pvm' : null })}
                className={cn(
                  'min-h-11 rounded-sm border px-3 text-sm font-medium transition-colors motion-reduce:transition-none',
                  mode === option
                    ? 'border-primary bg-primary/15 font-semibold text-foreground'
                    : 'border-border hover:bg-accent',
                  focusRing
                )}
              >
                {gearModeLabels[style][option]}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Training and PvM use the same upgrades for this style.
          </p>
        )}
        <div className="flex min-h-11 items-center gap-2.5">
          <Switch
            id="gear-ironman-only"
            checked={ironmanOnly}
            onCheckedChange={(checked) => updateParams({ ironman: checked ? '1' : null })}
          />
          <Label htmlFor="gear-ironman-only" className="text-sm">
            Ironman-friendly only
          </Label>
        </div>
      </div>

      <StageRail stages={stages} activeIndex={stageIndex} onSelectTier={selectTier} />

      <nav aria-label="Combat style">
        <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {gearStyles.map((item) => {
            const active = item.id === style;
            return (
              <li key={item.id}>
                <Link
                  to={{ search: styleSearch(item.id) }}
                  replace
                  preventScrollReset
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-11 items-center justify-center rounded-sm border text-sm font-semibold no-underline transition-colors motion-reduce:transition-none',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-accent',
                    focusRing
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sits where a guide's "On this page" column normally goes. */}
      <section
        aria-labelledby="gear-stage-heading"
        className="min-[1400px]:sticky min-[1400px]:top-24 min-[1400px]:col-start-2 min-[1400px]:row-span-5 min-[1400px]:row-start-1 min-[1400px]:self-start min-[1400px]:border-l min-[1400px]:pl-6"
        data-gear-stage={stage.tier}
      >
        <h2 id="gear-stage-heading" aria-live="polite" className="sr-only">
          Upgrade {stageIndex + 1} of {stages.length}
        </h2>
        <PaperDoll
          worn={worn}
          upgraded={upgradedSlots(stages, stageIndex, selectedPick)}
          upgrade={stageIndex + 1}
        />
      </section>

      <section aria-label="Full Upgrade Order">
        <UpgradeOverview
          stages={stages}
          activeIndex={stageIndex}
          worn={worn}
          onSelect={selectFromOverview}
        />
      </section>
    </div>
  );
};
