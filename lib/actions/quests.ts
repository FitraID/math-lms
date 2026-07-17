"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "./auth"

export async function getQuests() {
  return prisma.quest.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { questions: true } } },
  })
}

export async function getQuestWithQuestions(questId: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          choices: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  if (!quest) return null

  // Get best attempt
  const bestAttempt = await prisma.questAttempt.findFirst({
    where: { userId: user.id, questId },
    orderBy: { score: "desc" },
  })

  return { quest, user, bestAttempt }
}

// For drag & drop, answers include the user's drop position
// For multiple choice, answers are just { questionId: choiceId }
export async function submitQuestAttempt(
  questId: string,
  answers: Record<string, string>, // { questionId: choiceId } for MC
  dragDropAnswers?: Record<string, Array<{ choiceId: string; dropX: number; dropY: number; dropRotation: number }>> // { questionId: [...placements] } for DD
) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    include: {
      questions: {
        include: { choices: true },
      },
    },
  })
  if (!quest) return { error: "Quest not found" }

  let correctCount = 0
  let totalMaxScore = 0
  const answerData: Array<{
    questionId: string
    choiceId: string
    isCorrect: boolean
  }> = []

  const DRAG_DROP_THRESHOLD = 20 // generous percentage distance threshold for correct placement

  for (const question of quest.questions) {
    if (question.type === "DRAG_DROP") {
      const placements = dragDropAnswers?.[question.id] || []
      
      for (const choice of question.choices) {
        // Skip choices that don't have a drop zone defined (optional zones)
        if (choice.dropX == null || choice.dropY == null) continue

        totalMaxScore++

        const placement = placements.find((p) => p.choiceId === choice.id)
        if (!placement) {
          answerData.push({ questionId: question.id, choiceId: choice.id, isCorrect: false })
          continue
        }

        // Calculate distance between user's drop and target position
        const dx = placement.dropX - choice.dropX
        const dy = placement.dropY - choice.dropY
        const distance = Math.sqrt(dx * dx + dy * dy)
        let isCorrect = distance <= DRAG_DROP_THRESHOLD

        // Grade rotation if choice specifies a dropRotation
        if (isCorrect && choice.dropRotation != null) {
          // Calculate shortest angular distance taking 360 wrap around into account
          let diff = Math.abs((placement.dropRotation % 360) - (choice.dropRotation % 360))
          if (diff > 180) diff = 360 - diff
          if (diff > 15) { // 15 degrees tolerance
            isCorrect = false
          }
        }

        if (isCorrect) correctCount++
        answerData.push({ questionId: question.id, choiceId: choice.id, isCorrect })
      }
    } else if (question.type === "ESSAY") {
      totalMaxScore++
      const essayText = answers[question.id]
      const isFilled = essayText && essayText.trim().length > 0
      if (isFilled) correctCount++
      // Hack to store essay text: store it in choiceId since it's just a string field
      answerData.push({ questionId: question.id, choiceId: essayText || "[EMPTY]", isCorrect: !!isFilled })
    } else {
      totalMaxScore++
      // Standard multiple choice grading
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
  }

  const totalScore = totalMaxScore
  const xpEarned =
    correctCount === totalScore
      ? quest.xpReward
      : Math.floor((correctCount / totalScore) * quest.xpReward)

  // Award quest points upon completion
  const pointsEarned = quest.questPoint

  const attempt = await prisma.questAttempt.create({
    data: {
      userId: user.id,
      questId,
      score: correctCount,
      totalScore,
      xpEarned,
      pointsEarned,
      answers: {
        create: answerData.filter((a) => a.choiceId !== ""),
      },
    },
  })

  // Add XP and questPoints
  await prisma.user.update({
    where: { id: user.id },
    data: {
      totalXp: { increment: xpEarned },
      questPoints: { increment: pointsEarned },
    },
  })

  return {
    success: true,
    score: correctCount,
    totalScore,
    xpEarned,
    pointsEarned,
    attemptId: attempt.id,
  }
}

export async function getQuestsWithAttempts() {
  const user = await getCurrentUser()
  if (!user) return []

  const quests = await prisma.quest.findMany({
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

  return quests.map((q) => ({
    ...q,
    bestAttempt: q.attempts[0] ?? null,
    questionCount: q._count.questions,
  }))
}
