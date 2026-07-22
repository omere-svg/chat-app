import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { SUBSCRIPTION_ACTIVE_STATUS } from './constants.js'
import { SubscriptionDocument } from './subscription.schema.js'
import { toSubscription } from './subscription.mapper.js'
import type { SubscriptionRepository } from './subscription.repository.js'
import type { ActivateSubscriptionInput } from './types/activate-subscription-input.js'
import type { Subscription } from './types/subscription.js'

@Injectable()
export class MongoSubscriptionRepository implements SubscriptionRepository {
  constructor(
    @InjectModel(SubscriptionDocument.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async findByUserId(userId: string): Promise<Subscription | null> {
    const document = await this.subscriptionModel
      .findById(userId)
      .lean<SubscriptionDocument | null>()
    return document === null ? null : toSubscription(document)
  }

  async activate({ userId, planCode, activatedAt }: ActivateSubscriptionInput): Promise<void> {
    await this.subscriptionModel.updateOne(
      { _id: userId },
      { $set: { planCode, status: SUBSCRIPTION_ACTIVE_STATUS, activatedAt } },
      { upsert: true },
    )
  }
}
