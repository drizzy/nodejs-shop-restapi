export interface Products{
  id: number;
  name: string;
  slug: string;
  description: string;
  stock: number;
  price: number;
  category: string;
  brand_id: string;
  user_id: number;
  is_active: boolean;
  is_featured: boolean;
}