import { Button } from '@/shared/components/Button/Button.tsx'
import { useForgotPasswordContext } from '../../../../context/useForgotPasswordContext.tsx'

export function ForgotPasswordSubmit(): React.ReactElement {
  const { submitLabel, isSubmitDisabled } = useForgotPasswordContext()

  return (
    <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
      {submitLabel}
    </Button>
  )
}
