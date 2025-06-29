import { useEffect } from "react";
import { match } from "ts-pattern";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { create } from "zustand";

type Toast = {
  id: string;
} & ToastOptions;

export type ToastOptions = {
  severity?: "default" | "error" | "success" | "warning";
  content: string;
  title?: string;
  icon?: React.ReactElement;
} & (TimeBasedToast | StickyToast);
type TimeBasedToast = {
  type: "time";
  duration?: number;
};

type StickyToast = {
  type: "sticky";
  duration?: never;
};

let lastKnownId = 0;

type ToastsState = {
  toasts: Toast[];
  removeToast: (id: string) => void;
  addToast: (toast: ToastOptions) => void;
};

const useToastsState = create<ToastsState>((set, get) => ({
  toasts: [],
  removeToast: (id: string) => {
    set((prev) => ({
      ...prev,
      toasts: prev.toasts.filter((toast) => toast.id !== id),
    }));
  },
  addToast: (toast: ToastOptions) => {
    const id = `toast-${lastKnownId++}`;
    set((prev) => ({
      ...prev,
      toasts: [{ ...toast, id }, ...prev.toasts],
    }));
    if (toast.type === "sticky") return;
    setTimeout(() => get().removeToast(id), toast.duration ?? 5000);
  },
}));

let onToastAdded: (toasts: ToastOptions) => void;

export const showToast = (toast: ToastOptions) => {
  onToastAdded(toast);
};

export const ToastRenderer = () => {
  const { addToast, removeToast, toasts } = useToastsState();

  useEffect(() => {
    onToastAdded = (toast: ToastOptions) => addToast(toast);
  }, [addToast]);

  return (
    <div className="fixed top-0 left-0 z-20 flex items-center w-full p-2 flex-col gap-2 h-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

type ToastProps = {
  onDismiss: () => void;
} & Toast;
const Toast = (toast: ToastProps) => {
  const borderColor = match(toast.severity)
    .with("default", undefined, () => "border-base-300!")
    .with("error", () => "border-error!")
    .with("success", () => "border-success!")
    .with("warning", () => "border-warning!")
    .exhaustive();

  const bgColor = match(toast.severity)
    .with("default", undefined, () => "bg-base-100")
    .with("error", () => "bg-error")
    .with("success", () => "bg-success")
    .with("warning", () => "bg-warning")
    .exhaustive();

  const iconColor = match(toast.severity)
    .with("default", undefined, () => "text-base-content")
    .with("error", () => "text-error-content")
    .with("success", () => "text-success-content")
    .with("warning", () => "text-warning-content")
    .exhaustive();
  return (
    <motion.div
      layout
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className={cn(
        "py-2 px-2 rounded-full shadow text-sm w-full backdrop-blur-2xl flex items-center gap-2 border!",
        borderColor,
        bgColor + "/45"
      )}
    >
      {toast.icon && (
        <div
          className={cn(
            "h-full p-1.5 rounded-full  aspect-square shadow-md ",
            bgColor,
            iconColor
          )}
        >
          {toast.icon}
        </div>
      )}
      <div className={cn("flex-grow", toast.icon ? "ml-0" : "ml-2")}>
        {toast.title ? (
          <h1 className={cn("text-sm font-bold")}>{toast.title}</h1>
        ) : null}
        <p className="text-xs">{toast.content}</p>
      </div>
      <XMarkIcon
        className="size-4 mr-2"
        role="button"
        onClick={toast.onDismiss}
      ></XMarkIcon>
    </motion.div>
  );
};
