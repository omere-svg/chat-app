import type {
  AuthResponse,
  AvatarResult,
  AvatarUploadTicket,
  ConfirmEmailChangeResponse,
  ConfirmPasswordResetResult,
  ConversationsResponse,
  CreateConversationResponse,
  CreatePaymentSessionResult,
  GetSubscriptionResult,
  KnowledgeDocument,
  KnowledgeDocumentsResponse,
  ListPlansResult,
  MessagesResponse,
  PreviousEmailsResponse,
  RequestEmailChangeResult,
  RequestPasswordResetResult,
  SendMessageResponse,
  UploadKnowledgeDocumentResponse,
} from '../types/api.ts'
import {
  EMAIL_CHANGE_REQUEST_STATUS,
  PASSWORD_RESET_CONFIRM_STATUS,
  PASSWORD_RESET_REQUEST_STATUS,
  SUBSCRIPTION_ACTIVE_STATUS,
  SUBSCRIPTION_NONE_STATUS,
} from './constants.ts'
import type {
  Citation,
  ConversationParticipant,
  ConversationPreview,
  ConversationType,
  Message,
  MessageMetadata,
  Plan,
  SubscriptionStatus,
  User,
} from '../types/domain.ts'

const CONVERSATION_TYPES: readonly ConversationType[] = ['direct', 'assistant', 'tutor']

