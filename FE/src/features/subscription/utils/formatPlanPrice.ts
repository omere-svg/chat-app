import type { Plan } from '@/types/domain.ts'

export function formatPlanPrice(plan: Plan): string {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: plan.currency,
  })
  return `${formatter.format(plan.amount)} / ${plan.interval}`
}
