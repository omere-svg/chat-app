import { createContext, useContext } from 'react'
import { useProfileAvatar } from '../hooks/useProfileAvatar.ts'
import type {
  ProfileAvatarProviderProps,
  UseProfileAvatarValue,
} from '../AvatarCard.types.ts'

const ProfileAvatarContext = createContext<UseProfileAvatarValue | null>(null)

export function ProfileAvatarProvider({
  children,
}: ProfileAvatarProviderProps): React.ReactElement {
  const value = useProfileAvatar()

  return (
    <ProfileAvatarContext.Provider value={value}>
      {children}
    </ProfileAvatarContext.Provider>
  )
}

export function useProfileAvatarContext(): UseProfileAvatarValue {
  const context = useContext(ProfileAvatarContext)
  if (context === null) {
    throw new Error(
      'useProfileAvatarContext must be used within a ProfileAvatarProvider',
    )
  }
  return context
}
