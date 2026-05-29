"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToastStore, type ToastType } from "@/stores/toast-store";

const icons: Record<ToastType, typeof Info> = { success: CheckCircle2, error: XCircle, info: Info };
const colors: Record<ToastType, string> = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-error/30 bg-error/10 text-error",
  info: "border-accent/30 bg-accent/10 text-accent",
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-50 flex flex-col gap-2 lg:bottom-6" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.22 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-control border px-4 py-3 shadow-soft backdrop-blur-xl ${colors[toast.type]}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">{toast.message}</span>
              <button type="button" onClick={() => removeToast(toast.id)} className="ml-2 opacity-60 hover:opacity-100" aria-label="Dismiss">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
