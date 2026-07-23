import { AUTH_SCREEN_CLASS } from '../../AuthScreen.constants.ts'
import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'

export function AuthSubtitle(): React.ReactElement {
  const { copy } = useAuthScreenContext()

  return <p className={AUTH_SCREEN_CLASS.subtitle}>{copy.title}</p>
}
