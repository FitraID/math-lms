import Link from "next/link"
import { adminGetQuests } from "@/lib/actions/admin"
import { Card } from "@/components/ui/8bit/card"
import { Button } from "@/components/ui/8bit/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/8bit/breadcrumb"
import { QuestsTable } from "./quests-table"

import { Target, Question, Sword, Coins } from "@phosphor-icons/react/dist/ssr"

export default async function AdminQuestsPage() {
  const quests = await adminGetQuests()

  const totalQuestions = quests.reduce(
    (sum, q) => sum + (q._count.questions || 0),
    0
  )
  const totalAttempts = quests.reduce(
    (sum, q) => sum + (q._count.attempts || 0),
    0
  )
  const totalXp = quests.reduce((sum, q) => sum + (q.xpReward || 0), 0)

  const stats = [
    {
      title: "Total Quests",
      value: quests.length,
      description: "All published quests",
      icon: Target,
      color: "text-rose-500",
    },
    {
      title: "Total Questions",
      value: totalQuestions,
      description: "Across all quests",
      icon: Question,
      color: "text-blue-500",
    },
    {
      title: "Total Attempts",
      value: totalAttempts,
      description: "From all operatives",
      icon: Sword,
      color: "text-emerald-500",
    },
    {
      title: "Total XP Available",
      value: totalXp,
      description: "Sum of all rewards",
      icon: Coins,
      color: "text-amber-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Quests</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}

      <div>
        <h1 className="text-xl font-black tracking-wider text-foreground uppercase">
          QUESTS
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage assessments and challenges
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="flex flex-row items-center justify-between p-4"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                {stat.title}
              </p>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">
                {stat.description}
              </p>
            </div>
            <stat.icon size={32} weight="duotone" className={stat.color} />
          </Card>
        ))}
      </div>

      <Card className="flex w-full flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-foreground uppercase">
              Quest Management
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Create and manage multiple choice quests
            </p>
          </div>
          <Button size="sm">
            <Link href="/admin/quests/new">+ Add Quest</Link>
          </Button>
        </div>

        <QuestsTable data={quests} />
      </Card>
    </div>
  )
}
