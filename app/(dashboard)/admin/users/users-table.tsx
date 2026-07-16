"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/8bit/badge"
import { Button } from "@/components/ui/8bit/button"
import { DataTable } from "@/components/data-table"
import { Pencil, Trash } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/8bit/dialog"
import { adminDeleteUser } from "@/lib/actions/admin"
import { toast as sonnerToast } from "sonner"
import { toast } from "@/components/ui/8bit/toast"

export type UserData = {
  id: string
  name: string | null
  email: string
  role: string
  totalXp: number
  _count: {
    courseProgresses: number
    questAttempts: number
    dungeonAttempts: number
  }
}

export const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: "index",
    header: "#",
    cell: ({ row }) => (
      <div className="text-[10px] font-medium text-muted-foreground">
        {row.index + 1}
      </div>
    ),
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const name = row.original.name
      const email = row.original.email
      return (
        <div>
          <p className="text-xs font-bold text-foreground">{name ?? "—"}</p>
          <p className="text-[9px] text-muted-foreground">{email}</p>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return (
        row.original.email.toLowerCase().includes(value.toLowerCase()) ||
        (row.original.name ?? "").toLowerCase().includes(value.toLowerCase())
      )
    },
  },
  {
    accessorKey: "totalXp",
    header: "Experience",
    cell: ({ row }) => {
      return (
        <span className="text-[10px] font-bold text-accent">
          {row.original.totalXp} XP
        </span>
      )
    },
  },
  {
    accessorKey: "stats",
    header: "Stats",
    cell: ({ row }) => {
      const count = row.original._count
      return (
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-[9px]">
            {count.courseProgresses} courses
          </Badge>
          <Badge variant="outline" className="text-[9px]">
            {count.questAttempts} quests
          </Badge>
          <Badge variant="outline" className="text-[9px]">
            {count.dungeonAttempts} dungeons
          </Badge>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const user = row.original
      return <UserActions user={user} />
    },
  },
]

function UserActions({ user }: { user: UserData }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await adminDeleteUser(user.id)
      if (result.error) {
        sonnerToast.error(result.error)
      } else {
        toast("User deleted successfully")
        setOpen(false)
      }
    } catch (e: any) {
      sonnerToast.error(e.message || "Failed to delete user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-end gap-2 text-right">
      <Button size="icon" variant="outline" className="h-8 w-8 text-primary">
        <Link href={`/admin/users/${user.id}/edit`}>
          <Pencil weight="fill" size={14} />
        </Link>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-destructive text-destructive"
          >
            <Trash weight="fill" size={14} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Operative</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {user.name || user.email}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function UsersTable({ data }: { data: UserData[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="user"
      searchPlaceholder="Filter users by name or email..."
    />
  )
}
