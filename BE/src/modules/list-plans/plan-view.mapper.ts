import type { Plan } from '../plans/types/plan.js'
import type { PlanView } from './types/plans.view.js'

export function toPlanView(plan: Plan): PlanView {
  return {
    code: plan.code,
    name: plan.name,
    amount: plan.amount,
    currency: plan.currency,
    interval: plan.interval,
  }
}
