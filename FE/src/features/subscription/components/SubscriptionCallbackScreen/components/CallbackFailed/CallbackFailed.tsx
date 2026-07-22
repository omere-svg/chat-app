import { Link } from 'react-router-dom'
import { PROFILE_ROUTE } from '@/app/constants/routes.ts'
import { useSubscriptionCallbackContext } from '../../context/useSubscriptionCallbackContext.tsx'
import {
  SUBSCRIPTION_CALLBACK_CLASS,
  SUBSCRIPTION_CALLBACK_TEXT,
} from '../../SubscriptionCallbackScreen.constants.ts'

export function CallbackFailed(): React.ReactElement {
  const { failureMessage } = useSubscriptionCallbackContext()

  return (
    <>
      <p className={SUBSCRIPTION_CALLBACK_CLASS.message} role="alert">
        {failureMessage}
      </p>
      <Link className={SUBSCRIPTION_CALLBACK_CLASS.link} to={PROFILE_ROUTE}>
        {SUBSCRIPTION_CALLBACK_TEXT.backToProfile}
      </Link>
    </>
  )
}
