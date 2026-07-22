import { useSubscriptionContext } from '@/features/subscription/context/useSubscriptionContext.tsx'
import { ProfileCard } from '../ProfileCard/ProfileCard.tsx'
import { SubscriptionCardBodyContainer } from './components/SubscriptionCardBody/SubscriptionCardBodyContainer.tsx'
import { SubscriptionUpgradeButton } from './components/SubscriptionUpgradeButton/SubscriptionUpgradeButton.tsx'
import { SubscriptionUpgradeError } from './components/SubscriptionUpgradeError/SubscriptionUpgradeError.tsx'
import {
  SUBSCRIPTION_CARD_HEADING_ID,
  SUBSCRIPTION_CARD_TEXT,
} from './SubscriptionCard.constants.ts'
import './SubscriptionCard.css'

export function SubscriptionCard(): React.ReactElement {
  const { handleSubmit } = useSubscriptionContext()

  return (
    <ProfileCard
      title={SUBSCRIPTION_CARD_TEXT.title}
      headingId={SUBSCRIPTION_CARD_HEADING_ID}
      onSubmit={handleSubmit}
      actions={<SubscriptionUpgradeButton />}
    >
      <SubscriptionCardBodyContainer />
      <SubscriptionUpgradeError />
    </ProfileCard>
  )
}
