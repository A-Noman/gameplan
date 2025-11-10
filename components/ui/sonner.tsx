"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

export const Toaster = () => (
  <SonnerToaster
    position="top-right"
    richColors
    toastOptions={{
      duration: 4000,
      classNames: {
        toast: "bg-background border shadow-lg",
      },
    }}
  />
);

export const toast = sonnerToast;

