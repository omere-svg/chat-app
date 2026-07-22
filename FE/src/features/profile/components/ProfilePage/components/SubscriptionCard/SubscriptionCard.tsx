import type { FormEvent } from 'react'
import { Button } from '@/shared/components/Button/Button.tsx'
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useSubscriptionContext } from '@/features/subscription/context/useSubscriptionContext.tsx'
import { ProfileCard } from '../ProfileCard/ProfileCard.tsx'
import { SubscriptionCardBody } from './components/SubscriptionCardBody/SubscriptionCardBody.tsx'
import {
  SUBSCRIPTION_CARD_HEADING_ID,
  SUBSCRIPTION_CARD_TEXT,
} from './SubscriptionCard.constants.ts'
import './SubscriptionCard.css'

export function SubscriptionCard(): React.ReactElement {
  const { proPlan, isActive, isLoading, upgrade, isUpgrading, upgradeError } =
    useSubscriptionContext()

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (isActive || isUpgrading || proPlan === null) {
      return
    }
    upgrade()
  }

  const actionLabel = isActive
    ? SUBSCRIPTION_CARD_TEXT.activeAction
    : isUpgrading
      ? SUBSCRIPTION_CARD_TEXT.upgradingAction
      : SUBSCRIPTION_CARD_TEXT.upgradeAction

  const isActionDisabled = isActive || isLoading || isUpgrading || proPlan === null

  return (
    <ProfileCard
      title={SUBSCRIPTION_CARD_TEXT.title}
      headingId={SUBSCRIPTION_CARD_HEADING_ID}
      onSubmit={handleSubmit}
      actions={
        <Button type="submit" variant="primary" disabled={isActionDisabled}>
          {actionLabel}
        </Button>
      }
    >
      <SubscriptionCardBody />
      {upgradeError === null ? null : <ErrorBanner message={upgradeError} />}
    </ProfileCard>
  )
}
