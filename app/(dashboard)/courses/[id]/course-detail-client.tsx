"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Trophy } from "@phosphor-icons/react"
import { completeCourse } from "@/lib/actions/courses"
import { Button } from "@/components/ui/8bit/button"
import { Badge } from "@/components/ui/8bit/badge"
import { Card } from "@/components/ui/8bit/card"
import { Separator } from "@/components/ui/8bit/separator"

interface CourseDetailClientProps {
  course: {
    id: string
    title: string
    description: string
    pdfUrl: string
    xpReward: number
  }
  isCompleted: boolean
}

export default function CourseDetailClient({ course, isCompleted }: CourseDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [completed, setCompleted] = useState(isCompleted)
  const [xpEarned, setXpEarned] = useState<number | null>(null)

  function handleComplete() {
    startTransition(async () => {
      const result = await completeCourse(course.id)
      if (result.success) {
        setCompleted(true)
        setXpEarned(result.xpEarned ?? null)
      }
      if (result.alreadyCompleted) {
        setCompleted(true)
      }
    })
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <h1 className="text-lg font-black uppercase tracking-wider text-foreground">
            {course.title}
          </h1>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {course.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge variant="outline" className="text-[9px]">
            +{course.xpReward} XP
          </Badge>
          {completed && (
            <Badge variant="default" className="text-[9px]">
              ✓ COMPLETED
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* XP Toast */}
      {xpEarned !== null && (
        <Card className="flex items-center gap-3 border-accent/50 bg-accent/10 p-3">
          <Trophy size={20} className="shrink-0 text-accent" weight="fill" />
          <p className="text-xs font-bold text-foreground">
            +{xpEarned} XP Earned! Course marked as complete.
          </p>
        </Card>
      )}

      {/* PDF Viewer */}
      <div className="flex-1 min-h-[60vh]">
        <div className="h-full border-2 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] dark:border-ring dark:shadow-[4px_4px_0px_0px_var(--ring)]">
          <iframe
            src={`${course.pdfUrl}#toolbar=1&navpanes=0`}
            className="h-full w-full min-h-[60vh]"
            title={course.title}
          />
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleComplete}
          disabled={completed || isPending}
          variant={completed ? "outline" : "default"}
          className="gap-2"
        >
          <CheckCircle size={14} weight={completed ? "fill" : "regular"} />
          {isPending
            ? "SAVING..."
            : completed
            ? "COURSE COMPLETED ✓"
            : "MARK AS COMPLETE"}
        </Button>
      </div>
    </div>
  )
}
