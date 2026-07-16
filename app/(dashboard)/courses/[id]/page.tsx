import { notFound } from "next/navigation"
import { getCourseWithProgress } from "@/lib/actions/courses"
import CourseDetailClient from "./course-detail-client"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getCourseWithProgress(id)

  if (!data) notFound()

  const { course, progress } = data

  return (
    <div className="h-full">
      <CourseDetailClient
        course={course}
        isCompleted={progress?.completed ?? false}
      />
    </div>
  )
}
