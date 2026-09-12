"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060606] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white shadow-lg shadow-[#16a34a]/20 hover:from-[#22c55e] hover:to-[#16a34a] active:shadow-none border border-white/10",
        destructive:
          "bg-gradient-to-r from-[#E74C3C] to-[#C0392B] text-white shadow-lg shadow-[#E74C3C]/20 hover:from-[#ec5e50] hover:to-[#E74C3C]",
        outline:
          "border border-[#2a2a2a] bg-transparent text-[#F0F0F0] hover:bg-white/[0.04] hover:border-[#3a3a3a]",
        secondary:
          "bg-[#151518] text-[#D1D1D6] border border-[#26262a] hover:bg-[#1f1f23] hover:text-white",
        ghost:
          "text-[#888] hover:text-white hover:bg-white/[0.05]",
        link:
          "text-[#4ade80] underline-offset-4 hover:underline",
        iconGhost:
          "text-[#666] hover:text-[#4ade80] hover:bg-[#16a34a]/10 rounded-lg p-2 transition-colors",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-9 w-9 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  animated?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, animated = true, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      )
    }

    if (animated) {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref as any}
          {...(props as any)}
        />
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
