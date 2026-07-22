import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoPaymentSessionRepository } from './payment-session.mongo.repository.js'
import { PAYMENT_SESSION_REPOSITORY } from './payment-session.repository.js'
import { PaymentSessionDocument, PaymentSessionSchema } from './payment-session.schema.js'
import { PaymentSessionService } from './payment-session.service.js'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentSessionDocument.name, schema: PaymentSessionSchema },
    ]),
  ],
  providers: [
    PaymentSessionService,
    { provide: PAYMENT_SESSION_REPOSITORY, useClass: MongoPaymentSessionRepository },
  ],
  exports: [PaymentSessionService],
})
export class PaymentSessionModule {}
