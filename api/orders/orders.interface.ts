export interface Orders {
  id: number;
  user_id: number;
  address_id: number;
  total_price: number;
  status: string;
  created_at: Date;
  updated_at: Date;
};