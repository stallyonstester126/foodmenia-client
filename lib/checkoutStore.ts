import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";

export interface Address {
  id: string;
  label?: string;
  street: string;
  full_address?: string;
  city: string;
  state?: string;
  zipCode?: string;
  isDefault?: boolean;
}

export interface SummaryItem {
  name: string;
  qty: number;
  price: number;
}

export interface CheckoutSummary {
  items: SummaryItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  totalBeforeDiscount: number;
  discount: number;
  voucherCode?: string;
  grandTotal: number;
}

interface CheckoutState {
  addresses: Address[];
  selectedAddressId: string | null;
  deliveryInstructions: string;
  leaveAtDoor: boolean;
  voucherCode: string;
  voucherApplied: boolean;
  voucherError: string | null;
  summary: CheckoutSummary | null;
  idempotencyKey: string;
  isSubmitting: boolean;

  fetchAddresses: () => Promise<void>;
  selectAddress: (id: string) => void;
  addAddress: (address: Partial<Address>) => Promise<void>;
  setDeliveryInstructions: (text: string) => void;
  setLeaveAtDoor: (val: boolean) => void;
  applyVoucher: (code: string) => Promise<boolean>;
  removeVoucher: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  placeOrder: (params: {
    paymentMethodId: string | null;
    fulfillmentType?: string;
  }) => Promise<{ success: boolean; orderId?: string; error?: string }>;
}

