export interface Payments {
  id: number;
  user_id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  amount: number;
  amount_in_cents: number;
  created_at: Date;
  updated_at: Date;
}