import { Button } from '@/shared/components/Button/Button.tsx'
import { useResetPasswordContext } from '../../../../context/useResetPasswordContext.tsx'

export function ResetPasswordSubmit(): React.ReactElement {
  const { submitLabel, isSubmitDisabled } = useResetPasswordContext()

  return (
    <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
      {submitLabel}
    </Button>
  )
}
