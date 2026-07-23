import { FormStatusMessage } from '../../../FormStatusMessage/FormStatusMessage.tsx'
import { useProfileNameContext } from '../../context/useProfileNameContext.tsx'

export function NameStatus(): React.ReactElement | null {
  const { statusView } = useProfileNameContext()

  if (statusView === null) {
    return null
  }

  return <FormStatusMessage {...statusView} />
}
