// src\components\ui\badge.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",

        // ✅ Custom status variants
        "status-active": "bg-green-200  text-green-900 dark:bg-green-900 dark:text-green-200",
        "status-inactive": "bg-red-200  text-red-900 dark:bg-red-900 dark:text-red-200",

        "status-pending": "bg-yellow-200  text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200",
        "status-processing": "bg-blue-200  text-blue-900 dark:bg-blue-900 dark:text-blue-200",
        "status-shipped": "bg-purple-200  text-purple-900 dark:bg-purple-900 dark:text-purple-200",
        "status-delivered": "bg-green-200  text-green-900 dark:bg-green-900 dark:text-green-200",
        "status-cancelled": "bg-red-200  text-red-900 dark:bg-red-900 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);


function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
