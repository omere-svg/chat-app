import { PreviousEmailsCard } from './PreviousEmailsCard.tsx'
import { PreviousEmailsBodyContainer } from './components/PreviousEmailsBody/PreviousEmailsBodyContainer.tsx'
import { PreviousEmailsProvider } from './context/usePreviousEmailsContext.tsx'

export function PreviousEmailsCardContainer(): React.ReactElement {
  return (
    <PreviousEmailsProvider>
      <PreviousEmailsCard>
        <PreviousEmailsBodyContainer />
      </PreviousEmailsCard>
    </PreviousEmailsProvider>
  )
}
