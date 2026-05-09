"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

// Convertimos a un motion component para soportar props de framer-motion como whileHover
const Button = React.forwardRef<HTMLButtonElement, ButtonProps & HTMLMotionProps<"button">>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-gradient-to-r from-brand-primary to-emerald-700 text-white shadow-md hover:shadow-lg": variant === "default",
            "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg": variant === "destructive",
            "border border-slate-200/50 glass hover:bg-slate-50/50 hover:text-slate-900": variant === "outline",
            "bg-gradient-to-r from-brand-secondary to-amber-500 text-white shadow-md hover:shadow-lg": variant === "secondary",
            "hover:bg-slate-100/50 hover:text-slate-900": variant === "ghost",
            "text-brand-primary underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
