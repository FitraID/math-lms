import type * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

import {
  DropdownMenu as ShadcnDropdownMenu,
  DropdownMenuCheckboxItem as ShadcnDropdownMenuCheckboxItem,
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuGroup as ShadcnDropdownMenuGroup,
  DropdownMenuItem as ShadcnDropdownMenuItem,
  DropdownMenuLabel as ShadcnDropdownMenuLabel,
  DropdownMenuPortal as ShadcnDropdownMenuPortal,
  DropdownMenuSeparator as ShadcnDropdownMenuSeparator,
  DropdownMenuShortcut as ShadcnDropdownMenuShortcut,
  DropdownMenuSub as ShadcnDropdownMenuSub,
  DropdownMenuSubContent as ShadcnDropdownMenuSubContent,
  DropdownMenuSubTrigger as ShadcnDropdownMenuSubTrigger,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import "@/components/ui/8bit/styles/retro.css"

const DropdownMenu = ShadcnDropdownMenu

const DropdownMenuPortal = ShadcnDropdownMenuPortal

const DropdownMenuTrigger = ShadcnDropdownMenuTrigger

const DropdownMenuGroup = ShadcnDropdownMenuGroup

const DropdownMenuLabel = ShadcnDropdownMenuLabel

const DropdownMenuSeparator = ShadcnDropdownMenuSeparator

const DropdownMenuShortcut = ShadcnDropdownMenuShortcut

const DropdownMenuSub = ShadcnDropdownMenuSub

const DropdownMenuCheckboxItem = ShadcnDropdownMenuCheckboxItem

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuSubTrigger>) {
  return (
    <ShadcnDropdownMenuSubTrigger
      className={cn(
        "rounded-none border-y-4 border-dashed border-transparent bg-transparent hover:border-foreground hover:bg-transparent focus:border-foreground focus:bg-transparent active:bg-transparent data-[state=open]:border-foreground data-[state=open]:bg-transparent dark:focus:border-ring dark:data-[state=open]:border-ring",
        className
      )}
      {...props}
    >
      {children}
    </ShadcnDropdownMenuSubTrigger>
  )
}

function DropdownMenuItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ShadcnDropdownMenuItem
      className={cn(
        "rounded-none border-y-3 border-dashed border-transparent bg-transparent hover:border-foreground hover:bg-transparent focus:border-foreground focus:bg-transparent active:bg-transparent dark:focus:border-ring",
        className
      )}
    >
      {children}
    </ShadcnDropdownMenuItem>
  )
}

export const dropDownVariants = cva("", {
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

function DropdownMenuSubContent({
  children,
  className,
  font,
  ...props
}: BitDropownMenuSubContentProps) {
  return (
    <ShadcnDropdownMenuSubContent
      {...props}
      className={cn("bg-popover", font !== "normal" && "retro", className)}
    >
      {children}

      <div
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -my-1.5 border-y-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />
    </ShadcnDropdownMenuSubContent>
  )
}

export interface BitDropownMenuSubContentProps
  extends
    React.ComponentProps<typeof ShadcnDropdownMenuSubContent>,
    VariantProps<typeof dropDownVariants> {}

export interface BitDropownMenuContentProps
  extends
    React.ComponentProps<typeof DropdownMenuPrimitive.Content>,
    VariantProps<typeof dropDownVariants> {}

function DropdownMenuContent({
  children,
  font,
  className,
  ...props
}: BitDropownMenuContentProps) {
  return (
    <ShadcnDropdownMenuContent
      className={cn("mt-1 py-2", font !== "normal" && "retro", className)}
      {...props}
    >
      {children}

      <div
        className="pointer-events-none absolute inset-0 -mx-1.5 mt-2.5 border-x-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -my-1.5 mt-1 border-y-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />
    </ShadcnDropdownMenuContent>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
}
