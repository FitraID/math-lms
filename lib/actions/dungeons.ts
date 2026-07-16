"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "./auth"

export async function getDungeons() {
  return prisma.dungeon.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { questions: true } } },
  })
}

export async function getDungeonWithQuestions(dungeonId: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const dungeon = await prisma.dungeon.findUnique({
    where: { id: dungeonId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          choices: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  if (!dungeon) return null

  const bestAttempt = await prisma.dungeonAttempt.findFirst({
    where: { userId: user.id, dungeonId },
    orderBy: { score: "desc" },
  })

  return { dungeon, user, bestAttempt }
}

export async function submitDungeonAttempt(
  dungeonId: string,
  answers: Record<string, string>, // { questionId: choiceId }
  timeSpent: number // seconds
) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const dungeon = await prisma.dungeon.findUnique({
    where: { id: dungeonId },
    include: {
      questions: {
        include: { choices: true },
      },
    },
  })
  if (!dungeon) return { error: "Dungeon not found" }

  let correctCount = 0
  const answerData: Array<{
    questionId: string
    choiceId: string
    isCorrect: boolean
  }> = []

  for (const question of dungeon.questions) {
    const selectedChoiceId = answers[question.id]
    if (!selectedChoiceId) {
      answerData.push({ questionId: question.id, choiceId: "", isCorrect: false })
      continue
    }
    const correctChoice = question.choices.find((c) => c.isCorrect)
    const isCorrect = selectedChoiceId === correctChoice?.id
    if (isCorrect) correctCount++
    answerData.push({ questionId: question.id, choiceId: selectedChoiceId, isCorrect })
  }

  const totalScore = dungeon.questions.length
  const xpEarned =
    correctCount === totalScore
      ? dungeon.xpReward
      : Math.floor((correctCount / totalScore) * dungeon.xpReward)

  const attempt = await prisma.dungeonAttempt.create({
    data: {
      userId: user.id,
      dungeonId,
      score: correctCount,
      totalScore,
      timeSpent,
      xpEarned,
      answers: {
        create: answerData.filter((a) => a.choiceId !== ""),
      },
    },
  })

  await prisma.user.update({
    where: { id: user.id },
    data: { totalXp: { increment: xpEarned } },
  })

  return { success: true, score: correctCount, totalScore, xpEarned, attemptId: attempt.id }
}

export async function getDungeonsWithAttempts() {
  const user = await getCurrentUser()
  if (!user) return []

  const dungeons = await prisma.dungeon.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { questions: true } },
      attempts: {
        where: { userId: user.id },
        orderBy: { score: "desc" },
        take: 1,
      },
    },
  })

  return dungeons.map((d) => ({
    ...d,
    bestAttempt: d.attempts[0] ?? null,
    questionCount: d._count.questions,
  }))
}
