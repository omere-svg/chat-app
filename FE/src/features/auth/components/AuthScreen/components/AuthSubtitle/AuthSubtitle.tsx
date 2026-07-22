import { AUTH_SCREEN_CLASS } from '../../AuthScreen.constants.ts'
import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'

export function AuthSubtitle(): React.ReactElement {
  const { subtitle } = useAuthScreenContext()

  return <p className={AUTH_SCREEN_CLASS.subtitle}>{subtitle}</p>
}