export class MalformedResponseError extends Error {
  constructor(field: string) {
    super(`Malformed server response at ${field}`)
    this.name = 'MalformedResponseError'
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string {
  const value = record[field]
  if (typeof value !== 'string') {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value
}

function readOptionalString(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string | undefined {
  const value = record[field]
  if (value === undefined) {
    return undefined
  }
  if (typeof value !== 'string') {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value
}

function readNullableString(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string | null {
  const value = record[field]
  if (value === undefined || value === null) {
    return null
  }
  if (typeof value !== 'string') {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value
}

function readNumber(
  record: Record<string, unknown>,
  field: string,
  context: string,
): number {
  const value = record[field]
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value
}

function readStringArray(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string[] {
  const value = record[field]
  if (!Array.isArray(value)) {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value.map((entry, index) => {
    if (typeof entry !== 'string') {
      throw new MalformedResponseError(`${context}.${field}[${index}]`)
    }
    return entry
  })
}

function parseUser(value: unknown): User {
  if (!isRecord(value)) {
    throw new MalformedResponseError('user')
  }
  return {
    id: readString(value, 'id', 'user'),
    firstName: readString(value, 'firstName', 'user'),
    lastName: readString(value, 'lastName', 'user'),
    email: readOptionalString(value, 'email', 'user'),
    avatarUrl: readNullableString(value, 'avatarUrl', 'user'),
  }
}

function parseParticipant(value: unknown, context: string): ConversationParticipant {
  if (!isRecord(value)) {
    throw new MalformedResponseError(context)
  }
  return {
    id: readString(value, 'id', context),
    firstName: readString(value, 'firstName', context),
    lastName: readString(value, 'lastName', context),
    avatarUrl: readNullableString(value, 'avatarUrl', context),
  }
}

function parseParticipants(value: unknown): ConversationParticipant[] {
  if (value === undefined) {
    return []
  }
  if (!Array.isArray(value)) {
    throw new MalformedResponseError('conversation.participants')
  }
  return value.map((entry, index) =>
    parseParticipant(entry, `conversation.participants[${index}]`),
  )
}

export function parseCitation(value: unknown, context: string): Citation {
  if (!isRecord(value)) {
    throw new MalformedResponseError(context)
  }
  return {
    chunkId: readString(value, 'chunkId', context),
    documentId: readString(value, 'documentId', context),
    documentName: readString(value, 'documentName', context),
    text: readString(value, 'text', context),
    score: readNumber(value, 'score', context),
  }
}

function parseCitations(value: unknown): Citation[] | undefined {
  if (value === undefined) {
    return undefined
  }
  if (!Array.isArray(value)) {
    throw new MalformedResponseError('message.metadata.citations')
  }
  return value.map((entry, index) =>
    parseCitation(entry, `message.metadata.citations[${index}]`),
  )
}

function parseMessageMetadata(value: unknown): MessageMetadata | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  if (!isRecord(value)) {
    throw new MalformedResponseError('message.metadata')
  }
  const replyToMessageId = readOptionalString(value, 'replyToMessageId', 'message.metadata')
  const citations = parseCitations(value.citations)
  if (replyToMessageId === undefined && citations === undefined) {
    return undefined
  }
  const metadata: MessageMetadata = {}
  if (replyToMessageId !== undefined) {
    metadata.replyToMessageId = replyToMessageId
  }
  if (citations !== undefined) {
    metadata.citations = citations
  }
  return metadata
}

function parseMessage(value: unknown): Message {
  if (!isRecord(value)) {
    throw new MalformedResponseError('message')
  }
  const message: Message = {
    id: readString(value, 'id', 'message'),
    conversationId: readString(value, 'conversationId', 'message'),
    senderId: readString(value, 'senderId', 'message'),
    body: readString(value, 'body', 'message'),
    createdAt: readString(value, 'createdAt', 'message'),
  }
  const metadata = parseMessageMetadata(value.metadata)
  if (metadata !== undefined) {
    message.metadata = metadata
  }
  return message
}

function parseConversationLastMessage(
  value: unknown,
): ConversationPreview['lastMessage'] {
  if (value === null) {
    return null
  }
  if (!isRecord(value)) {
    throw new MalformedResponseError('conversation.lastMessage')
  }
  return {
    body: readString(value, 'body', 'conversation.lastMessage'),
    createdAt: readString(value, 'createdAt', 'conversation.lastMessage'),
    senderId: readString(value, 'senderId', 'conversation.lastMessage'),
  }
}

function readConversationType(value: Record<string, unknown>): ConversationType {
  const candidate = value.type
  return CONVERSATION_TYPES.includes(candidate as ConversationType)
    ? (candidate as ConversationType)
    : 'direct'
}

function parseConversationPreview(value: unknown): ConversationPreview {
  if (!isRecord(value)) {
    throw new MalformedResponseError('conversation')
  }
  return {
    id: readString(value, 'id', 'conversation'),
    type: readConversationType(value),
    title: readString(value, 'title', 'conversation'),
    participantIds: readStringArray(value, 'participantIds', 'conversation'),
    participants: parseParticipants(value.participants),
    lastMessage: parseConversationLastMessage(value.lastMessage),
    updatedAt: readString(value, 'updatedAt', 'conversation'),
  }
}

export function parseAuthResponse(value: unknown): AuthResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('authResponse')
  }
  return {
    token: readString(value, 'token', 'authResponse'),
    user: parseUser(value.user),
  }
}

export function parseUserResponse(value: unknown): User {
  return parseUser(value)
}

export function parsePreviousEmailsResponse(value: unknown): PreviousEmailsResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('previousEmailsResponse')
  }
  return { previousEmails: readStringArray(value, 'previousEmails', 'previousEmailsResponse') }
}

export function parseRequestEmailChangeResult(value: unknown): RequestEmailChangeResult {
  if (!isRecord(value) || value.status !== EMAIL_CHANGE_REQUEST_STATUS) {
    throw new MalformedResponseError('requestEmailChangeResult.status')
  }
  return { status: EMAIL_CHANGE_REQUEST_STATUS }
}

export function parseRequestPasswordResetResult(value: unknown): RequestPasswordResetResult {
  if (!isRecord(value) || value.status !== PASSWORD_RESET_REQUEST_STATUS) {
    throw new MalformedResponseError('requestPasswordResetResult.status')
  }
  return { status: PASSWORD_RESET_REQUEST_STATUS }
}

export function parseConfirmPasswordResetResult(value: unknown): ConfirmPasswordResetResult {
  if (!isRecord(value) || value.status !== PASSWORD_RESET_CONFIRM_STATUS) {
    throw new MalformedResponseError('confirmPasswordResetResult.status')
  }
  return { status: PASSWORD_RESET_CONFIRM_STATUS }
}

function parsePlan(value: unknown, index: number): Plan {
  if (!isRecord(value)) {
    throw new MalformedResponseError(`plansResult.plans[${String(index)}]`)
  }
  const context = `plansResult.plans[${String(index)}]`
  return {
    code: readString(value, 'code', context),
    name: readString(value, 'name', context),
    amount: readNumber(value, 'amount', context),
    currency: readString(value, 'currency', context),
    interval: readString(value, 'interval', context),
  }
}

export function parsePlansResult(value: unknown): ListPlansResult {
  if (!isRecord(value) || !Array.isArray(value.plans)) {
    throw new MalformedResponseError('plansResult.plans')
  }
  return { plans: value.plans.map((plan, index) => parsePlan(plan, index)) }
}

function parseSubscriptionStatus(value: unknown): SubscriptionStatus {
  if (value !== SUBSCRIPTION_ACTIVE_STATUS && value !== SUBSCRIPTION_NONE_STATUS) {
    throw new MalformedResponseError('subscriptionResult.status')
  }
  return value
}

export function parseSubscriptionResult(value: unknown): GetSubscriptionResult {
  if (!isRecord(value)) {
    throw new MalformedResponseError('subscriptionResult')
  }
  return {
    status: parseSubscriptionStatus(value.status),
    planCode: readNullableString(value, 'planCode', 'subscriptionResult'),
    activatedAt: readNullableString(value, 'activatedAt', 'subscriptionResult'),
  }
}

export function parseCreatePaymentSessionResult(value: unknown): CreatePaymentSessionResult {
  if (!isRecord(value)) {
    throw new MalformedResponseError('createPaymentSessionResult')
  }
  return { checkoutUrl: readString(value, 'checkoutUrl', 'createPaymentSessionResult') }
}

export function parseConfirmEmailChangeResponse(
  value: unknown,
): ConfirmEmailChangeResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('user')
  }
  return {
    ...parseUser(value),
    email: readString(value, 'email', 'user'),
  }
}

function parseUploadFields(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    throw new MalformedResponseError('avatarUploadTicket.fields')
  }
  const fields: Record<string, string> = {}
  for (const [fieldName, fieldValue] of Object.entries(value)) {
    if (typeof fieldValue !== 'string') {
      throw new MalformedResponseError(`avatarUploadTicket.fields.${fieldName}`)
    }
    fields[fieldName] = fieldValue
  }
  return fields
}

export function parseAvatarResult(value: unknown): AvatarResult {
  if (!isRecord(value)) {
    throw new MalformedResponseError('avatarResult')
  }
  return {
    avatarUrl: readNullableString(value, 'avatarUrl', 'avatarResult'),
  }
}

export function parseAvatarUploadTicket(value: unknown): AvatarUploadTicket {
  if (!isRecord(value)) {
    throw new MalformedResponseError('avatarUploadTicket')
  }
  return {
    url: readString(value, 'url', 'avatarUploadTicket'),
    fields: parseUploadFields(value.fields),
    key: readString(value, 'key', 'avatarUploadTicket'),
    expiresInSeconds: readNumber(value, 'expiresInSeconds', 'avatarUploadTicket'),
  }
}

export function parseConversationsResponse(
  value: unknown,
): ConversationsResponse {
  if (!isRecord(value) || !Array.isArray(value.conversations)) {
    throw new MalformedResponseError('conversationsResponse.conversations')
  }
  return { conversations: value.conversations.map(parseConversationPreview) }
}

export function parseCreateConversationResponse(
  value: unknown,
): CreateConversationResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('createConversationResponse')
  }
  return { conversation: parseConversationPreview(value.conversation) }
}

