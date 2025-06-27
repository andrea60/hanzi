import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { match } from "ts-pattern";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

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

const toastsAtom = atom<Toast[]>([]);

let onToastAdded: (toasts: ToastOptions) => void;

export const showToast = (toast: ToastOptions) => {
  onToastAdded(toast);
};

export const ToastRenderer = () => {
  const [toasts, setToasts] = useAtom(toastsAtom);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    onToastAdded = (toast: ToastOptions) => {
      const id = `toast-${lastKnownId++}`;
      setToasts((prev) => [{ ...toast, id }, ...prev]);

      if (toast.type === "sticky") return;
      setTimeout(() => removeToast(id), toast.duration ?? 5000);
    };
  }, []);

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
      <div
        className={cn(
          "h-full p-1.5 rounded-full  aspect-square shadow-md ",
          bgColor,
          iconColor
        )}
      >
        {toast.icon}
      </div>
      <div className="flex-grow">
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
