export interface User {
  id: number;
  name: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  activation_pin: number;
  activated_at: boolean;
  is_active: boolean;
  is_pin_used: boolean;
  created_at: Date;
  updated_at: Date;
}