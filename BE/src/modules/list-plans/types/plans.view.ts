export interface PlanView {
  code: string
  name: string
  amount: number
  currency: string
  interval: string
}

export interface PlansView {
  plans: PlanView[]
}
