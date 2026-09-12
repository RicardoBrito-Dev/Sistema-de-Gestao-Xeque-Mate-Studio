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
          "bg-[#15803d] text-white hover:bg-[#166534] border border-white/10 active:scale-[0.98] shadow-sm",
        destructive:
          "bg-rose-950/70 text-rose-300 border border-rose-800/30 hover:bg-rose-900/80",
        outline:
          "border border-[#26262a] bg-[#111113] text-[#e4e4e7] hover:bg-[#18181b] hover:border-[#38383e]",
        secondary:
          "bg-[#18181b] text-[#d4d4d8] border border-[#27272a] hover:bg-[#222226] hover:text-white",
        ghost:
          "text-[#888] hover:text-white hover:bg-white/[0.04]",
        link:
          "text-[#22c55e] underline-offset-4 hover:underline",
        iconGhost:
          "text-[#71717a] hover:text-white hover:bg-white/[0.05] rounded-lg p-2 transition-colors",
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
