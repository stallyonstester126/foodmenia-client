import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";

export interface CartItemOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // cart item row id
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  specialInstructions?: string;
  selectedOptions?: CartItemOption[];
}

export interface CartData {
  id?: string;
  restaurantId?: string;
  restaurantName?: string;
  restaurantProfileImage?: string;
  restaurantCoverImage?: string;
  fulfillmentType?: "delivery" | "pickup";
  deliveryEstimate?: string;
  items: CartItem[];
  currency?: string;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  grandTotal: number;
}

export interface ToastNotification {
  id: number;
  message: string;
  itemName?: string;
  itemImage?: string;
}

export interface AddToCartParams {
  menuItemId: string;
  quantity: number;
  selectedAddonOptionIds?: string[];
  specialInstructions?: string;
  restaurantId?: string;
  restaurantName?: string;
  confirmClear?: boolean;
  itemName?: string;
  itemImage?: string;
  itemPrice?: number;
}

interface CartState {
  cart: CartData | null;
  isLoading: boolean;
  toast: ToastNotification | null;
  conflictModal: {
    isOpen: boolean;
    pendingItem?: AddToCartParams;
    currentRestaurantName?: string;
    newRestaurantName?: string;
  } | null;

  fetchCart: () => Promise<void>;
  addToCart: (params: AddToCartParams) => Promise<boolean>;
  updateQuantity: (cartItemId: string, newQty: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateFulfillment: (type: "delivery" | "pickup") => Promise<void>;
  syncGuestCart: () => Promise<void>;
  closeConflictModal: () => void;
  showToast: (message: string, itemName?: string, itemImage?: string) => void;
  hideToast: () => void;
  getItemQuantity: (menuItemId: string) => number;
}

const GUEST_CART_KEY = "guest_cart";

function loadGuestCart(): CartData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CartData;
  } catch {
    return null;
  }
}

function saveGuestCart(cart: CartData | null): void {
  if (typeof window === "undefined") return;
  if (!cart || !cart.items || cart.items.length === 0) {
    localStorage.removeItem(GUEST_CART_KEY);
  } else {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  }
}

function recalculateCartTotals(cart: CartData): CartData {
  const subtotal = (cart.items || []).reduce((acc, item) => {
    const addonsTotal = (item.selectedOptions || []).reduce((s, o) => s + o.price, 0);
    return acc + (item.price + addonsTotal) * item.quantity;
  }, 0);

  const deliveryFee = cart.fulfillmentType === "pickup" ? 0 : (cart.deliveryFee || 0);
  const platformFee = cart.platformFee ?? 19.99;
  const grandTotal = subtotal + deliveryFee + platformFee;

  return {
    ...cart,
    subtotal,
    deliveryFee,
    platformFee,
    grandTotal,
  };
}

