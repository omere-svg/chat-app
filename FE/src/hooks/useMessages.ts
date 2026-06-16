import { type ThreadViewState } from "../features/messages/deriveThreadViewState.ts";
import type { Message, PendingMessage } from "../types/domain.ts";
import { useMessageThread } from "./useMessageThread.ts";
import { useOlderMessages } from "./useOlderMessages.ts";
import { useSendMessage } from "./useSendMessage.ts";

export type { ThreadViewState } from "../features/messages/deriveThreadViewState.ts";

export function useMessages(
  conversationId: string | null,
  currentUserId: string,
  simulateSendFailure: boolean,
  onSendError: (errorMessage: string) => void,
  onSendSuccess?: () => void,
): {
  threadState: ThreadViewState;
  threadMessages: Array<Message | PendingMessage>;
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

  const { sendMessage, isSendingMessage } = useSendMessage(
    conversationId,
    currentUserId,
    simulateSendFailure,
    onSendError,
    onSendSuccess,
    state,
    dispatch,
    activeConversationIdRef,
  );

  return {
    threadState,
    threadMessages,
    hasMoreOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessagesError,
    loadOlderMessages,
    sendMessage,
    isSendingMessage,
    refetchMessages,
  };
}
