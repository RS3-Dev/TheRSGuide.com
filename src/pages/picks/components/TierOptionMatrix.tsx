import { Ban, Check, CircleCheck, Crown } from 'lucide-react'
import { Fragment, useState, type ReactElement } from 'react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type TierOptionMatrixVariant = 'blessing' | 'relic'

export type TierOptionMatrixTier = {
  isSelected?: boolean
  isSpecial?: boolean
  tier: number
}

export type TierOptionMatrixCell = {
  ariaLabel: string
  backgroundColor?: string
  description: string
  detailsAriaLabel?: string
  fallback: string
  id: string
  image?: string
  isBlocked?: boolean
  isSelected: boolean
  label: string
  onViewDetails?: () => void
  onBlockToggle?: () => void
  onSelect?: () => void
  readOnly?: boolean
  relicState?: 'rejuvenated-available' | 'rejuvenated-selected'
  statusLabel?: string
}

export type TierOptionMatrixRow = {
  cells: Array<TierOptionMatrixCell | null>
  id: string
}

type TierOptionMatrixProps = {
  ariaLabel: string
  className?: string
  rows: TierOptionMatrixRow[]
  tiers: TierOptionMatrixTier[]
  variant: TierOptionMatrixVariant
}

function MatrixCell({
  cell,
  isSpecial,
  isLastRow,
  variant,
}: {
  cell: TierOptionMatrixCell
  isSpecial: boolean
  isLastRow: boolean
  variant: TierOptionMatrixVariant
}) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const isBlessing = variant === 'blessing'
  const isInteractive =
    !cell.isBlocked && !cell.readOnly && Boolean(cell.onSelect)
  const optionAriaLabel = `${cell.ariaLabel}${
    cell.isBlocked ? ', blocked from randomizer' : ''
  }`
  const cellStyle = isBlessing
    ? { backgroundColor: cell.backgroundColor }
    : undefined
  const cellClassName = cn(
    'group relative flex w-full touch-manipulation select-none flex-col items-center',
    cell.onViewDetails
      ? 'min-h-28 flex-1 justify-end gap-0.5 px-2 pt-2 pb-1'
      : 'h-full min-h-36 justify-center gap-2 px-2 py-3',
    isBlessing && 'text-white',
    isBlessing &&
      !isInteractive &&
      'focus-visible:z-20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
    isBlessing &&
      isInteractive &&
      'focus-visible:z-20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
    !isBlessing &&
      'transition-colors duration-150 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
    !isBlessing &&
      !cell.relicState &&
      (cell.isSelected
        ? 'bg-transparent text-primary-foreground'
        : 'bg-transparent text-muted-foreground group-hover/tile:text-accent-foreground! group-focus-within/tile:text-accent-foreground! group-active/tile:text-accent-foreground!'),
    !isBlessing && cell.relicState && 'bg-transparent text-current',
    cell.isBlocked && 'cursor-not-allowed',
  )
  const contentOpacityClassName = cell.isBlocked
    ? 'opacity-30'
    : isBlessing && !cell.isSelected
      ? 'opacity-25 group-hover/tile:opacity-60! group-focus-within/tile:opacity-60!'
      : 'opacity-100'

  const content = (
    <>
      {cell.isSelected && (
        <Check
          aria-hidden
          className={cn(
            'absolute top-2 right-2',
            isBlessing ? 'size-2.5' : 'size-3',
          )}
        />
      )}
      {cell.isBlocked && (
        <Ban
          aria-hidden
          className="absolute top-2 right-2 size-4 text-foreground"
        />
      )}
      <span className={cn('flex w-full items-center justify-center', 'h-20')}>
        {cell.image ? (
          <img
            alt=""
            aria-hidden
            className={cn(
              'w-auto max-w-full object-contain transition-opacity',
              'h-20',
              !cell.isSelected &&
                !cell.relicState &&
                (isBlessing
                  ? 'opacity-40 group-hover/tile:opacity-75! group-focus-within/tile:opacity-75!'
                  : 'opacity-65 group-hover/tile:opacity-100! group-focus-within/tile:opacity-100! group-active/tile:opacity-100!'),
            )}
            draggable={false}
            height={100}
            src={cell.image}
            width={100}
          />
        ) : (
          <span
            className={cn(
              'font-black leading-none transition-opacity',
              isBlessing ? 'text-2xl' : 'text-2xl',
              contentOpacityClassName,
            )}
          >
            {cell.fallback}
          </span>
        )}
      </span>
      <span
        className={cn(
          'flex items-center justify-center text-center font-black uppercase transition-opacity',
          isBlessing
            ? 'h-8 px-1 text-[9px] leading-[1.1] tracking-[0.04em] md:h-auto md:min-h-5 md:leading-tight'
            : 'h-8 text-[9px] leading-[1.1] tracking-[0.1em] md:h-auto md:min-h-5 md:leading-tight',
          isBlessing
            ? contentOpacityClassName
            : cell.relicState
              ? 'text-current/75'
              : cell.isSelected
                ? 'text-primary-foreground/70'
                : 'text-muted-foreground group-hover/tile:text-accent-foreground/70! group-focus-within/tile:text-accent-foreground/70! group-active/tile:text-accent-foreground/70!',
        )}
      >
        <span className="line-clamp-2">{cell.statusLabel ?? cell.label}</span>
      </span>
    </>
  )

  let trigger: ReactElement
  if (isInteractive) {
    trigger = (
      <button
        aria-label={optionAriaLabel}
        aria-disabled={cell.isBlocked || undefined}
        aria-pressed={cell.isSelected}
        className={cellClassName}
        onClick={cell.onSelect}
        type="button"
      >
        {content}
      </button>
    )
  } else {
    trigger = (
      <div
        aria-label={optionAriaLabel}
        aria-disabled={cell.isBlocked || undefined}
        className={cellClassName}
        tabIndex={0}
      >
        {content}
      </div>
    )
  }

  const tile = (
    <div
      className={cn(
        'group/tile relative flex flex-col border-r border-b border-border transition-[background-color,filter,color] duration-150',
        cell.isBlocked && 'randomizer-option-blocked',
        isSpecial && 'border-x-2 border-x-primary/70',
        isBlessing &&
          isInteractive &&
          'hover:brightness-125! focus-within:brightness-125!',
        !isBlessing && !cell.relicState && cell.isSelected && 'bg-primary',
        !isBlessing &&
          !cell.relicState &&
          !cell.isSelected &&
          !cell.isBlocked &&
          'bg-card/60 hover:bg-accent! focus-within:bg-accent! active:bg-accent!',
        cell.relicState === 'rejuvenated-available' &&
          'relic-rejuvenated-available',
        cell.relicState === 'rejuvenated-selected' &&
          'relic-rejuvenated-selected',
        isBlessing &&
          cell.isSelected &&
          'z-10 outline-2 -outline-offset-2 outline-primary',
      )}
      style={cellStyle}
    >
      <Tooltip open={isTooltipOpen}>
        <TooltipTrigger
          asChild
          onBlur={() => setIsTooltipOpen(false)}
          onFocus={(event) => {
            if (event.currentTarget.matches(':focus-visible')) {
              setIsTooltipOpen(true)
            }
          }}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') {
              setIsTooltipOpen(true)
            }
          }}
          onPointerLeave={() => setIsTooltipOpen(false)}
        >
          {trigger}
        </TooltipTrigger>
        <TooltipContent
          className="w-56 items-start border border-border bg-popover p-4 text-left shadow-xl ring-0"
          side={isLastRow ? 'bottom' : 'top'}
          sideOffset={10}
        >
          <div className="flex w-full flex-col gap-2">
            <p className="font-display text-base font-semibold text-popover-foreground">
              {cell.label}
            </p>
            <p className="border-t pt-2 text-xs leading-5 text-muted-foreground">
              {cell.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
      {cell.onViewDetails && (
        <button
          aria-label={
            cell.detailsAriaLabel ??
            `View details for ${cell.statusLabel ?? cell.label}`
          }
          className={cn(
            'mx-2 mb-2 flex h-9 items-center justify-center rounded-md border border-primary/70 bg-card/80 px-3 text-[10px] font-bold uppercase leading-none tracking-[0.1em] text-card-foreground shadow-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
            !cell.isBlocked &&
              'group-hover/tile:bg-transparent! group-hover/tile:text-current! group-focus-within/tile:bg-transparent! group-focus-within/tile:text-current!',
          )}
          onClick={(event) => {
            event.currentTarget.blur()
            cell.onViewDetails?.()
          }}
          type="button"
        >
          Details
        </button>
      )}
    </div>
  )

  if (!cell.onBlockToggle) return tile

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (open) setIsTooltipOpen(false)
      }}
    >
      <ContextMenuTrigger asChild>{tile}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem onSelect={cell.onBlockToggle}>
            {cell.isBlocked ? <CircleCheck /> : <Ban />}
            {cell.isBlocked ? 'Allow in randomizer' : 'Block from randomizer'}
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function TierHeader({
  frameSpecial = true,
  mobileRail = false,
  tier: { isSelected, isSpecial, tier },
  variant,
}: {
  frameSpecial?: boolean
  mobileRail?: boolean
  tier: TierOptionMatrixTier
  variant: TierOptionMatrixVariant
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-16 flex-col items-center justify-center border-r border-b border-border pt-2 pb-1 text-muted-foreground',
        variant === 'relic' && isSelected && 'bg-primary/[0.08] text-primary',
        isSpecial && 'bg-primary/[0.08] text-primary',
        isSpecial && frameSpecial && 'border-x-2 border-x-primary/70',
      )}
    >
      {mobileRail ? (
        <span className="rotate-180 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.18em] [writing-mode:vertical-rl]">
          {isSpecial ? `God Tier ${tier}` : `Tier ${tier}`}
        </span>
      ) : (
        <>
          {isSpecial && <Crown aria-hidden className="mb-0.5 size-3" />}
          <span className="text-xl font-black leading-none">{tier}</span>
          <span className="mt-1 text-[7px] font-black uppercase tracking-[0.12em]">
            {isSpecial ? 'God Tier' : 'Tier'}
          </span>
        </>
      )}
    </div>
  )
}

