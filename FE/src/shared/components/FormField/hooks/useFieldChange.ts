import type { ChangeEvent } from 'react'
import type { UseFieldChangeParams } from '../FormField.types.ts'

export function useFieldChange({
  onValueChange,
}: UseFieldChangeParams): (event: ChangeEvent<HTMLInputElement>) => void {
  return (event) => {
    onValueChange(event.target.value)
  }
}
