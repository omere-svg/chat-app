import { Button } from '@/shared/components/Button/Button.tsx'
import { useProfileNameContext } from '../../context/useProfileNameContext.tsx'

export function NameSubmit(): React.ReactElement {
  const { canSave, isSaving, submitLabel } = useProfileNameContext()

  return (
    <Button type="submit" variant="primary" disabled={!canSave || isSaving}>
      {submitLabel}
    </Button>
  )
}
