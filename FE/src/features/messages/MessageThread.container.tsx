import { useState } from "react";
import { getThreadScrollAnchorId } from "./deriveThreadViewState.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { useAutoScroll } from "../../hooks/useAutoScroll.ts";
import { useMessages } from "../../hooks/useMessages.ts";
import { useToast } from "../../hooks/useToast.ts";
import type { ConversationPreview } from "../../types/domain.ts";
import { MessageThread } from "./MessageThread.tsx";

type MessageThreadContainerProps = {
  selectedConversationId: string | null;
  conversations: ConversationPreview[];
  onMessageSendSuccess: () => void;
};

export function MessageThreadContainer({
  selectedConversationId,
  conversations,
  onMessageSendSuccess,
}: MessageThreadContainerProps): React.ReactElement {
  const { currentUser } = useAuth();
  const { showErrorToast } = useToast();
  const [messageDraft, setMessageDraft] = useState("");

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );

  const {
    threadState,
    threadMessages,
    hasMoreOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessagesError,
    loadOlderMessages,
    sendMessage,
    isSendingMessage,
    refetchMessages,
  } = useMessages(
    selectedConversationId,
    currentUser?.id ?? "",
    showErrorToast,
    onMessageSendSuccess,
    selectedConversation?.type ?? "direct",
  );

  const threadScrollAnchorId = getThreadScrollAnchorId(threadMessages);
  const messagesScrollContainerRef =
    useAutoScroll<HTMLDivElement>(threadScrollAnchorId);

  function handleSendMessage(): void {
    const messageContent = messageDraft.trim();

    if (!messageContent || isSendingMessage) {
      return;
    }

    void (async (): Promise<void> => {
      const didSend = await sendMessage(messageContent);

      if (didSend) {
        setMessageDraft("");
      }
    })();
  }

  return (
    <MessageThread
      threadState={threadState}
      messages={threadMessages}
      currentUserId={currentUser?.id ?? ""}
      messageDraft={messageDraft}
      onMessageDraftChange={setMessageDraft}
      onSendMessage={handleSendMessage}
      isComposerDisabled={isSendingMessage || !selectedConversationId}
      hasMoreOlderMessages={hasMoreOlderMessages}
      isLoadingOlderMessages={isLoadingOlderMessages}
      loadOlderMessagesError={loadOlderMessagesError}
      onLoadOlderMessages={loadOlderMessages}
      onRetryMessages={refetchMessages}
      conversationTitle={selectedConversation?.title}
      conversationType={selectedConversation?.type ?? 'direct'}
      messagesScrollContainerRef={messagesScrollContainerRef}
    />
  );
}
