"use client";

import React, { useEffect, useState } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
}

const toastStyles = {
  success: {
    icon: CheckCircle2,
    className: "bg-green-50 border-green-200",
    iconClassName: "text-green-600",
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-50 border-red-200",
    iconClassName: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-50 border-yellow-200",
    iconClassName: "text-yellow-600",
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200",
    iconClassName: "text-blue-600",
  },
};

export const Toast: React.FC<ToastProps> = ({
  type = "info",
  title,
  description,
  duration = 5000,
  onClose,
}) => {
  const [open, setOpen] = useState(true);
  const style = toastStyles[type];
  const Icon = style.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setOpen(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        style.className
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 shrink-0", style.iconClassName)} />
        <div className="grid gap-1">
          <ToastPrimitive.Title className="text-sm font-semibold">
            {title}
          </ToastPrimitive.Title>
          {description && (
            <ToastPrimitive.Description className="text-sm opacity-90">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
      </div>
      <ToastPrimitive.Close
        className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:bg-black/10 focus:opacity-100 group-hover:opacity-100"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = ToastPrimitive.Viewport;
