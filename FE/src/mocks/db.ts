import type { ApiErrorPayload } from "../types/api.ts";
import {
  MOCK_EMAIL_CHANGE_HISTORY_LIMIT,
  MOCK_EMAIL_CHANGE_TOKEN_PREFIX,
} from "./constants.ts";
import { isValidEmail } from "../shared/validation/isValidEmail.ts";
import { fullName } from "../types/domain.utils.ts";
import type {
  ConversationParticipant,
  ConversationPreview,
  Message,
  User,
} from "../types/domain.ts";
import type {
  EmailChangeTokenPayload,
  MockConfirmEmailChangeOutcome,
  MockRequestEmailChangeOutcome,
} from "./types/emailChange.ts";

type StoredUser = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatarKey: string | null;
  previousEmails: string[];
};

const SHARED_DEMO_PASSWORD = "password123";
const MOCK_AVATAR_CDN_BASE = "https://mock-cdn.local";

function buildSeedUsers(): StoredUser[] {
  return [
    {
      id: "user-alice",
      email: "alice@example.com",
      password: SHARED_DEMO_PASSWORD,
      firstName: "Alice",
      lastName: "Anderson",
      avatarKey: null,
      previousEmails: [],
    },
    {
      id: "user-bob",
      email: "bob@example.com",
      password: SHARED_DEMO_PASSWORD,
      firstName: "Bob",
      lastName: "Brown",
      avatarKey: null,
      previousEmails: [],
    },
    {
      id: "user-carol",
      email: "carol@example.com",
      password: SHARED_DEMO_PASSWORD,
      firstName: "Carol",
      lastName: "Clark",
      avatarKey: null,
      previousEmails: [],
    },
  ];
}

function avatarUrlFor(user: StoredUser): string | null {
  return user.avatarKey === null ? null : `${MOCK_AVATAR_CDN_BASE}/${user.avatarKey}`;
}

export function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: avatarUrlFor(user),
  };
}

function toParticipant(user: StoredUser): ConversationParticipant {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: avatarUrlFor(user),
  };
}

export type MockDb = {
  users: StoredUser[];
  conversations: ConversationPreview[];
  messages: Map<string, Message[]>;
  tokens: Map<string, string>;
};

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function buildSeedMessages(
  conversationId: string,
  senderIds: string[],
  count: number,
): Message[] {
  const messages: Message[] = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      id: `${conversationId}-msg-${i + 1}`,
      conversationId,
      senderId: senderIds[i % senderIds.length]!,
      body: `Message ${i + 1} in ${conversationId}`,
      createdAt: isoMinutesAgo(count - i + 100),
    });
  }
  return messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function createMockDb(): MockDb {
  const users = buildSeedUsers();

  const conv1Messages = buildSeedMessages(
    "conv-alice-bob",
    ["user-alice", "user-bob"],
    45,
  );
  const conv2Messages = buildSeedMessages(
    "conv-alice-carol",
    ["user-alice", "user-carol"],
    8,
  );
  const conv3Messages = buildSeedMessages(
    "conv-bob-carol",
    ["user-bob", "user-carol"],
    3,
  );

  const last1 = conv1Messages[conv1Messages.length - 1]!;
  const last2 = conv2Messages[conv2Messages.length - 1]!;
  const last3 = conv3Messages[conv3Messages.length - 1]!;

  const conversations: ConversationPreview[] = [
    {
      id: "conv-alice-bob",
      type: "direct",
      title: "Alice & Bob",
      participantIds: ["user-alice", "user-bob"],
      participants: [],
      lastMessage: {
        body: last1.body,
        createdAt: last1.createdAt,
        senderId: last1.senderId,
      },
      updatedAt: last1.createdAt,
    },
    {
      id: "conv-alice-carol",
      type: "direct",
      title: "Project sync",
      participantIds: ["user-alice", "user-carol"],
      participants: [],
      lastMessage: {
        body: last2.body,
        createdAt: last2.createdAt,
        senderId: last2.senderId,
      },
      updatedAt: last2.createdAt,
    },
    {
      id: "conv-bob-carol",
      type: "direct",
      title: "Weekend plans",
      participantIds: ["user-bob", "user-carol"],
      participants: [],
      lastMessage: {
        body: last3.body,
        createdAt: last3.createdAt,
        senderId: last3.senderId,
      },
      updatedAt: last3.createdAt,
    },
  ];

  const messages = new Map<string, Message[]>();
  messages.set("conv-alice-bob", conv1Messages);
  messages.set("conv-alice-carol", conv2Messages);
  messages.set("conv-bob-carol", conv3Messages);

  return {
    users,
    conversations,
    messages,
    tokens: new Map(),
  };
}

