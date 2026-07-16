"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "./auth"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin only")
  }
  return user
}

// ── Courses ───────────────────────────────────────────────────────────────────
export async function adminCreateCourse(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const xpReward = parseInt(formData.get("xpReward") as string) || 50
  const file = formData.get("pdf") as File

  if (!file || file.size === 0) return { error: "PDF file is required" }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  if (!buckets?.find(b => b.name === "course-pdfs")) {
    await supabaseAdmin.storage.createBucket("course-pdfs", { public: true })
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from("course-pdfs")
    .upload(fileName, file, { contentType: "application/pdf" })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabaseAdmin.storage
    .from("course-pdfs")
    .getPublicUrl(fileName)

  const course = await prisma.course.create({
    data: {
      title,
      description,
      pdfUrl: urlData.publicUrl,
      xpReward,
    },
  })

  return { success: true, course }
}

export async function adminDeleteCourse(courseId: string) {
  await requireAdmin()
  await prisma.course.delete({ where: { id: courseId } })
  return { success: true }
}

export async function adminGetCourses() {
  await requireAdmin()
  return prisma.course.findMany({ orderBy: { order: "asc" } })
}

// ── Quests ────────────────────────────────────────────────────────────────────
export async function adminGetQuests() {
  await requireAdmin()
  return prisma.quest.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true, attempts: true } } },
  })
}

export async function uploadQuestImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin()

  const file = formData.get("file") as File
  if (!file || file.size === 0) return { error: "No file provided" }

  // Ensure bucket exists
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  if (!buckets?.find(b => b.name === "quest-images")) {
    await supabaseAdmin.storage.createBucket("quest-images", { public: true })
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`
  const { error: uploadError } = await supabaseAdmin.storage
    .from("quest-images")
    .upload(fileName, file, { contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabaseAdmin.storage
    .from("quest-images")
    .getPublicUrl(fileName)

  return { url: urlData.publicUrl }
}

export async function adminCreateQuest(data: {
  title: string
  description: string
  xpReward: number
  timeLimitSeconds: number
  questPoint: number
  questions: Array<{
    text: string
    imageUrl?: string
    type: string // "MULTIPLE_CHOICE" | "DRAG_DROP"
    choices: Array<{
      text: string
      imageUrl?: string
      isCorrect: boolean
      dropX?: number
      dropY?: number
    }>
  }>
}) {
  await requireAdmin()

  const quest = await prisma.quest.create({
    data: {
      title: data.title,
      description: data.description,
      xpReward: data.xpReward,
      timeLimitSeconds: data.timeLimitSeconds,
      questPoint: data.questPoint,
      questions: {
        create: data.questions.map((q, qi) => ({
          text: q.text,
          imageUrl: q.imageUrl || null,
          type: q.type,
          order: qi,
          choices: {
            create: q.choices.map((c, ci) => ({
              text: c.text,
              imageUrl: c.imageUrl || null,
              isCorrect: c.isCorrect,
              order: ci,
              dropX: c.dropX ?? null,
              dropY: c.dropY ?? null,
            })),
          },
        })),
      },
    },
  })

  return { success: true, quest }
}

export async function adminDeleteQuest(questId: string) {
  await requireAdmin()
  await prisma.quest.delete({ where: { id: questId } })
  return { success: true }
}

// ── Dungeons ──────────────────────────────────────────────────────────────────
export async function adminGetDungeons() {
  await requireAdmin()
  return prisma.dungeon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true, attempts: true } } },
  })
}

export async function adminCreateDungeon(data: {
  title: string
  description: string
  difficulty: string
  timeLimitSeconds: number
  xpReward: number
  questions: Array<{
    text: string
    choices: Array<{ text: string; isCorrect: boolean }>
  }>
}) {
  await requireAdmin()

  const dungeon = await prisma.dungeon.create({
    data: {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      timeLimitSeconds: data.timeLimitSeconds,
      xpReward: data.xpReward,
      questions: {
        create: data.questions.map((q, qi) => ({
          text: q.text,
          order: qi,
          choices: {
            create: q.choices.map((c, ci) => ({
              text: c.text,
              isCorrect: c.isCorrect,
              order: ci,
            })),
          },
        })),
      },
    },
  })

  return { success: true, dungeon }
}

export async function adminDeleteDungeon(dungeonId: string) {
  await requireAdmin()
  await prisma.dungeon.delete({ where: { id: dungeonId } })
  return { success: true }
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function adminGetUsers() {
  await requireAdmin()
  return prisma.user.findMany({
    orderBy: { totalXp: "desc" },
    include: {
      _count: { select: { courseProgresses: true, questAttempts: true, dungeonAttempts: true } },
    },
  })
}

export async function adminSetUserRole(userId: string, role: "USER" | "ADMIN") {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/admin/users")
  return { success: true }
}

export async function adminCreateUser(formData: FormData) {
  await requireAdmin()
  
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = (formData.get("role") as "USER" | "ADMIN") || "USER"
  const totalXp = parseInt(formData.get("totalXp") as string) || 0
  
  // 1. Create in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  })
  
  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create user in Auth" }
  }
  
  // 2. Create in Prisma
  await prisma.user.create({
    data: {
      id: authData.user.id,
      email,
      name,
      role,
      totalXp
    }
  })
  
  revalidatePath("/admin/users")
  return { success: true }
}

export async function adminUpdateUser(userId: string, formData: FormData) {
  await requireAdmin()
  
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string // optional
  const role = formData.get("role") as "USER" | "ADMIN"
  const totalXp = parseInt(formData.get("totalXp") as string) || 0
  
  // 1. Update in Supabase Auth
  const authUpdates: any = { email, user_metadata: { name } }
  if (password) {
    authUpdates.password = password
  }
  
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates)
  
  if (authError) {
    return { error: authError.message }
  }
  
  // 2. Update in Prisma
  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      role,
      totalXp
    }
  })
  
  revalidatePath("/admin/users")
  return { success: true }
}

export async function adminDeleteUser(userId: string) {
  await requireAdmin()
  
  // 1. Delete in Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    return { error: error.message }
  }
  
  // 2. Delete in Prisma (cascade deletes will handle related records if set up, otherwise we might need to delete them first)
  // Let's assume Prisma handles cascade or we do it here.
  await prisma.user.delete({ where: { id: userId } })
  
  revalidatePath("/admin/users")
  return { success: true }
}
