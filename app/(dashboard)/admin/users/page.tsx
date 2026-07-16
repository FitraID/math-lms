import { adminGetUsers, adminSetUserRole } from "@/lib/actions/admin"
import { Card } from "@/components/ui/8bit/card"
import { Badge } from "@/components/ui/8bit/badge"
import { Separator } from "@/components/ui/8bit/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/8bit/breadcrumb"
import { Button } from "@/components/ui/8bit/button"
import { UsersTable } from "./users-table"
import Link from "next/link"

import {
  User,
  UserGear,
  ChartLineUp,
  UserCheck,
} from "@phosphor-icons/react/dist/ssr"
export default async function AdminUsersPage() {
  const users = await adminGetUsers()
  console.log(users)

  const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000
  const cutoffTimestamp = Date.now() - TWO_WEEKS_MS

  const UsersCreatedTwoWeeksAgo = users.filter((u) => {
    if (u.role !== "USER" || !u.createdAt) return false

    const userCreatedTimestamp = new Date(u.createdAt).getTime()

    return userCreatedTimestamp <= cutoffTimestamp
  })
  const adminUser = users.filter(
    (u) => u.role === "ADMIN" && u.createdAt
  ).length
  const regularUser = users.filter((u) => u.role === "USER").length
  const recentUser = UsersCreatedTwoWeeksAgo.length

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      description: "All user Sumed Up",
      icon: User,
      color: "text-amber-500",
    },
    {
      title: "Admin Users",
      value: adminUser,
      description: "App's Admins",
      icon: UserGear,
      color: "text-rose-500",
    },
    {
      title: "Regular Users",
      value: regularUser,
      description: "App's Users",
      icon: UserCheck,
      color: "text-yellow-500",
    },
    {
      title: "Recent Users",
      value: recentUser,
      description: "User joined in this 2 weeks",
      icon: ChartLineUp,
      color: "text-emerald-500",
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
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}

      <div>
        <h1 className="text-xl font-black tracking-wider text-foreground uppercase">
          USERS
        </h1>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {users.length} operatives enrolled
        </p>
      </div>
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
              <div className="mb-2">
                <span className="text-2xl font-extrabold tracking-tight">
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
      <Card className="flex w-full flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase">
              User Management
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Manage operatives roles and permissions
            </p>
          </div>
          <Button size="sm">
            <Link href="/admin/users/add">+ Add User</Link>
          </Button>
        </div>

        <UsersTable data={users} />
      </Card>
    </div>
  )
}
