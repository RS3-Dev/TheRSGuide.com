import { Dices } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export type PickerSpinAction = {
  disabled?: boolean
  isSpinning: boolean
  label: string
  onSpin: () => void
}

export function PickerSpinButton({
  disabled,
  isSpinning,
  label,
  onSpin,
}: PickerSpinAction) {
  return (
    <Button
      aria-label={isSpinning ? 'Spinning next choice' : label}
      className="size-10 shrink-0 rounded-md border-primary/50 text-primary hover:bg-accent disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
      disabled={disabled || isSpinning}
      onClick={onSpin}
      size="icon"
      title={label}
      type="button"
      variant="outline"
    >
      {isSpinning ? <Spinner /> : <Dices />}
    </Button>
  )
}
