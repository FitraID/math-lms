"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/8bit/badge"
import { Button } from "@/components/ui/8bit/button"
import { DataTable } from "@/components/data-table"
import { Trash } from "@phosphor-icons/react/dist/ssr"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/8bit/dialog"
import { adminDeleteQuest } from "@/lib/actions/admin"
import { toast as sonnerToast } from "sonner"
import { toast } from "@/components/ui/8bit/toast"

export type QuestData = {
  id: string
  title: string
  description: string
  xpReward: number
  _count: {
    questions: number
    attempts: number
  }
}

const columns: ColumnDef<QuestData>[] = [
  {
    accessorKey: "title",
    header: "Quest",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-foreground">{row.original.title}</span>
        <span className="line-clamp-1 text-xs text-muted-foreground">
          {row.original.description}
        </span>
      </div>
    ),
  },
  {
    id: "questions",
    header: "Questions",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[9px]">
        {row.original._count.questions} Q
      </Badge>
    ),
  },
  {
    id: "attempts",
    header: "Attempts",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[9px]">
        {row.original._count.attempts} attempts
      </Badge>
    ),
  },
  {
    accessorKey: "xpReward",
    header: "Reward",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[9px]">
        +{row.original.xpReward} XP
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const quest = row.original
      return <QuestActions quest={quest} />
    },
  },
]

function QuestActions({ quest }: { quest: QuestData }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await adminDeleteQuest(quest.id)
      if (!result.success) {
        sonnerToast.error(result.success)
      } else {
        toast("Quest deleted successfully")
        setOpen(false)
      }
    } catch (e: any) {
      sonnerToast.error(e.message || "Failed to delete quest")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-end gap-2 text-right">
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
            <DialogTitle>Delete Quest</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {quest.title}? This action cannot
              be undone and will delete all associated questions.
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

export function QuestsTable({ data }: { data: QuestData[] }) {
  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search quests..."
      />
    </div>
  )
}
