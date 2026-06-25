import { type ThreadViewState } from "../features/messages/deriveThreadViewState.ts";
import type { ConversationType, ThreadMessage } from "../types/domain.ts";
import { useAssistantStream } from "./useAssistantStream.ts";
import { useMessageThread } from "./useMessageThread.ts";
import { useOlderMessages } from "./useOlderMessages.ts";
import { useSendMessage } from "./useSendMessage.ts";

export type { ThreadViewState } from "../features/messages/deriveThreadViewState.ts";

export function useMessages(
  conversationId: string | null,
  currentUserId: string,
  onSendError: (errorMessage: string) => void,
  onSendSuccess?: () => void,
  conversationType: ConversationType = "direct",
): {
  threadState: ThreadViewState;
  threadMessages: ThreadMessage[];
  hasMoreOlderMessages: boolean;
  isLoadingOlderMessages: boolean;
  loadOlderMessagesError: string | null;
  loadOlderMessages: () => void;
  sendMessage: (messageContent: string) => Promise<boolean>;
  isSendingMessage: boolean;
  refetchMessages: () => void;
} {
  const {
    state,
    dispatch,
    activeConversationIdRef,
    threadState,
    threadMessages,
    refetchMessages,
  } = useMessageThread(conversationId);

  const {
    loadOlderMessages,
    hasMoreOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessagesError,
  } = useOlderMessages(
    conversationId,
    state,
    dispatch,
    activeConversationIdRef,
  );

  const { sendMessage: sendHumanMessage, isSendingMessage: isSendingHumanMessage } =
    useSendMessage(
      conversationId,
      currentUserId,
      onSendError,
      onSendSuccess,
      state,
      dispatch,
      activeConversationIdRef,
    );

  const { sendMessage: sendAssistantMessage, isStreaming } = useAssistantStream(
    conversationId,
    currentUserId,
    onSendError,
    onSendSuccess,
    state,
    dispatch,
    activeConversationIdRef,
  );

  const isAssistantConversation = conversationType === "assistant";

  return {
    threadState,
    threadMessages,
    hasMoreOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessagesError,
    loadOlderMessages,
    sendMessage: isAssistantConversation ? sendAssistantMessage : sendHumanMessage,
    isSendingMessage: isAssistantConversation
      ? isStreaming || state.pending.length > 0
      : isSendingHumanMessage,
    refetchMessages,
  };
}
