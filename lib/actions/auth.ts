"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Sync user to Prisma (upsert)
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: { email: data.user.email! },
      create: {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name ?? null,
        role: "USER",
      },
    })
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: { email: data.user.email!, name },
      create: {
        id: data.user.id,
        email: data.user.email!,
        name,
        role: "USER",
      },
    })
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      _count: {
        select: {
          courseProgresses: true,
          questAttempts: true,
          dungeonAttempts: true,
        },
      },
    },
  })
  return dbUser
}