function normalizeCheckoutSummary(data: Record<string, unknown> | null | undefined): CheckoutSummary | null {
  if (!data) return null;

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items: SummaryItem[] = rawItems.map((item: Record<string, unknown>) => ({
    name: String(item.name || item.name_snapshot || "Item"),
    qty: Number(item.quantity ?? item.qty ?? 1),
    price: Number(item.unit_price ?? item.total_price ?? item.price ?? item.unit_price_snapshot ?? 0),
  }));

  const totals = (data.totals as Record<string, unknown>) || {};
  const subtotal = Number(totals.subtotal ?? data.subtotal ?? 0);
  const deliveryFee = Number(totals.delivery_fee ?? data.deliveryFee ?? 0);
  const platformFee = Number(totals.platform_fee ?? data.platformFee ?? 19.99);
  const totalBeforeDiscount = Number(totals.total_before_discount ?? data.totalBeforeDiscount ?? (subtotal + deliveryFee + platformFee));
  const discount = Number(totals.discount_amount ?? data.discount ?? 0);
  const grandTotal = Number(totals.total ?? data.grandTotal ?? Math.max(0, totalBeforeDiscount - discount));
  const appliedVoucher = (data.applied_voucher as Record<string, unknown>) || {};

  return {
    items,
    subtotal,
    deliveryFee,
    platformFee,
    totalBeforeDiscount,
    discount,
    voucherCode: String(appliedVoucher.code || data.voucherCode || ""),
    grandTotal,
  };
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  addresses: [
    {
      id: "addr_1",
      label: "Home",
      street: "B1234 Maple Street",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      isDefault: true,
    },
  ],
  selectedAddressId: "addr_1",
  deliveryInstructions: "",
  leaveAtDoor: true,
  voucherCode: "",
  voucherApplied: false,
  voucherError: null,
  summary: null,
  idempotencyKey: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ik_${Date.now()}`,
  isSubmitting: false,

  fetchAddresses: async () => {
    try {
      const data = await apiClient.get<Record<string, unknown>[]>("/users/addresses");
      if (Array.isArray(data) && data.length > 0) {
        const normalizedList: Address[] = data.map((a) => ({
          id: String(a.id),
          label: String(a.label || "Home"),
          street: String(a.full_address || a.street || "Delivery Location"),
          city: String(a.city || "Austin"),
          state: String(a.state || ""),
          zipCode: String(a.zipCode || ""),
          isDefault: Boolean(a.is_default || a.isDefault),
        }));
        set({
          addresses: normalizedList,
          selectedAddressId: normalizedList.find((a) => a.isDefault)?.id || normalizedList[0].id,
        });
      }
    } catch {
      // Keep default address if fetch fails
    }
  },

  selectAddress: (id) => set({ selectedAddressId: id }),

  addAddress: async (addressData) => {
    try {
      const payload = {
        label: addressData.label || "Home",
        full_address: addressData.street || addressData.full_address || addressData.city || "Selected Delivery Location",
        city: addressData.city || "Austin",
        is_default: true,
      };
      const res = await apiClient.post<Record<string, unknown>>("/users/addresses", payload);
      const newAddr: Address = {
        id: String(res.id || `addr_${Date.now()}`),
        label: String(res.label || "Home"),
        street: String(res.full_address || addressData.street || "Selected Delivery Location"),
        city: String(res.city || "Austin"),
        isDefault: true,
      };
      set((state) => ({
        addresses: [...state.addresses.map((a) => ({ ...a, isDefault: false })), newAddr],
        selectedAddressId: newAddr.id,
      }));
    } catch {
      const mockAddr: Address = {
        id: `addr_${Date.now()}`,
        street: addressData.street || "New Address",
        city: addressData.city || "Austin",
        isDefault: true,
      };
      set((state) => ({
        addresses: [...state.addresses, mockAddr],
        selectedAddressId: mockAddr.id,
      }));
    }
  },

  setDeliveryInstructions: (text) => set({ deliveryInstructions: text }),
  setLeaveAtDoor: (val) => set({ leaveAtDoor: val }),

  applyVoucher: async (code) => {
    set({ voucherError: null });
    try {
      const res = await apiClient.post<Record<string, unknown>>("/checkout/voucher/apply", { code });
      const summaryData = (res?.summary as Record<string, unknown>) || res;
      const normalized = normalizeCheckoutSummary(summaryData);
      set({
        voucherCode: code,
        voucherApplied: true,
        summary: normalized || get().summary,
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid or expired voucher code.";
      set({
        voucherError: msg,
        voucherApplied: false,
      });
      return false;
    }
  },

  removeVoucher: async () => {
    try {
      await apiClient.post("/checkout/voucher/remove");
    } catch {
      // Ignore error
    } finally {
      set({ voucherCode: "", voucherApplied: false, voucherError: null });
      await get().fetchSummary();
    }
  },

  fetchSummary: async () => {
    try {
      const summaryData = await apiClient.get<Record<string, unknown>>("/checkout/summary");
      const normalized = normalizeCheckoutSummary(summaryData);
      if (normalized) {
        set({ summary: normalized });
      }
    } catch {
      // Clear summary if cart is empty
      set({ summary: null });
    }
  },

  placeOrder: async ({ paymentMethodId, fulfillmentType = "delivery" }) => {
    const { selectedAddressId, deliveryInstructions, idempotencyKey } = get();

    if (!paymentMethodId) {
      return { success: false, error: "Please select or add a payment method before placing order." };
    }

    set({ isSubmitting: true });

    try {
      const numericAddressId = Number(selectedAddressId);
      const numericPaymentId = paymentMethodId ? Number(paymentMethodId) : null;

      const res = await apiClient.post<{ orderId?: string; id?: string }>(
        "/orders",
        {
          address_id: isNaN(numericAddressId) ? null : numericAddressId,
          addressId: isNaN(numericAddressId) ? null : numericAddressId,
          payment_method_id: numericPaymentId && !isNaN(numericPaymentId) ? numericPaymentId : null,
          paymentMethodId: numericPaymentId && !isNaN(numericPaymentId) ? numericPaymentId : null,
          fulfillment_type: fulfillmentType,
          fulfillmentType,
          delivery_instructions: deliveryInstructions,
          deliveryInstructions,
        },
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
        }
      );

      const orderId = res.orderId || res.id || `ord_${Date.now()}`;
      set({ isSubmitting: false });
      return { success: true, orderId };
    } catch (err: unknown) {
      set({ isSubmitting: false });
      const msg = err instanceof Error ? err.message : "Order placement failed. Please try again.";
      return {
        success: false,
        error: msg,
      };
    }
  },
}));
