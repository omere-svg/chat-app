import { MalformedResponseError } from '../malformedResponseError.ts'
import { isRecord } from './primitives.ts'
import {
  EMAIL_CHANGE_REQUEST_STATUS,
  PASSWORD_RESET_CONFIRM_STATUS,
  PASSWORD_RESET_REQUEST_STATUS,
} from '../constants.ts'
import type {
  ConfirmPasswordResetResult,
  RequestEmailChangeResult,
  RequestPasswordResetResult,
} from '../../types/api.ts'

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
