import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { PAYMENT_SESSION_PENDING_STATUS } from './constants.js'
import { PaymentSessionDocument } from './payment-session.schema.js'
import { toPaymentSession } from './payment-session.mapper.js'
import type { PaymentSessionRepository } from './payment-session.repository.js'
import type { PaymentSession } from './types/payment-session.js'
import type { TransitionPaymentSessionInput } from './types/transition-payment-session-input.js'

@Injectable()
export class MongoPaymentSessionRepository implements PaymentSessionRepository {
  constructor(
    @InjectModel(PaymentSessionDocument.name)
    private readonly paymentSessionModel: Model<PaymentSessionDocument>,
  ) {}

  async insert(session: PaymentSession): Promise<void> {
    await this.paymentSessionModel.create({
      _id: session.id,
      userId: session.userId,
      planCode: session.planCode,
      providerSessionId: session.providerSessionId,
      status: session.status,
      processedEventIds: session.processedEventIds,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    })
  }

  async findByProviderSessionId(providerSessionId: string): Promise<PaymentSession | null> {
    const document = await this.paymentSessionModel
      .findOne({ providerSessionId })
      .lean<PaymentSessionDocument | null>()
    return document === null ? null : toPaymentSession(document)
  }

  async transition({ id, status, eventId }: TransitionPaymentSessionInput): Promise<boolean> {
    const result = await this.paymentSessionModel.updateOne(
      { _id: id, status: PAYMENT_SESSION_PENDING_STATUS },
      { $set: { status, updatedAt: new Date() }, $push: { processedEventIds: eventId } },
    )
    return result.modifiedCount === 1
  }
}
