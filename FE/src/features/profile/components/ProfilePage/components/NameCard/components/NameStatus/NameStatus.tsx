import { FormStatusMessage } from '../../../FormStatusMessage/FormStatusMessage.tsx'
import { toFormStatusView } from '../../../FormStatusMessage/FormStatusMessage.utils.ts'
import { useProfileNameContext } from '../../context/useProfileNameContext.tsx'

export function NameStatus(): React.ReactElement | null {
  const { status } = useProfileNameContext()

  if (status === null) {
    return null
  }

  return <FormStatusMessage {...toFormStatusView(status)} />
}