export function parseMessagesResponse(value: unknown): MessagesResponse {
  if (!isRecord(value) || !Array.isArray(value.messages)) {
    throw new MalformedResponseError('messagesResponse.messages')
  }
  const nextCursor = value.nextCursor
  if (nextCursor !== null && typeof nextCursor !== 'string') {
    throw new MalformedResponseError('messagesResponse.nextCursor')
  }
  return { messages: value.messages.map(parseMessage), nextCursor }
}

export function parseSendMessageResponse(value: unknown): SendMessageResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('sendMessageResponse')
  }
  return { message: parseMessage(value.message) }
}

function parseKnowledgeDocument(value: unknown): KnowledgeDocument {
  if (!isRecord(value)) {
    throw new MalformedResponseError('knowledgeDocument')
  }
  const status = readString(value, 'status', 'knowledgeDocument')
  if (status !== 'ready' && status !== 'failed') {
    throw new MalformedResponseError('knowledgeDocument.status')
  }
  return {
    id: readString(value, 'id', 'knowledgeDocument'),
    filename: readString(value, 'filename', 'knowledgeDocument'),
    status,
    chunkCount: readNumber(value, 'chunkCount', 'knowledgeDocument'),
    byteSize: readNumber(value, 'byteSize', 'knowledgeDocument'),
    createdAt: readString(value, 'createdAt', 'knowledgeDocument'),
  }
}

export function parseKnowledgeDocumentsResponse(
  value: unknown,
): KnowledgeDocumentsResponse {
  if (!isRecord(value) || !Array.isArray(value.documents)) {
    throw new MalformedResponseError('knowledgeDocumentsResponse.documents')
  }
  return { documents: value.documents.map(parseKnowledgeDocument) }
}

export function parseUploadKnowledgeDocumentResponse(
  value: unknown,
): UploadKnowledgeDocumentResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('uploadKnowledgeDocumentResponse')
  }
  return { document: parseKnowledgeDocument(value.document) }
}
