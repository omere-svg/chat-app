import {
  SUBSCRIPTION_CALLBACK_CLASS,
  SUBSCRIPTION_CALLBACK_TEXT,
} from './SubscriptionCallbackScreen.constants.ts'
import type { SubscriptionCallbackScreenProps } from './SubscriptionCallbackScreen.types.ts'
import './SubscriptionCallbackScreen.css'

export function SubscriptionCallbackScreen({
  children,
}: SubscriptionCallbackScreenProps): React.ReactElement {
  return (
    <main className={SUBSCRIPTION_CALLBACK_CLASS.screen}>
      <section className={SUBSCRIPTION_CALLBACK_CLASS.card}>
        <h1 className={SUBSCRIPTION_CALLBACK_CLASS.heading}>
          {SUBSCRIPTION_CALLBACK_TEXT.heading}
        </h1>
        {children}
      </section>
    </main>
  )
}
