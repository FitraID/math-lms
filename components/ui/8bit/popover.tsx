import type * as PopoverPrimitive from "@radix-ui/react-popover"
import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

import {
  Popover as ShadcnPopover,
  PopoverAnchor as ShadcnPopoverAnchor,
  PopoverContent as ShadcnPopoverContent,
  PopoverTrigger as ShadcnPopoverTrigger,
} from "@/components/ui/popover"

import "@/components/ui/8bit/styles/retro.css"

const Popover = ShadcnPopover

const PopoverTrigger = ShadcnPopoverTrigger

const PopoverAnchor = ShadcnPopoverAnchor

export const popOverVariants = cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro",
    },
  },
  defaultVariants: {
    font: "retro",
  },
})

export interface BitPopoverProps
  extends
    React.ComponentProps<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popOverVariants> {}

function PopoverContent({
  children,
  font,
  className,
  ...props
}: BitPopoverProps) {
  return (
    <ShadcnPopoverContent
      className={cn(
        "relative mt-1 rounded-none border-y-6 border-foreground bg-card dark:border-ring",
        font !== "normal" && "retro",
        className
      )}
      {...props}
    >
      {children}

      <div
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />
    </ShadcnPopoverContent>
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
