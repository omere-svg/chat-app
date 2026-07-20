import { FormStatusMessage } from '../../../FormStatusMessage/FormStatusMessage.tsx'
import { toFormStatusView } from '../../../FormStatusMessage/FormStatusMessage.utils.ts'
import { useEmailChangeRequestContext } from '../../context/useEmailChangeRequestContext.tsx'

export function EmailChangeRequestStatus(): React.ReactElement | null {
  const { status } = useEmailChangeRequestContext()

  if (!status) {
    return null
  }

  return <FormStatusMessage {...toFormStatusView(status)} />
}
