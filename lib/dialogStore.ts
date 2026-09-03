import { create } from "zustand";

export type DialogVariant = "success" | "error" | "warning" | "info" | "danger";
export type DialogType = "alert" | "confirm";

export interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
}

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  title?: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: DialogVariant;
  resolvePromise?: (value: boolean) => void;
  openAlert: (options: DialogOptions) => Promise<void>;
  openConfirm: (options: DialogOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  type: "alert",
  title: undefined,
  message: "",
  confirmText: "OK",
  cancelText: "Cancel",
  variant: "info",
  resolvePromise: undefined,

  openAlert: (options: DialogOptions) => {
    return new Promise<void>((resolve) => {
      set({
        isOpen: true,
        type: "alert",
        title:
          options.title ||
          (options.variant === "error"
            ? "Error"
            : options.variant === "success"
            ? "Success"
            : "Notice"),
        message: options.message,
        confirmText: options.confirmText || "OK",
        cancelText: "Cancel",
        variant: options.variant || "info",
        resolvePromise: () => resolve(),
      });
    });
  },

  openConfirm: (options: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        type: "confirm",
        title: options.title || "Confirm Action",
        message: options.message,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "warning",
        resolvePromise: resolve,
      });
    });
  },

  handleConfirm: () => {
    const { resolvePromise } = get();
    set({ isOpen: false });
    if (resolvePromise) {
      resolvePromise(true);
    }
  },

  handleCancel: () => {
    const { resolvePromise } = get();
    set({ isOpen: false });
    if (resolvePromise) {
      resolvePromise(false);
    }
  },
}));

// Convenient non-hook helpers accessible everywhere
export const showAlert = (
  options: DialogOptions | string,
  title?: string,
  variant: DialogVariant = "info"
): Promise<void> => {
  if (typeof options === "string") {
    return useDialogStore.getState().openAlert({ message: options, title, variant });
  }
  return useDialogStore.getState().openAlert(options);
};

export const showConfirm = (
  options: DialogOptions | string,
  title?: string,
  variant: DialogVariant = "warning"
): Promise<boolean> => {
  if (typeof options === "string") {
    return useDialogStore.getState().openConfirm({ message: options, title, variant });
  }
  return useDialogStore.getState().openConfirm(options);
};
