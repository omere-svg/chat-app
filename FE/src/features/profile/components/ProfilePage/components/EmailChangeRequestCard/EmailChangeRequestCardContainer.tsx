import { EmailChangeRequestCard } from './EmailChangeRequestCard.tsx'
import { EmailChangeRequestProvider } from './context/useEmailChangeRequestContext.tsx'

export function EmailChangeRequestCardContainer(): React.ReactElement {
  return (
    <EmailChangeRequestProvider>
      <EmailChangeRequestCard />
    </EmailChangeRequestProvider>
  )
}
