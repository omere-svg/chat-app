import { Link } from 'react-router-dom'
import { PROFILE_ROUTE } from '@/app/constants/routes.ts'
import {
  SUBSCRIPTION_CALLBACK_CLASS,
  SUBSCRIPTION_CALLBACK_TEXT,
} from '../../SubscriptionCallbackScreen.constants.ts'

export function CallbackSuccess(): React.ReactElement {
  return (
    <>
      <p className={SUBSCRIPTION_CALLBACK_CLASS.message} role="status">
        {SUBSCRIPTION_CALLBACK_TEXT.success}
      </p>
      <Link className={SUBSCRIPTION_CALLBACK_CLASS.link} to={PROFILE_ROUTE}>
        {SUBSCRIPTION_CALLBACK_TEXT.backToProfile}
      </Link>
    </>
  )
}
