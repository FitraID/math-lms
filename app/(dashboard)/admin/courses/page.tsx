import Link from "next/link"
import { adminGetCourses } from "@/lib/actions/admin"
import { Card } from "@/components/ui/8bit/card"
import { Separator } from "@/components/ui/8bit/separator"
import { Button } from "@/components/ui/8bit/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/8bit/breadcrumb"
import { CoursesTable } from "./courses-table"

import {
  BookOpen,
  Coins,
  ChartBar,
  CalendarPlus,
} from "@phosphor-icons/react/dist/ssr"

export default async function AdminCoursesPage() {
  const courses = await adminGetCourses()

  const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000
  const cutoffTimestamp = Date.now() - TWO_WEEKS_MS

  const recentCoursesCount = courses.filter((c) => {
    if (!c.createdAt) return false
    const createdTimestamp = new Date(c.createdAt).getTime()
    return createdTimestamp >= cutoffTimestamp
  }).length

  const totalXp = courses.reduce((sum, c) => sum + (c.xpReward || 0), 0)
  const averageXp =
    courses.length > 0 ? Math.round(totalXp / courses.length) : 0

  const stats = [
    {
      title: "Total Courses",
      value: courses.length,
      description: "All published courses",
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      title: "Total XP Available",
      value: totalXp,
      description: "Sum of all rewards",
      icon: Coins,
      color: "text-amber-500",
    },
    {
      title: "Average XP",
      value: averageXp,
      description: "Reward per course",
      icon: ChartBar,
      color: "text-green-500",
    },
    {
      title: "Recent Courses",
      value: recentCoursesCount,
      description: "Added in last 2 weeks",
      icon: CalendarPlus,
      color: "text-purple-500",
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
            <BreadcrumbPage>Courses</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}

      <div>
        <h1 className="text-xl font-black tracking-wider text-foreground uppercase">
          COURSES
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage training modules and materials
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
              Course Management
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Upload and manage PDF courses
            </p>
          </div>
          <Button size="sm">
            <Link href="/admin/courses/new">+ Add Course</Link>
          </Button>
        </div>

        <CoursesTable data={courses} />
      </Card>
    </div>
  )
}
