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
import { adminDeleteCourse } from "@/lib/actions/admin"
import { toast as sonnerToast } from "sonner"
import { toast } from "@/components/ui/8bit/toast"
import Link from "next/link"

export type CourseData = {
  id: string
  title: string
  description: string
  pdfUrl: string
  xpReward: number
}

const columns: ColumnDef<CourseData>[] = [
  {
    accessorKey: "title",
    header: "Course",
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
    accessorKey: "xpReward",
    header: "Reward",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[9px]">
        +{row.original.xpReward} XP
      </Badge>
    ),
  },
  {
    accessorKey: "pdfUrl",
    header: "PDF",
    cell: ({ row }) => (
      <a
        href={row.original.pdfUrl}
        target="_blank"
        rel="noreferrer"
        className="text-[10px] font-bold text-primary hover:underline"
      >
        VIEW PDF
      </a>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const course = row.original
      return <CourseActions course={course} />
    },
  },
]

function CourseActions({ course }: { course: CourseData }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await adminDeleteCourse(course.id)
      if (!result.success) {
        sonnerToast.error(result.success)
      } else {
        toast("Course deleted successfully")
        setOpen(false)
      }
    } catch (e: any) {
      sonnerToast.error(e.message || "Failed to delete course")
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
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {course.title}? This action cannot
              be undone.
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

export function CoursesTable({ data }: { data: CourseData[] }) {
  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search courses..."
      />
    </div>
  )
}
