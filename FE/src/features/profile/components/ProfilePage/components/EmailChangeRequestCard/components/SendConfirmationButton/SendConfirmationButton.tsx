import { Button } from '@/shared/components/Button/Button.tsx'
import { useEmailChangeRequestContext } from '../../context/useEmailChangeRequestContext.tsx'

export function SendConfirmationButton(): React.ReactElement {
  const { canSubmit, isSaving, submitLabel } = useEmailChangeRequestContext()

  const isDisabled = !canSubmit || isSaving

  return (
    <Button type="submit" variant="primary" disabled={isDisabled}>
      {submitLabel}
    </Button>
  )
}
