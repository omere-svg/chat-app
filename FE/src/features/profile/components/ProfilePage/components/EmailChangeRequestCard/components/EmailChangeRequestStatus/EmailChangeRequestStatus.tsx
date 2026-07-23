import { FormStatusMessage } from '../../../FormStatusMessage/FormStatusMessage.tsx'
import { useEmailChangeRequestContext } from '../../context/useEmailChangeRequestContext.tsx'

export function EmailChangeRequestStatus(): React.ReactElement | null {
  const { statusView } = useEmailChangeRequestContext()

  if (!statusView) {
    return null
  }

  return <FormStatusMessage {...statusView} />
}
