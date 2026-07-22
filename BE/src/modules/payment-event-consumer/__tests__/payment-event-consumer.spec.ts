import { describe, expect, it, vi } from 'vitest'
import { PaymentEventConsumer } from '../payment-event-consumer.js'
import { PAYMENT_SUCCEEDED_OUTCOME } from '../../payment-provider/constants.js'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../../../config/environment.types.js'
import type { PaymentEventQueue } from '../../payment-event-queue/types/payment-event-queue.js'
import type { ProcessPaymentEventOrchestrator } from '../../process-payment-event/process-payment-event.orchestrator.js'
import type { ReceivedPaymentEvent } from '../../payment-event-queue/types/payment-event-queue.js'

const RECEIVED_MESSAGE: ReceivedPaymentEvent = {
  receiptHandle: 'receipt-1',
  event: { id: 'evt-1', providerSessionId: 'provider-session-1', outcome: PAYMENT_SUCCEEDED_OUTCOME },
}

interface ConsumerInternals {
  handleMessage(received: ReceivedPaymentEvent): Promise<void>
}

function buildConsumer(process: ReturnType<typeof vi.fn>): {
  consumer: PaymentEventConsumer
  acknowledge: ReturnType<typeof vi.fn>
} {
  const acknowledge = vi.fn().mockResolvedValue(undefined)
  const paymentEventQueue = {
    acknowledge,
    receive: vi.fn(),
    enqueue: vi.fn(),
  } as unknown as PaymentEventQueue

  const orchestrator = { process } as unknown as ProcessPaymentEventOrchestrator
  const configService = { get: vi.fn() } as unknown as ConfigService<AppEnvironment, true>

  return {
    consumer: new PaymentEventConsumer(paymentEventQueue, orchestrator, configService),
    acknowledge,
  }
}

describe('PaymentEventConsumer', () => {
  it('acknowledges (deletes) a message once it is processed successfully', async () => {
    const process = vi.fn().mockResolvedValue(undefined)
    const { consumer, acknowledge } = buildConsumer(process)

    await (consumer as unknown as ConsumerInternals).handleMessage(RECEIVED_MESSAGE)

    expect(process).toHaveBeenCalledWith(RECEIVED_MESSAGE.event)
    expect(acknowledge).toHaveBeenCalledWith('receipt-1')
  })

  it('leaves the message unacknowledged on failure so SQS redrives it to the DLQ', async () => {
    const process = vi.fn().mockRejectedValue(new Error('transient failure'))
    const { consumer, acknowledge } = buildConsumer(process)

    await (consumer as unknown as ConsumerInternals).handleMessage(RECEIVED_MESSAGE)

    expect(process).toHaveBeenCalledWith(RECEIVED_MESSAGE.event)
    expect(acknowledge).not.toHaveBeenCalled()
  })
})
