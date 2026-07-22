import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { useMessageBubbleContext } from '../../context/useMessageBubbleContext.tsx'

export function MessageBubbleAvatar(): React.ReactElement {
  const { senderName, avatarUrl } = useMessageBubbleContext()

  return <UserAvatarContainer name={senderName} imageUrl={avatarUrl} size="sm" />
}
