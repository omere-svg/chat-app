import { Button } from '@/shared/components/Button/Button.tsx'
import { useEmailChangeRequestContext } from '../../context/useEmailChangeRequestContext.tsx'
import { SEND_CONFIRMATION_BUTTON_TEXT } from './SendConfirmationButton.constants.ts'

export function SendConfirmationButton(): React.ReactElement {
  const { canSubmit, isSubmitting } = useEmailChangeRequestContext()

  const label = isSubmitting
    ? SEND_CONFIRMATION_BUTTON_TEXT.submitting
    : SEND_CONFIRMATION_BUTTON_TEXT.submit
  const isDisabled = !canSubmit || isSubmitting

  return (
    <Button type="submit" variant="primary" disabled={isDisabled}>
      {label}
    </Button>
  )
}
