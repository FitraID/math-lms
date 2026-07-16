"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  CheckCircle,
} from "@phosphor-icons/react"
import { submitQuestAttempt } from "@/lib/actions/quests"
import { Button } from "@/components/ui/8bit/button"
import { Card } from "@/components/ui/8bit/card"
import { Badge } from "@/components/ui/8bit/badge"
import { Separator } from "@/components/ui/8bit/separator"

interface Choice {
  id: string
  text: string
  imageUrl?: string | null
  dropX?: number | null
  dropY?: number | null
  isCorrect: boolean
}

interface Question {
  id: string
  text: string
  type: string
  imageUrl?: string | null
  order: number
  choices: Choice[]
}

interface QuestClientProps {
  quest: {
    id: string
    title: string
    description: string
    xpReward: number
    timeLimitSeconds: number
    questPoint: number
    questions: Question[]
  }
}

export default function QuestClient({ quest }: QuestClientProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  // MC answers: { questionId: choiceId }
  // DD answers: { questionId: { zoneChoiceId: draggedChoiceId } }
  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({})
  const [ddAnswers, setDdAnswers] = useState<
    Record<string, Record<string, string>>
  >({})
  const [timeLeft, setTimeLeft] = useState(quest.timeLimitSeconds)
  const [result, setResult] = useState<{
    score: number
    totalScore: number
    xpEarned: number
    pointsEarned: number
  } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [draggedChoiceId, setDraggedChoiceId] = useState<string | null>(null)

  useEffect(() => {
    if (result || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, timeLeft])

  const currentQuestion = quest.questions[currentIndex]
  const totalQuestions = quest.questions.length
  const isLast = currentIndex === totalQuestions - 1

  let isAnswered = false
  if (currentQuestion?.type === "DRAG_DROP") {
    const dragState = ddAnswers[currentQuestion.id] || {}
    const zonesNeeded = currentQuestion.choices.filter(
      (c) => c.dropX != null
    ).length
    isAnswered = Object.keys(dragState).length >= zonesNeeded
  } else {
    isAnswered = !!mcAnswers[currentQuestion?.id]
  }

  function handleSelectChoice(questionId: string, choiceId: string) {
    setMcAnswers((prev) => ({ ...prev, [questionId]: choiceId }))
  }

  function handleDrop(questionId: string, zoneId: string, e: React.DragEvent) {
    e.preventDefault()
    if (!draggedChoiceId) return
    setDdAnswers((prev) => {
      const qAnswer = { ...(prev[questionId] || {}) }
      qAnswer[zoneId] = draggedChoiceId
      return { ...prev, [questionId]: qAnswer }
    })
    setDraggedChoiceId(null)
  }

  function handleRemoveDropped(questionId: string, zoneId: string) {
    setDdAnswers((prev) => {
      const qAnswer = { ...(prev[questionId] || {}) }
      delete qAnswer[zoneId]
      return { ...prev, [questionId]: qAnswer }
    })
  }

  function handleNext() {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
  }

  function handleSubmit() {
    startTransition(async () => {
      // Build drag & drop answers for the server
      const dragDropForServer: Record<
        string,
        Array<{ choiceId: string; dropX: number; dropY: number }>
      > = {}

      for (const [questionId, zoneMap] of Object.entries(ddAnswers)) {
        const question = quest.questions.find((q) => q.id === questionId)
        if (!question) continue

        const placements: Array<{
          choiceId: string
          dropX: number
          dropY: number
        }> = []
        for (const [zoneChoiceId, draggedId] of Object.entries(zoneMap)) {
          // The user placed draggedId onto the zone defined by zoneChoiceId
          // We send the zone's target position as the user's "answer" position
          const zoneChoice = question.choices.find((c) => c.id === zoneChoiceId)
          if (
            zoneChoice &&
            zoneChoice.dropX != null &&
            zoneChoice.dropY != null
          ) {
            placements.push({
              choiceId: draggedId,
              dropX: zoneChoice.dropX,
              dropY: zoneChoice.dropY,
            })
          }
        }
        dragDropForServer[questionId] = placements
      }

      const res = await submitQuestAttempt(
        quest.id,
        mcAnswers,
        dragDropForServer
      )
      if (res.success) {
        setResult({
          score: res.score!,
          totalScore: res.totalScore!,
          xpEarned: res.xpEarned!,
          pointsEarned: res.pointsEarned!,
        })
      }
    })
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  // ── Result Screen ──
  if (result) {
    const percentage = Math.round((result.score / result.totalScore) * 100)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6">
        <div className="text-5xl">
          {percentage === 100 ? "🏆" : percentage >= 60 ? "🎯" : "📚"}
        </div>
        <Card className="w-full p-6 text-center">
          <h2 className="text-sm font-black tracking-wider text-foreground uppercase">
            QUEST COMPLETE
          </h2>
          <Separator className="my-4" />
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground">SCORE</p>
            <p className="text-3xl font-black text-foreground">
              {result.score}/{result.totalScore}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground">
              {percentage}% ACCURACY
            </p>
          </div>
          <Separator className="my-4" />
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="text-sm font-black text-accent">
              +{result.xpEarned} XP EARNED
            </span>
            <span className="text-sm font-black text-primary">
              +{result.pointsEarned} QUEST POINTS
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/assignments")}
            >
              ← BACK
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setResult(null)
                setMcAnswers({})
                setDdAnswers({})
                setCurrentIndex(0)
                setTimeLeft(quest.timeLimitSeconds)
              }}
            >
              RETRY
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ── Quest UI ──
  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase hover:text-foreground"
        >
          <ArrowLeft size={12} /> Back
        </button>
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className={`text-[10px] ${timeLeft <= 10 ? "border-destructive text-destructive" : ""}`}
          >
            ⏱ {formatTime(timeLeft)}
          </Badge>
          <Badge variant="outline" className="text-[9px]">
            {currentIndex + 1} / {totalQuestions}
          </Badge>
        </div>
      </div>

      <div>
        <h1 className="text-lg font-black tracking-wider text-foreground uppercase">
          {quest.title}
        </h1>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Answer all questions · +{quest.xpReward} XP max · +{quest.questPoint}{" "}
          Quest Points
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-2 border-2 border-foreground bg-muted dark:border-ring">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-5">
        <p className="mb-1 text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
          Question {currentIndex + 1}
          {currentQuestion.type === "DRAG_DROP" && (
            <span className="ml-2 text-primary">(Drag &amp; Drop)</span>
          )}
        </p>
        <h3 className="text-xs leading-relaxed font-bold text-foreground">
          {currentQuestion.text}
        </h3>

        {/* Question Image (for both MC and DD) */}
        {currentQuestion.imageUrl && currentQuestion.type !== "DRAG_DROP" && (
          <div className="mt-3 overflow-hidden border-2 border-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentQuestion.imageUrl}
              alt="Question"
              className="object-contain"
            />
          </div>
        )}

        <Separator className="my-4" />

        {currentQuestion.type === "DRAG_DROP" ? (
          // ── Drag & Drop UI ──
          <div className="space-y-4">
            {/* Drop Image with invisible zones */}
            <div className="relative inline-block w-full overflow-hidden border-2 border-foreground">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentQuestion.imageUrl!}
                alt="Question"
                className="w-full"
              />
              {/* Invisible drop zones positioned on the image */}
              {currentQuestion.choices.map((zone) => {
                if (zone.dropX == null || zone.dropY == null) return null
                const droppedChoiceId = ddAnswers[currentQuestion.id]?.[zone.id]
                const droppedChoice = droppedChoiceId
                  ? currentQuestion.choices.find(
                      (c) => c.id === droppedChoiceId
                    )
                  : null

                return (
                  <div
                    key={zone.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(currentQuestion.id, zone.id, e)}
                    className="absolute flex items-center justify-center transition-all"
                    style={{
                      left: `${zone.dropX}%`,
                      top: `${zone.dropY}%`,
                      width: "100px",
                      height: "40px",
                      transform: "translate(-50%, -50%)",
                      border: droppedChoice
                        ? "2px solid var(--foreground)"
                        : "2px dashed transparent",
                      background: droppedChoice
                        ? "var(--background)"
                        : "transparent",
                    }}
                  >
                    {droppedChoice ? (
                      <button
                        type="button"
                        className="flex h-full w-full items-center justify-center text-[10px] font-bold"
                        onClick={() =>
                          handleRemoveDropped(currentQuestion.id, zone.id)
                        }
                        title="Click to remove"
                      >
                        {droppedChoice.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={droppedChoice.imageUrl}
                            alt={droppedChoice.text}
                            className="h-8 object-contain"
                          />
                        ) : (
                          droppedChoice.text
                        )}
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>

            {/* Draggable choices */}
            <div className="flex flex-wrap gap-2">
              {currentQuestion.choices.map((choice) => {
                const isDropped = Object.values(
                  ddAnswers[currentQuestion.id] || {}
                ).includes(choice.id)
                if (isDropped) return null
                return (
                  <div
                    key={choice.id}
                    draggable
                    onDragStart={() => setDraggedChoiceId(choice.id)}
                    onDragEnd={() => setDraggedChoiceId(null)}
                    className="cursor-grab border-2 border-foreground bg-background px-3 py-2 text-[10px] font-bold shadow-[2px_2px_0px_0px_var(--foreground)] active:cursor-grabbing"
                  >
                    {choice.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={choice.imageUrl}
                        alt={choice.text}
                        className="mb-1 h-10 object-contain"
                      />
                    )}
                    {choice.text}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          // ── Multiple Choice UI ──
          <div className="space-y-2">
            {currentQuestion.choices.map((choice) => {
              const selected = mcAnswers[currentQuestion.id] === choice.id
              return (
                <button
                  key={choice.id}
                  onClick={() =>
                    handleSelectChoice(currentQuestion.id, choice.id)
                  }
                  className={`w-full border-2 px-4 py-3 text-left text-xs font-bold transition-all ${
                    selected
                      ? "border-primary bg-primary/10 text-primary shadow-[2px_2px_0px_0px_var(--primary)]"
                      : "border-foreground bg-background text-foreground shadow-[2px_2px_0px_0px_var(--foreground)] hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-foreground"
                      }`}
                    >
                      {selected && (
                        <CheckCircle
                          size={12}
                          weight="fill"
                          className="text-primary-foreground"
                        />
                      )}
                    </div>
                    <div>
                      {choice.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={choice.imageUrl}
                          alt={choice.text}
                          className="mb-1 h-12 object-contain"
                        />
                      )}
                      <span>{choice.text}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-2">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={12} /> PREV
        </Button>

        {isLast ? (
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "SUBMITTING..." : "SUBMIT"}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!isAnswered}>
            NEXT <ArrowRight size={12} />
          </Button>
        )}
      </div>
    </div>
  )
}