let db: MockDb = createMockDb();

export function getDb(): MockDb {
  return db;
}

export function resetDb(): void {
  db = createMockDb();
}

export function issueToken(userId: string): string {
  const token = `mock-token-${userId}-${crypto.randomUUID()}`;
  db.tokens.set(token, userId);
  return token;
}

export function resolveUserId(token: string | null): string | null {
  if (!token) return null;
  return db.tokens.get(token) ?? null;
}

export function findUserById(userId: string): StoredUser | null {
  return db.users.find((user) => user.id === userId) ?? null;
}

export function verifyCredentials(
  email: string,
  password: string,
): StoredUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find((candidate) => candidate.email === normalizedEmail);
  if (!user || user.password !== password) return null;
  return user;
}

export type CreateUserResult =
  | { user: StoredUser }
  | { error: "EMAIL_ALREADY_REGISTERED" };

export function createUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): CreateUserResult {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (db.users.some((candidate) => candidate.email === normalizedEmail)) {
    return { error: "EMAIL_ALREADY_REGISTERED" };
  }

  const user: StoredUser = {
    id: `user-${crypto.randomUUID()}`,
    email: normalizedEmail,
    password: input.password,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    avatarKey: null,
    previousEmails: [],
  };
  db.users.push(user);
  return { user };
}

export function updateUserName(
  userId: string,
  firstName: string,
  lastName: string,
): StoredUser | null {
  const user = findUserById(userId);
  if (!user) return null;
  user.firstName = firstName.trim();
  user.lastName = lastName.trim();
  return user;
}

function encodeEmailChangeToken(payload: EmailChangeTokenPayload): string {
  return `${MOCK_EMAIL_CHANGE_TOKEN_PREFIX}${btoa(JSON.stringify(payload))}`;
}

function decodeEmailChangeToken(token: string): EmailChangeTokenPayload | null {
  if (!token.startsWith(MOCK_EMAIL_CHANGE_TOKEN_PREFIX)) return null;
  try {
    const parsed = JSON.parse(
      atob(token.slice(MOCK_EMAIL_CHANGE_TOKEN_PREFIX.length)),
    ) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as EmailChangeTokenPayload).userId === "string" &&
      typeof (parsed as EmailChangeTokenPayload).newEmail === "string"
    ) {
      return parsed as EmailChangeTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}

function isEmailTakenByAnother(email: string, userId: string): boolean {
  return db.users.some(
    (candidate) => candidate.email === email && candidate.id !== userId,
  );
}

export function requestEmailChange(
  userId: string,
  newEmail: string,
): MockRequestEmailChangeOutcome {
  const user = findUserById(userId);
  if (!user) return { error: "VALIDATION_ERROR" };

  const normalizedEmail = newEmail.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail) || normalizedEmail === user.email) {
    return { error: "VALIDATION_ERROR" };
  }
  if (isEmailTakenByAnother(normalizedEmail, userId)) {
    return { error: "EMAIL_ALREADY_REGISTERED" };
  }

  return { token: encodeEmailChangeToken({ userId, newEmail: normalizedEmail }) };
}

