export interface RapydCheckoutResponse {
  data?: {
    id?: string
    redirect_url?: string
  }
}

export interface RapydWebhookBody {
  id?: string
  type?: string
  data?: {
    id?: string
    checkout_id?: string
  }
}
