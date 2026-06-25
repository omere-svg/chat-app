import { useEffect, useMemo, useReducer, useRef } from "react";
import type { Dispatch, RefObject } from "react";
import { MESSAGE_PAGE_LIMIT } from "../api/constants.ts";
import { apiClient, ApiError } from "../api/apiClient.ts";
import {
  deriveThreadViewState,
  type ThreadViewState,
} from "../features/messages/deriveThreadViewState.ts";
import {
  initialMessagesState,
  mergeThreadMessages,
  messageReducer,
  type MessagesAction,
  type MessagesState,
} from "../features/messages/messageReducer.ts";
import type { ThreadMessage } from "../types/domain.ts";

export function useMessageThread(conversationId: string | null): {
  state: MessagesState;
  dispatch: Dispatch<MessagesAction>;
  activeConversationIdRef: RefObject<string | null>;
  threadState: ThreadViewState;
  threadMessages: ThreadMessage[];
  refetchMessages: () => void;
} {
  const [state, dispatch] = useReducer(messageReducer, initialMessagesState);
  const activeConversationIdRef = useRef(conversationId);

  useEffect(() => {
    activeConversationIdRef.current = conversationId;
  }, [conversationId]);

  async function loadInitialMessages(
    targetConversationId: string,
    isCancelled: () => boolean,
  ): Promise<void> {
    dispatch({ type: "FETCH_START" });
    try {
      const { messages, nextCursor } = await apiClient.getMessages(
        targetConversationId,
        { limit: MESSAGE_PAGE_LIMIT },
      );
      if (isCancelled()) {
        return;
      }
      if (activeConversationIdRef.current !== targetConversationId) {
        return;
      }
      dispatch({
        type: "FETCH_SUCCESS",
        messages,
        nextCursor,
      });
    } catch (err) {
      if (isCancelled()) {
        return;
      }
      if (activeConversationIdRef.current !== targetConversationId) {
        return;
      }
      const errorMessage =
        err instanceof ApiError ? err.message : "Failed to load messages";
      dispatch({ type: "FETCH_ERROR", error: errorMessage });
    }
  }

  useEffect(() => {
    if (!conversationId) {
      dispatch({ type: "RESET" });
      return;
    }

    let cancelled = false;
    dispatch({ type: "RESET" });
    void loadInitialMessages(conversationId, () => cancelled);

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  function refetchMessages(): void {
    if (!conversationId) {
      return;
    }
    void loadInitialMessages(conversationId, () => false);
  }

  const threadMessages = useMemo(
    () => mergeThreadMessages(state.messages, state.pending, state.streaming),
    [state.messages, state.pending, state.streaming],
  );
  const threadState = deriveThreadViewState(
    conversationId,
    state,
    threadMessages,
  );

  return {
    state,
    dispatch,
    activeConversationIdRef,
    threadState,
    threadMessages,
    refetchMessages,
  };
}