export function confirmEmailChange(
  token: string,
): MockConfirmEmailChangeOutcome<StoredUser> {
  const payload = decodeEmailChangeToken(token);
  if (!payload) return { error: "EMAIL_CHANGE_TOKEN_INVALID" };

  const user = findUserById(payload.userId);
  if (!user) return { error: "EMAIL_CHANGE_TOKEN_INVALID" };
  if (payload.newEmail === user.email) {
    return { user };
  }
  if (isEmailTakenByAnother(payload.newEmail, user.id)) {
    return { error: "EMAIL_ALREADY_REGISTERED" };
  }

  user.previousEmails = [...user.previousEmails, user.email].slice(
    -MOCK_EMAIL_CHANGE_HISTORY_LIMIT,
  );
  user.email = payload.newEmail;
  return { user };
}

export function getPreviousEmails(userId: string): string[] | null {
  const user = findUserById(userId);
  return user ? user.previousEmails : null;
}

function deriveDirectTitle(conversation: ConversationPreview): string {
  const names = [...conversation.participantIds]
    .sort()
    .map((participantId) => {
      const user = findUserById(participantId);
      return user ? fullName(user) : null;
    });
  if (names.some((name) => name === null)) {
    return conversation.title;
  }
  return names.join(" & ");
}

function buildParticipants(
  conversation: ConversationPreview,
): ConversationParticipant[] {
  return conversation.participantIds
    .map((participantId) => findUserById(participantId))
    .filter((user): user is StoredUser => user !== null)
    .map(toParticipant);
}

export function getUserConversations(userId: string): ConversationPreview[] {
  return db.conversations
    .filter((c) => c.participantIds.includes(userId))
    .map((c) => ({
      ...c,
      title: c.type === "direct" ? deriveDirectTitle(c) : c.title,
      participants: buildParticipants(c),
    }))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function isOwnedAvatarKey(userId: string, key: string): boolean {
  return key === `avatars/${userId}`;
}

export function setUserAvatar(userId: string, key: string): StoredUser | null {
  const user = findUserById(userId);
  if (!user) return null;
  user.avatarKey = key;
  return user;
}

export function clearUserAvatar(userId: string): StoredUser | null {
  const user = findUserById(userId);
  if (!user) return null;
  user.avatarKey = null;
  return user;
}

export function userInConversation(
  userId: string,
  conversationId: string,
): boolean {
  const conv = db.conversations.find((c) => c.id === conversationId);
  return conv?.participantIds.includes(userId) ?? false;
}

export type PaginateMessagesResult =
  | { messages: Message[]; nextCursor: string | null }
  | { error: ApiErrorPayload };

export function paginateMessages(
  conversationId: string,
  cursor: string | null,
  limit: number,
): PaginateMessagesResult {
  const all = db.messages.get(conversationId) ?? [];
  const sorted = [...all].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (sorted.length === 0) {
    return { messages: [], nextCursor: null };
  }

  let endIndex = sorted.length;
  if (cursor) {
    const cursorIndex = sorted.findIndex((m) => m.id === cursor);
    if (cursorIndex === -1) {
      return {
        error: {
          code: "INVALID_CURSOR",
          message: "Pagination cursor is invalid or expired",
        },
      };
    }
    endIndex = cursorIndex;
  }

  const startIndex = Math.max(0, endIndex - limit);
  const page = sorted.slice(startIndex, endIndex);
  const nextCursor = startIndex > 0 ? sorted[startIndex]!.id : null;

  return { messages: page, nextCursor };
}

export function addMessage(
  conversationId: string,
  senderId: string,
  body: string,
  clientMessageId?: string,
): Message {
  const existing = db.messages.get(conversationId) ?? [];
  if (clientMessageId) {
    const dup = existing.find((m) => m.id === clientMessageId);
    if (dup) return dup;
  }

  const message: Message = {
    id: clientMessageId ?? `msg-${crypto.randomUUID()}`,
    conversationId,
    senderId,
    body,
    createdAt: new Date().toISOString(),
  };

  const updated = [...existing, message].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  db.messages.set(conversationId, updated);

  const conv = db.conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = {
      body: message.body,
      createdAt: message.createdAt,
      senderId: message.senderId,
    };
    conv.updatedAt = message.createdAt;
  }

  return message;
}
