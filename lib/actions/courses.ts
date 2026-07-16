"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "./auth"

export async function getCourses() {
  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
  })
  return courses
}

export async function getCourseWithProgress(courseId: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })
  if (!course) return null

  const progress = await prisma.courseProgress.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  return { course, progress, user }
}

export async function completeCourse(courseId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) return { error: "Course not found" }

  // Upsert progress
  const existing = await prisma.courseProgress.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  if (existing?.completed) {
    return { alreadyCompleted: true }
  }

  await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { completed: true, completedAt: new Date() },
    create: {
      userId: user.id,
      courseId,
      completed: true,
      completedAt: new Date(),
    },
  })

  // Add XP to user
  await prisma.user.update({
    where: { id: user.id },
    data: { totalXp: { increment: course.xpReward } },
  })

  return { success: true, xpEarned: course.xpReward }
}

export async function getCoursesWithProgress() {
  const user = await getCurrentUser()
  if (!user) return []

  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: {
      progresses: {
        where: { userId: user.id },
      },
    },
  })

  return courses.map((course) => ({
    ...course,
    progress: course.progresses[0] ?? null,
  }))
}
