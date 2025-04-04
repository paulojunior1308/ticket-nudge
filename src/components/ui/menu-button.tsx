"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen: boolean;
}

export function MenuButton({ isOpen, className, ...props }: MenuButtonProps) {
  return (
    <button
      className={cn(
        "relative h-10 w-10 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute left-2 top-4 block h-0.5 w-6 transform bg-current transition-all duration-300",
          isOpen ? "rotate-45" : "-translate-y-1.5"
        )}
      />
      <span
        className={cn(
          "absolute left-2 top-4 block h-0.5 w-6 transform bg-current transition-all duration-300",
          isOpen ? "opacity-0" : "opacity-100"
        )}
      />
      <span
        className={cn(
          "absolute left-2 top-4 block h-0.5 w-6 transform bg-current transition-all duration-300",
          isOpen ? "-rotate-45" : "translate-y-1.5"
        )}
      />
    </button>
  );
} 