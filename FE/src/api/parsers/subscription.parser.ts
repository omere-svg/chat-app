import { MalformedResponseError } from '../malformedResponseError.ts'
import { isRecord, readNullableString, readNumber, readString } from './primitives.ts'
import {
  SUBSCRIPTION_ACTIVE_STATUS,
  SUBSCRIPTION_NONE_STATUS,
} from '../constants.ts'
import type {
  CreatePaymentSessionResult,
  GetSubscriptionResult,
  ListPlansResult,
} from '../../types/api.ts'
import type { Plan, SubscriptionStatus } from '../../types/domain.ts'

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
