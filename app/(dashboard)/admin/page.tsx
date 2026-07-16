import Link from "next/link"
import {
  adminGetUsers,
  adminGetCourses,
  adminGetQuests,
  adminGetDungeons,
} from "@/lib/actions/admin"
import { Card } from "@/components/ui/8bit/card"
import { Separator } from "@/components/ui/8bit/separator"

import {
  Trophy,
  Lightning,
  ChartLineUp,
  BookOpen,
  Sword,
} from "@phosphor-icons/react/dist/ssr"

export default async function AdminDashboard() {
  const [users, courses, quests, dungeons] = await Promise.all([
    adminGetUsers(),
    adminGetCourses(),
    adminGetQuests(),
    adminGetDungeons(),
  ])

  const stats1 = [
    {
      title: "MATH LEVEL",
      value: "LVL 42",
      description: "2,450 / 3,000 XP",
      icon: Trophy,
      color: "text-amber-500",
    },
    {
      title: "PENDING ASSIGNMENTS",
      value: "5 ACTIVE",
      description: "2 completed today",
      icon: Sword,
      color: "text-rose-500",
    },
    {
      title: "STUDY STREAK",
      value: "14 DAYS",
      description: "Personal best: 21 days",
      icon: Lightning,
      color: "text-yellow-500",
    },
    {
      title: "SYLLABUS PROGRESS",
      value: "84%",
      description: "+4.2% since yesterday",
      icon: ChartLineUp,
      color: "text-emerald-500",
    },
  ]

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: "👾",
      href: "/admin/users",
    },
    {
      label: "Courses",
      value: courses.length,
      icon: "📚",
      href: "/admin/courses",
    },
    {
      label: "Quests",
      value: quests.length,
      icon: "⚔️",
      href: "/admin/quests",
    },
    {
      label: "Dungeons",
      value: dungeons.length,
      icon: "🏰",
      href: "/admin/dungeons",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black tracking-wider text-foreground uppercase">
          ADMIN DASHBOARD
        </h1>
        <p className="mt-1 text-[10px] text-muted-foreground">
          System overview — MathLMS Pixel Academy
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats1.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="relative p-4">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  {stat.title}
                </span>
                <Icon className={`${stat.color} size-5`} />
              </div>
              <div className="mt-2">
                <span className="text-xl font-extrabold tracking-tight">
                  {stat.value}
                </span>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-4 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
              <p className="text-2xl">{stat.icon}</p>
              <p className="mt-2 text-2xl font-black text-foreground">
                {stat.value}
              </p>
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                {stat.label}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <Separator />

      {/* Top users by XP */}
      <div>
        <h2 className="mb-3 text-xs font-bold tracking-wider uppercase">
          Top Operatives (by XP)
        </h2>
        <div className="space-y-2">
          {users.slice(0, 5).map((u, idx) => (
            <div
              key={u.id}
              className="flex items-center justify-between border-b border-border pb-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-black text-muted-foreground">
                  #{idx + 1}
                </span>
                <span className="font-bold text-foreground">
                  {u.name ?? u.email}
                </span>
                {u.role === "ADMIN" && (
                  <span className="text-[9px] font-bold text-primary">
                    [ADMIN]
                  </span>
                )}
              </div>
              <span className="font-bold text-accent">{u.totalXp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
