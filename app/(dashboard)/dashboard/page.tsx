import { Button } from "@/components/ui/8bit/button"
import { Card } from "@/components/ui/8bit/card"
import { Badge } from "@/components/ui/8bit/badge"

import {
  Trophy,
  Lightning,
  ChartLineUp,
  BookOpen,
  Sword,
} from "@phosphor-icons/react/dist/ssr"
import XpBar from "@/components/ui/8bit/xp-bar"
import { Separator } from "@/components/ui/8bit/separator"

export default function DashboardPage() {
  const stats = [
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

  const activeQuests = [
    {
      title: "Solve Quadratic Equations",
      reward: "150 XP",
      category: "ALGEBRA",
      progress: 60,
    },
    {
      title: "Mastering Trigonometry",
      reward: "100 XP",
      category: "GEOMETRY",
      progress: 100,
      completed: true,
    },
    {
      title: "Calculus: Derivatives",
      reward: "200 XP",
      category: "CALCULUS",
      progress: 25,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Title & Introduction */}
      <div>
        <h1 className="text-2xl font-black tracking-wider text-foreground uppercase">
          MATH DASHBOARD // OVERVIEW
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Welcome back, student. Here is your math learning status and
          progression tracking.
        </p>
      </div>

      {/* Grid of Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
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

      {/* Main Panel and Side Widgets */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left main area: Active Quests */}
        <Card className="p-5 md:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
              <Sword size={16} /> Pending Assignments
            </h2>
            <Badge>3 ASSIGNED</Badge>
          </div>

          <div className="space-y-4">
            {activeQuests.map((quest, index) => (
              <Card
                key={index}
                className="flex flex-col gap-2 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-primary/10 dark:hover:bg-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="cursor-pointer text-xs font-bold text-foreground hover:underline">
                      {quest.title}
                    </span>
                    <span className="mt-0.5 text-[8px] tracking-wider text-muted-foreground uppercase">
                      Category: {quest.category}
                    </span>
                  </div>
                  <Badge variant={"secondary"}>{quest.reward}</Badge>
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="space-y-1">
                    <div className="mb-2 flex items-center justify-between text-[8px] font-bold text-muted-foreground">
                      <span>Progress</span>
                      <span>{quest.progress}%</span>
                    </div>
                    <XpBar value={quest.progress} levelUpMessage="COMPLETED" />
                  </div>

                  {quest.completed && (
                    <div className="mt-3 flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Assignment completed! Claim your reward.
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="shadow-[2px_2px_0px_0px_var(--border)]"
            >
              View All Assignments
            </Button>
          </div>
        </Card>

        {/* Right side area: Quick Actions & Help */}
        <div className="flex flex-col gap-6">
          <Card className="px-5">
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
              <BookOpen size={16} /> Math Resources
            </h2>
            <Separator className="mb-3" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Explore custom-curated paths on algebra, geometry, calculus, and
              statistics.
            </p>
            <div className="mt-4 space-y-4">
              <Button className="w-full">Launch Lesson 1</Button>
              <Button variant="outline" className="w-full">
                Browse Library
              </Button>
            </div>
          </Card>

          <Card className="flex flex-1 flex-col justify-between p-4 text-[11px] text-muted-foreground">
            <div>
              <h2 className="mb-3 block font-bold tracking-wider text-foreground uppercase">
                👾 EXTRA_CREDIT_BONUS
              </h2>
              <Separator className="mb-5" />
              Unlock exclusive math badges by finishing assignments! Each
              completed module increases your chance of acquiring legendary
              badges.
            </div>
            <div className="mt-4 pt-3 text-center text-[9px] italic">
              <Separator className="mb-5" />
              Current drop rate: +15.5% (Lucky status active)
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
