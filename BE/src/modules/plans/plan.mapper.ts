import type { PlanDocument } from './plan.schema.js'
import type { Plan } from './types/plan.js'

export function toPlan(document: PlanDocument): Plan {
  return {
    code: document._id,
    name: document.name,
    amount: document.amount,
    currency: document.currency,
    interval: document.interval,
    active: document.active,
  }
}
