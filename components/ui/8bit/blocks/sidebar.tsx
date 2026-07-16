"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  SquaresFour,
  User,
  Gear,
  SignOut,
  CaretUp,
  BookOpen,
  Pencil,
  Medal,
  Skull,
  Shield,
} from "@phosphor-icons/react/dist/ssr"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/actions/auth"

import "@/components/ui/8bit/styles/retro.css"

const navItems = [
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: SquaresFour,
  },
  {
    name: "My Courses",
    url: "/courses",
    icon: BookOpen,
  },
  {
    name: "Quest",
    url: "/assignments",
    icon: Pencil,
  },
  // {
  //   name: "Dungeon",
  //   url: "/dungeon",
  //   icon: Skull,
  // },
  {
    name: "Leaderboard",
    url: "/leaderboard",
    icon: Medal,
  },
]

export function AppSidebar({ user }: { user: any }) {
  const pathname = usePathname()

  const adminNavItems = [
    { name: "Manage Courses", url: "/admin/courses", icon: BookOpen },
    { name: "Manage Quests", url: "/admin/quests", icon: Pencil },
    // { name: "Manage Dungeons", url: "/admin/dungeons", icon: Skull },
    { name: "Manage Users", url: "/admin/users", icon: User },
  ]

  const renderNavGroup = (items: typeof navItems, label: string) => (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-bold tracking-widest text-sidebar-foreground uppercase">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5 px-0 pt-0">
          {items.map((item) => {
            const isActive =
              pathname === item.url || pathname.startsWith(item.url + "/")
            const Icon = item.icon

            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  isActive={isActive}
                  className={cn(
                    "flex h-10 items-center gap-3 border-2 px-3 text-xs transition-all",
                    isActive
                      ? "translate-x-[-2px] translate-y-[-2px] border-foreground bg-sidebar-accent font-bold text-sidebar-accent-foreground shadow-[2px_2px_0px_0px_var(--foreground)] dark:border-ring dark:shadow-[2px_2px_0px_0px_var(--ring)]"
                      : "border-transparent text-sidebar-foreground/80 hover:border-foreground/30 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground dark:hover:border-ring/30"
                  )}
                >
                  <Link
                    href={item.url}
                    className="flex w-full items-center justify-start gap-1"
                  >
                    <Icon
                      size={16}
                      weight={isActive ? "fill" : "regular"}
                      className="shrink-0"
                    />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <Sidebar
      className={`${"retro"} border-r-4 border-foreground dark:border-ring`}
    >
      <SidebarHeader className="flex h-16 flex-row items-center gap-3 border-b-4 border-foreground px-6 dark:border-ring">
        <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground dark:border-ring">
          <div className="animate-bounce">👾</div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wider uppercase">
            MathLMS
          </span>
          <span className="text-[9px] tracking-widest text-muted-foreground uppercase">
            v1.0-engine
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderNavGroup(navItems, "NAVIGATION")}

        {user?.role === "ADMIN" && renderNavGroup(adminNavItems, "ADMIN PANEL")}
      </SidebarContent>

      <SidebarFooter className="border-t-4 border-foreground bg-sidebar/50 p-4 dark:border-ring">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-between border-2 border-foreground bg-sidebar px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_var(--foreground)] transition-transform hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_var(--foreground)] dark:border-ring dark:shadow-[2px_2px_0px_0px_var(--ring)] dark:hover:shadow-[4px_4px_0px_0px_var(--ring)]">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center border border-foreground bg-primary text-primary-foreground dark:border-ring">
                <User size={14} weight="fill" />
              </div>
              <span>{user?.name}</span>
            </div>
            <CaretUp size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top">
            <div className="flex flex-col">
              <DropdownMenuItem asChild>
                <Link
                  href="/user"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <User size={14} />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/user"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <Gear size={14} />
                  <span>Setting</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <form action={logout} className="w-full">
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center gap-2 text-destructive"
                  >
                    <SignOut size={14} />
                    <span>Logout</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
