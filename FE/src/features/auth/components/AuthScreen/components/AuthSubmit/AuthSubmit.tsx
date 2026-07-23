import { Button } from '@/shared/components/Button/Button.tsx'
import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'

export function AuthSubmit(): React.ReactElement {
  const { submitLabel, isSubmitDisabled } = useAuthScreenContext()

  return (
    <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
      {submitLabel}
    </Button>
  )
}
