export type MessageMetaProps =
  | { variant: 'pending'; label: string }
  | { variant: 'streaming'; label: string }
  | { variant: 'sent'; label: string; dateTime: string }

export type MessageMetaContainerProps = {
  isPending: boolean
  isStreaming: boolean
  body: string
  createdAt: string
}
