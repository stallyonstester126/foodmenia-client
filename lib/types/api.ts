export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  role: "customer" | "restaurant_owner" | "admin";
  avatar_url?: string | null;
}

export interface AddonOptionDTO {
  id: number | string;
  addon_group_id?: number | string;
  name: string;
  extra_price: number;
  price_snapshot?: number;
}

export interface AddonGroupDTO {
  id: number | string;
  menu_item_id?: number;
  name: string;
  selection_type: "single" | "multiple";
  is_required: boolean;
  options: AddonOptionDTO[];
}

export interface MenuItemDTO {
  id: number;
  restaurant_id: number;
  category_id?: number | null;
  name: string;
  description?: string | null;
  image_url?: string | null;
  base_price: number;
  is_available: boolean;
  addon_groups?: AddonGroupDTO[];
  related_item_ids?: number[];
  related_items?: MenuItemDTO[];
}

export interface CartAddonDTO {
  id?: number;
  cart_item_id?: number;
  addon_option_id?: number;
  group_name: string;
  option_name: string;
  price_snapshot: number;
}

export interface CartItemDTO {
  cart_item_id: number;
  menu_item_id: number;
  item_name: string;
  unit_price_snapshot: number;
  quantity: number;
  special_instructions?: string | null;
  item_total: number;
  addons?: CartAddonDTO[];
}

export interface CartTotalsDTO {
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  discount_amount: number;
  total: number;
  item_count: number;
  voucher?: {
    id: number;
    code: string;
    discount_type: string;
    discount_value: number;
  } | null;
}

export interface CartResponseDTO {
  id: number;
  user_id: number;
  restaurant?: {
    id: number;
    name: string;
    cover_image_url?: string | null;
    delivery_time_min?: number;
    delivery_time_max?: number;
  } | null;
  fulfillment_type: "delivery" | "pickup";
  items: CartItemDTO[];
  totals: CartTotalsDTO;
}
