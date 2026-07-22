import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common'
import { PAYMENT_EVENT_QUEUE } from '../payment-event-queue/payment-event-queue.tokens.js'
import { ProcessPaymentEventOrchestrator } from '../process-payment-event/process-payment-event.orchestrator.js'
import { CONSUMER_ERROR_BACKOFF_MS } from './constants.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type {
  PaymentEventQueue,
  ReceivedPaymentEvent,
} from '../payment-event-queue/types/payment-event-queue.js'

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

@Injectable()
export class PaymentEventConsumer implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PaymentEventConsumer.name)
  private running = false
  private loopPromise: Promise<void> | null = null

  constructor(
    @Inject(PAYMENT_EVENT_QUEUE) private readonly paymentEventQueue: PaymentEventQueue,
    private readonly processPaymentEventOrchestrator: ProcessPaymentEventOrchestrator,
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {}

  onApplicationBootstrap(): void {
    if (this.configService.get('PAYMENT_QUEUE_KIND', { infer: true }) !== 'sqs') {
      return
    }
    this.running = true
    this.loopPromise = this.pollLoop()
    this.logger.log('Payment event consumer started')
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false
    if (this.loopPromise !== null) {
      await this.loopPromise
    }
  }

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        const received = await this.paymentEventQueue.receive()
        for (const message of received) {
          await this.handleMessage(message)
        }
      } catch (error) {
        this.logger.error(
          'Failed to poll the payment event queue',
          error instanceof Error ? error.stack : String(error),
        )
        await delay(CONSUMER_ERROR_BACKOFF_MS)
      }
    }
  }

  private async handleMessage(received: ReceivedPaymentEvent): Promise<void> {
    try {
      await this.processPaymentEventOrchestrator.process(received.event)
      await this.paymentEventQueue.acknowledge(received.receiptHandle)
    } catch (error) {
      this.logger.error(
        `Failed to process payment event ${received.event.id}; leaving it for redrive to the DLQ`,
        error instanceof Error ? error.stack : String(error),
      )
    }
  }
}