export function TierOptionMatrix({
  ariaLabel,
  className,
  rows,
  tiers,
  variant,
}: TierOptionMatrixProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn('mt-4 pb-1 md:overflow-x-auto', className)}
    >
      <div className="border-t border-l border-border bg-card/20 md:hidden">
        {tiers.map((tier, tierIndex) => (
          <section
            className={cn(
              'grid',
              tier.isSpecial &&
                'relative z-10 outline-2 -outline-offset-2 outline-primary/70',
            )}
            key={tier.tier}
            style={{
              gridTemplateColumns: `2.5rem repeat(${rows.filter((row) => row.cells[tierIndex]).length}, minmax(0, 1fr))`,
            }}
          >
            <TierHeader
              frameSpecial={false}
              mobileRail
              tier={tier}
              variant={variant}
            />
            {rows.flatMap((row) => {
              const cell = row.cells[tierIndex]
              return cell
                ? [
                    <MatrixCell
                      cell={cell}
                      isLastRow={false}
                      isSpecial={false}
                      key={row.id}
                      variant={variant}
                    />,
                  ]
                : []
            })}
          </section>
        ))}
      </div>

      <div
        className="hidden min-w-[54rem] border-t border-l border-border bg-card/20 md:grid"
        style={{
          gridTemplateColumns: `repeat(${tiers.length}, minmax(6.75rem, 1fr))`,
        }}
      >
        {tiers.map((tier) => (
          <TierHeader key={tier.tier} tier={tier} variant={variant} />
        ))}

        {rows.map((row, rowIndex) => (
          <Fragment key={row.id}>
            {row.cells.map((cell, tierIndex) =>
              cell ? (
                <MatrixCell
                  cell={cell}
                  isLastRow={rowIndex === rows.length - 1}
                  isSpecial={Boolean(tiers[tierIndex]?.isSpecial)}
                  key={cell.id}
                  variant={variant}
                />
              ) : (
                <div
                  aria-hidden
                  className="border-r border-b border-border bg-muted/25"
                  key={`empty-${tiers[tierIndex]?.tier}`}
                />
              ),
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
