import { createContext, useContext } from 'react'
import { useProfileName } from '../hooks/useProfileName.ts'
import type {
  ProfileNameProviderProps,
  UseProfileNameValue,
} from '../NameCard.types.ts'

const ProfileNameContext = createContext<UseProfileNameValue | null>(null)

export function ProfileNameProvider({
  children,
}: ProfileNameProviderProps): React.ReactElement {
  const value = useProfileName()

  return (
    <ProfileNameContext.Provider value={value}>
      {children}
    </ProfileNameContext.Provider>
  )
}

export function useProfileNameContext(): UseProfileNameValue {
  const context = useContext(ProfileNameContext)
  if (context === null) {
    throw new Error('useProfileNameContext must be used within a ProfileNameProvider')
  }
  return context
}
