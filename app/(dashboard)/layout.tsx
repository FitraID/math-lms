import { AppSidebar } from "@/components/ui/8bit/blocks/sidebar"
// import { Sidebar } from "@/components/sidebar"
import { Bell } from "@phosphor-icons/react/dist/ssr"
import { RetroModeSwitcher } from "@/components/ui/retro-mode-switcher"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/8bit/popover"
import { Button } from "@/components/ui/8bit/button"

const notifications = [
  {
    id: 1,
    title: "Notification 1",
    desc: "Lorem ipsum dolor sit amet",
    time: "10m",
  },
  {
    id: 2,
    title: "Notification 2",
    desc: "Consectetur adipiscing elit",
    time: "1h",
  },
  { id: 3, title: "Notification 3", desc: "Sed do eiusmod tempor", time: "2h" },
  {
    id: 4,
    title: "Notification 4",
    desc: "Incididunt ut labore et",
    time: "1d",
  },
  { id: 5, title: "Notification 5", desc: "Dolore magna aliqua", time: "2d" },
]

import { getCurrentUser } from "@/lib/actions/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-mono text-foreground">
      {/* Left Sidebar */}
      <AppSidebar user={user} />
      {/* <Sidebar /> */}

      {/* Right Content Area */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              SYSTEM ONLINE / PIXEL_CORE_READY
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* <Popover>
              <PopoverTrigger className="relative flex h-8 w-8 items-center justify-center border-2 border-foreground bg-background shadow-[2px_2px_0px_0px_var(--border)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_var(--border)] dark:shadow-[2px_2px_0px_0px_var(--ring)] dark:hover:shadow-[4px_4px_0px_0px_var(--ring)]">
                <Bell size={16} weight="fill" />
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  5
                </span>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="border-b-2 border-foreground bg-muted p-3 dark:border-ring">
                  <h4 className="text-xs font-bold tracking-wider uppercase">
                    Notifications
                  </h4>
                </div>
                <div className="flex max-h-[300px] flex-col overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex flex-col gap-1 border-b border-border p-3 last:border-0 hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{notif.title}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {notif.time}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {notif.desc}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-foreground px-5 py-3 dark:border-ring">
                  <Button className="w-full">SEE MORE</Button>
                </div>
              </PopoverContent>
            </Popover> */}
            <RetroModeSwitcher />
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
