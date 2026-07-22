import { FREE_PLAN_CODE, PRO_PLAN_CODE } from '../../modules/plans/constants.js'
import type { Plan } from '../../modules/plans/types/plan.js'

export const PLAN_SEEDS: readonly Plan[] = [
  {
    code: FREE_PLAN_CODE,
    name: 'Free',
    amount: 0,
    currency: 'USD',
    interval: 'month',
    active: true,
  },
  {
    code: PRO_PLAN_CODE,
    name: 'Pro',
    amount: 9.99,
    currency: 'USD',
    interval: 'month',
    active: true,
  },
]
