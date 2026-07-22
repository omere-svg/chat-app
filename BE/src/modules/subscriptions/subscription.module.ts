import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoSubscriptionRepository } from './subscription.mongo.repository.js'
import { SUBSCRIPTION_REPOSITORY } from './subscription.repository.js'
import { SubscriptionDocument, SubscriptionSchema } from './subscription.schema.js'
import { SubscriptionService } from './subscription.service.js'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionDocument.name, schema: SubscriptionSchema },
    ]),
  ],
  providers: [
    SubscriptionService,
    { provide: SUBSCRIPTION_REPOSITORY, useClass: MongoSubscriptionRepository },
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
