"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquaresFour,
  User,
  Sidebar as SidebarIcon,
  GameController,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  // const { activeTheme, setActiveTheme } = useThemeConfig()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: SquaresFour,
    },
    {
      name: "User Profile",
      href: "/user",
      icon: User,
    },
  ]

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar font-mono text-sidebar-foreground select-none">
      {/* Header / Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground/10 bg-primary text-primary-foreground">
          <GameController size={18} className="animate-bounce" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wider uppercase">
            Spatia Lab
          </span>
          <span className="text-[9px] tracking-widest text-muted-foreground uppercase">
            v1.0.0-alpha
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="mb-1 px-2 text-[10px] font-bold tracking-widest text-sidebar-foreground/50 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 border border-transparent px-3 text-xs transition-colors",
                isActive
                  ? "translate-x-[-2px] translate-y-[-2px] border-sidebar-border bg-sidebar-accent font-bold text-sidebar-accent-foreground shadow-[2px_2px_0px_0px_var(--sidebar-border)]"
                  : "text-sidebar-foreground/80 hover:border-sidebar-border/30 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
              )}
            >
              <Icon
                size={16}
                weight={isActive ? "fill" : "regular"}
                className="shrink-0"
              />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Theme Control Footer */}
      <div className="mt-auto flex flex-col gap-3 border-t border-sidebar-border bg-sidebar/50 p-4">
        {/* <div className="flex flex-col gap-1.5">
          <div className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest font-bold px-1">
            System Theme
          </div>
          <SelectThemeDropdown
            activeTheme={activeTheme}
            setActiveTheme={setActiveTheme}
          />
        </div> */}

        <div className="flex items-center justify-center gap-2 border border-sidebar-border/40 bg-sidebar-accent/10 p-2 text-[9px] text-sidebar-foreground/40">
          <kbd className="rounded-xs border border-sidebar-border bg-sidebar px-1.5 py-0.5 text-[8px] font-bold shadow-[1px_1px_0px_0px_var(--sidebar-border)]">
            D
          </kbd>
          <span>to toggle dark / light</span>
        </div>
      </div>
    </aside>
  )
}