function normalizeCartResponse(data: Record<string, unknown> | null | undefined): CartData | null {
  if (!data) return null;

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items: CartItem[] = rawItems.map((item: Record<string, unknown>) => ({
    id: String(item.id || item.cart_item_id || item.menu_item_id || Math.random()),
    menuItemId: String(item.menu_item_id || item.menuItemId || item.id || ""),
    name: String(item.item_name || item.name || item.name_snapshot || "Item"),
    price: Number(item.unit_price_snapshot ?? item.unit_price ?? item.price ?? item.base_price ?? 0),
    quantity: Number(item.quantity ?? item.qty ?? 1),
    image: String(item.item_image || item.image_url || item.image || "/item1.png"),
    specialInstructions: String(item.special_instructions || item.specialInstructions || ""),
    selectedOptions: (Array.isArray(item.addons)
      ? item.addons
      : Array.isArray(item.selectedOptions)
      ? item.selectedOptions
      : []
    ).map((opt: Record<string, unknown>) => ({
      id: String(opt.id || opt.option_id || ""),
      name: String(opt.name || opt.option_name || ""),
      price: Number(opt.price || opt.price_snapshot || opt.additional_price || 0),
    })),
  }));

  const calculatedSubtotal = items.reduce((acc, item) => {
    const addonsTotal = (item.selectedOptions || []).reduce((s, o) => s + o.price, 0);
    return acc + (item.price + addonsTotal) * item.quantity;
  }, 0);

  const totals = (data.totals as Record<string, unknown>) || {};
  const subtotal = totals.subtotal !== undefined && totals.subtotal !== null
    ? Number(totals.subtotal)
    : data.subtotal !== undefined && data.subtotal !== null
    ? Number(data.subtotal)
    : calculatedSubtotal;
  const deliveryFee = Number(totals.delivery_fee ?? data.deliveryFee ?? 0);
  const platformFee = Number(totals.platform_fee ?? data.platformFee ?? 19.99);
  const grandTotal = Number(totals.total ?? data.grandTotal ?? (subtotal + deliveryFee + platformFee));
  const restaurantObj = (data.restaurant as Record<string, unknown>) || {};
  const currency = String(data.currency || totals.currency || restaurantObj.currency || "$");

  return {
    id: String(data.id || ""),
    restaurantId: String(data.restaurant_id || data.restaurantId || restaurantObj.id || ""),
    restaurantName: String(restaurantObj.name || data.restaurantName || "Restaurant"),
    restaurantProfileImage: String(restaurantObj.profile_image_url || restaurantObj.profileImageUrl || data.restaurantProfileImage || ""),
    restaurantCoverImage: String(restaurantObj.cover_image_url || restaurantObj.coverImageUrl || data.restaurantCoverImage || ""),
    fulfillmentType: (data.fulfillment_type || data.fulfillmentType || "delivery") as "delivery" | "pickup",
    deliveryEstimate: String(data.delivery_estimate || data.deliveryEstimate || "20-35 min"),
    items,
    currency,
    subtotal,
    deliveryFee,
    platformFee,
    grandTotal,
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  toast: null,
  conflictModal: null,

  showToast: (message, itemName, itemImage) => {
    set({
      toast: {
        id: Date.now(),
        message,
        itemName,
        itemImage,
      },
    });
  },

  hideToast: () => set({ toast: null }),

  getItemQuantity: (menuItemId: string) => {
    const currentCart = get().cart;
    if (!currentCart || !currentCart.items) return 0;
    const match = currentCart.items.find(
      (item) => item.menuItemId === menuItemId || item.id === menuItemId
    );
    return match ? match.quantity : 0;
  },

  fetchCart: async () => {
    const isAuth = typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken") || localStorage.getItem("token"));
    if (!isAuth) {
      const guestCart = loadGuestCart();
      if (guestCart && guestCart.items && guestCart.items.length > 0) {
        set({ cart: recalculateCartTotals(guestCart), isLoading: false });
      } else {
        set({ cart: null, isLoading: false });
      }
      return;
    }

    set({ isLoading: true });
    try {
      const data = await apiClient.get<Record<string, unknown>>("/cart");
      const normalized = normalizeCartResponse(data);
      if (normalized) {
        set({ cart: normalized });
      }
    } catch {
      const guestCart = loadGuestCart();
      if (guestCart) {
        set({ cart: recalculateCartTotals(guestCart) });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (params) => {
    const isAuth = typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken") || localStorage.getItem("token"));

    if (isAuth) {
      try {
        const res = await apiClient.post<Record<string, unknown>>("/cart/items", {
          menu_item_id: params.menuItemId,
          quantity: params.quantity,
          addon_option_ids: params.selectedAddonOptionIds,
          special_instructions: params.specialInstructions,
          confirm_clear: params.confirmClear,
        });

        const normalized = normalizeCartResponse((res?.cart as Record<string, unknown>) || res);
        if (normalized) {
          set({ cart: normalized });
        } else {
          await get().fetchCart();
        }
        get().showToast("Product added to cart!", params.itemName, params.itemImage);
        return true;
      } catch (err: unknown) {
        const errorObj = err as { status?: number; message?: string };
        if (errorObj?.status === 409 || errorObj?.message?.includes("different restaurant")) {
          set({
            conflictModal: {
              isOpen: true,
              pendingItem: params,
              currentRestaurantName: get().cart?.restaurantName || "another restaurant",
              newRestaurantName: params.restaurantName || "this restaurant",
            },
          });
          return false;
        }
        if (errorObj?.status !== 401) {
          await get().fetchCart();
          get().showToast("Product added to cart!", params.itemName, params.itemImage);
          return true;
        }
      }
    }

    // Guest Cart Logic (Unauthenticated or 401 Error)
    let currentGuestCart = loadGuestCart() || get().cart;

    if (
      currentGuestCart &&
      currentGuestCart.restaurantId &&
      params.restaurantId &&
      currentGuestCart.restaurantId !== params.restaurantId &&
      !params.confirmClear &&
      currentGuestCart.items.length > 0
    ) {
      set({
        conflictModal: {
          isOpen: true,
          pendingItem: params,
          currentRestaurantName: currentGuestCart.restaurantName || "another restaurant",
          newRestaurantName: params.restaurantName || "this restaurant",
        },
      });
      return false;
    }

    if (params.confirmClear || !currentGuestCart || (params.restaurantId && currentGuestCart.restaurantId !== params.restaurantId)) {
      currentGuestCart = {
        restaurantId: params.restaurantId || "",
        restaurantName: params.restaurantName || "Restaurant",
        fulfillmentType: "delivery",
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        platformFee: 19.99,
        grandTotal: 19.99,
      };
    }

    const existingIndex = currentGuestCart.items.findIndex(
      (item) => item.menuItemId === params.menuItemId
    );

    let updatedItems: CartItem[] = [];
    if (existingIndex >= 0) {
      updatedItems = currentGuestCart.items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + params.quantity }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        menuItemId: params.menuItemId,
        name: params.itemName || "Item",
        price: params.itemPrice || 0,
        quantity: params.quantity,
        image: params.itemImage || "/item1.png",
        specialInstructions: params.specialInstructions || "",
        selectedOptions: [],
      };
      updatedItems = [...currentGuestCart.items, newItem];
    }

    const newGuestCart = recalculateCartTotals({
      ...currentGuestCart,
      items: updatedItems,
    });

    saveGuestCart(newGuestCart);
    set({ cart: newGuestCart });
    get().showToast("Product added to cart!", params.itemName, params.itemImage);
    return true;
  },

  updateQuantity: async (cartItemId, newQty) => {
    const isAuth = typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken") || localStorage.getItem("token"));

    if (newQty <= 0) {
      return get().removeItem(cartItemId);
    }

    const currentCart = get().cart;
    if (currentCart) {
      const updatedItems = currentCart.items.map((item) =>
        item.id === cartItemId || item.menuItemId === cartItemId ? { ...item, quantity: newQty } : item
      );
      const updatedCart = recalculateCartTotals({ ...currentCart, items: updatedItems });
      set({ cart: updatedCart });
      if (!isAuth) {
        saveGuestCart(updatedCart);
      }
    }

    if (isAuth) {
      try {
        await apiClient.patch(`/cart/items/${cartItemId}`, { quantity: newQty });
      } catch {
        // Ignore API errors on optimistic update
      }
    }
  },

  removeItem: async (cartItemId) => {
    const isAuth = typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken") || localStorage.getItem("token"));

    const currentCart = get().cart;
    if (currentCart) {
      const updatedItems = currentCart.items.filter(
        (item) => item.id !== cartItemId && item.menuItemId !== cartItemId
      );
      const updatedCart = recalculateCartTotals({ ...currentCart, items: updatedItems });
      set({ cart: updatedCart });
      if (!isAuth) {
        saveGuestCart(updatedCart);
      }
    }

    if (isAuth) {
      try {
        await apiClient.delete(`/cart/items/${cartItemId}`);
      } catch {
        // Ignore API error
      }
    }
  },

  updateFulfillment: async (type) => {
    const isAuth = typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken") || localStorage.getItem("token"));

    const currentCart = get().cart;
    if (currentCart) {
      const updatedCart = recalculateCartTotals({ ...currentCart, fulfillmentType: type });
      set({ cart: updatedCart });
      if (!isAuth) {
        saveGuestCart(updatedCart);
      }
    }

    if (isAuth) {
      try {
        await apiClient.patch("/cart/fulfillment", { fulfillmentType: type });
      } catch {
        // Ignore API error
      }
    }
  },

  syncGuestCart: async () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) {
      await get().fetchCart();
      return;
    }

    // Immediately remove from localStorage so concurrent calls cannot re-read
    localStorage.removeItem(GUEST_CART_KEY);

    try {
      const guestCart = JSON.parse(raw) as CartData;
      if (guestCart && guestCart.items && guestCart.items.length > 0) {
        for (const item of guestCart.items) {
          try {
            await apiClient.post("/cart/items", {
              menu_item_id: item.menuItemId,
              quantity: item.quantity,
              addon_option_ids: (item.selectedOptions || []).map((o) => o.id),
              special_instructions: item.specialInstructions,
              confirm_clear: false,
            });
          } catch {
            // Ignore individual item sync errors
          }
        }
      }
    } catch {
      // Ignore JSON parse errors
    } finally {
      await get().fetchCart();
    }
  },

  closeConflictModal: () => set({ conflictModal: null }),
}));
