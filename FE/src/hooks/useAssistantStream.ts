import { useEffect, useRef } from "react";
import type { Dispatch, RefObject } from "react";
import { apiClient, ApiError } from "../api/apiClient.ts";
import type {
  MessagesAction,
  MessagesState,
} from "../features/messages/messageReducer.ts";
import type { PendingMessage } from "../types/domain.ts";

// Drives the assistant streaming exchange against the same reducer used by the
// human-send flow: optimistic user bubble -> SSE stream -> persisted reply.
export function useAssistantStream(
  conversationId: string | null,
  currentUserId: string,
  onSendError: (errorMessage: string) => void,
  onSendSuccess: (() => void) | undefined,
  state: MessagesState,
  dispatch: Dispatch<MessagesAction>,
  activeConversationIdRef: RefObject<string | null>,
): {
  sendMessage: (messageContent: string) => Promise<boolean>;
  isStreaming: boolean;
} {
  const onSendErrorRef = useRef(onSendError);
  const onSendSuccessRef = useRef(onSendSuccess);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    onSendErrorRef.current = onSendError;
    onSendSuccessRef.current = onSendSuccess;
  }, [onSendError, onSendSuccess]);

  // Cancel any in-flight stream when the conversation changes or the view unmounts.
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [conversationId]);

  async function sendMessage(messageContent: string): Promise<boolean> {
    if (!conversationId || !messageContent.trim()) {
      return false;
    }

    const targetConversationId = conversationId;
    const trimmedBody = messageContent.trim();
    const clientMessageId = `client-${crypto.randomUUID()}`;
    const placeholderMessageId = `assistant-${crypto.randomUUID()}`;
    const startedAt = new Date().toISOString();

    const optimisticUserMessage: PendingMessage = {
      id: clientMessageId,
      clientMessageId,
      conversationId: targetConversationId,
      senderId: currentUserId,
      body: trimmedBody,
      createdAt: startedAt,
    };

    dispatch({ type: "OPTIMISTIC_ADD", message: optimisticUserMessage });
    dispatch({
      type: "STREAM_START",
      placeholderMessageId,
      conversationId: targetConversationId,
      createdAt: startedAt,
    });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const isStale = (): boolean =>
      activeConversationIdRef.current !== targetConversationId;

    let userMessageConfirmed = false;

    // Rolls back the optimistic user bubble (a no-op once it's been confirmed) and
    // clears the streaming reply. Used for both pre-stream and in-stream failures.
    const handleFailure = (errorMessage: string): void => {
      if (isStale()) {
        return;
      }
      dispatch({ type: "OPTIMISTIC_ROLLBACK", clientMessageId });
      dispatch({ type: "STREAM_ERROR" });
      onSendErrorRef.current(errorMessage);
    };

    try {
      await apiClient.streamAssistantMessage(
        targetConversationId,
        { body: trimmedBody, clientMessageId },
        {
          signal: abortController.signal,
          onUserMessage: (message) => {
            if (isStale()) return;
            userMessageConfirmed = true;
            dispatch({ type: "OPTIMISTIC_CONFIRM", clientMessageId, message });
          },
          onToken: (text) => {
            if (!isStale()) dispatch({ type: "STREAM_TOKEN", text });
          },
          onTool: (name) => {
            if (!isStale()) dispatch({ type: "STREAM_TOOL", name });
          },
          onCitations: (citations) => {
            if (!isStale()) dispatch({ type: "STREAM_CITATIONS", citations });
          },
          onDone: (message) => {
            if (isStale()) return;
            dispatch({ type: "STREAM_DONE", message });
            onSendSuccessRef.current?.();
          },
          onError: (errorPayload) => handleFailure(errorPayload.message),
        },
      );
      // The user message was delivered even if the assistant reply later errored;
      // the composer should clear in that case (the failure surfaced via toast).
      return userMessageConfirmed;
    } catch (error) {
      if (abortController.signal.aborted) {
        if (!isStale()) {
          dispatch({ type: "STREAM_ERROR" });
        }
        return false;
      }
      handleFailure(
        error instanceof ApiError ? error.message : "Failed to reach the assistant",
      );
      return userMessageConfirmed;
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }

  return { sendMessage, isStreaming: state.streaming !== null };
}
