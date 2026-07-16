import Link from "next/link"
import { BookOpen, CheckCircle, Lock } from "@phosphor-icons/react/dist/ssr"
import { getCoursesWithProgress } from "@/lib/actions/courses"
import { Card } from "@/components/ui/8bit/card"
import { Badge } from "@/components/ui/8bit/badge"
import { Button } from "@/components/ui/8bit/button"
import { Separator } from "@/components/ui/8bit/separator"

export default async function CoursesPage() {
  const courses = await getCoursesWithProgress()

  const completedCount = courses.filter((c) => c.progress?.completed).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider text-foreground">
          MY COURSES
        </h1>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {completedCount}/{courses.length} modules completed · Each course grants +50 XP
        </p>
      </div>

      {courses.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-3xl mb-3">📚</div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            No courses available yet
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Check back later or contact your admin
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isCompleted = course.progress?.completed ?? false
            return (
              <Card key={course.id} className="flex flex-col p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-foreground bg-primary/10 text-lg dark:border-ring">
                    <BookOpen size={18} weight="fill" className="text-primary" />
                  </div>
                  {isCompleted ? (
                    <Badge variant="default" className="text-[9px]">
                      ✓ COMPLETED
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px]">
                      IN PROGRESS
                    </Badge>
                  )}
                </div>

                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                  {course.title}
                </h3>
                <p className="mt-1 flex-1 text-[10px] leading-relaxed text-muted-foreground">
                  {course.description}
                </p>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent">
                    +{course.xpReward} XP
                  </span>
                  <Link href={`/courses/${course.id}`}>
                    <Button size="sm" variant={isCompleted ? "outline" : "default"}>
                      {isCompleted ? "REVIEW" : "START →"}
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
