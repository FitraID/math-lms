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
  subText?: string | null
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
    Record<
      string,
      Record<
        string,
        { dropX: number; dropY: number; rotation: number; scale: number }
      >
    >
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
  const [selectedDroppedId, setSelectedDroppedId] = useState<string | null>(null)

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
    const droppedCount = Object.keys(ddAnswers[currentQuestion.id] || {}).length
    const zonesNeeded = currentQuestion.choices.filter(
      (c) => c.dropX != null
    ).length
    isAnswered = droppedCount >= zonesNeeded
  } else if (currentQuestion?.type === "ESSAY") {
    isAnswered = !!mcAnswers[currentQuestion?.id]?.trim()
  } else {
    isAnswered = !!mcAnswers[currentQuestion?.id]
  }

  function handleSelectChoice(questionId: string, choiceId: string) {
    setMcAnswers((prev) => ({ ...prev, [questionId]: choiceId }))
  }

  function handleDrop(questionId: string, e: React.DragEvent) {
    e.preventDefault()
    if (!draggedChoiceId) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    placeItem(questionId, draggedChoiceId, x, y)
    setDraggedChoiceId(null)
  }

  function handleImageClick(questionId: string, e: React.MouseEvent) {
    // If a dropped item is selected (mobile move), move it
    if (selectedDroppedId) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      placeItem(questionId, selectedDroppedId, x, y)
      setSelectedDroppedId(null)
      return
    }
    if (!draggedChoiceId) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    placeItem(questionId, draggedChoiceId, x, y)
    setDraggedChoiceId(null)
  }

  function placeItem(questionId: string, choiceId: string, x: number, y: number) {
    setDdAnswers((prev) => {
      const qAnswer = { ...(prev[questionId] || {}) }
      // preserve rotation and scale if moving an already dropped item
      const existing = qAnswer[choiceId]
      qAnswer[choiceId] = {
        dropX: x,
        dropY: y,
        rotation: existing ? existing.rotation : 0,
        scale: existing ? existing.scale : 1,
      }
      return { ...prev, [questionId]: qAnswer }
    })
  }

  function handleRotate(
    questionId: string,
    choiceId: string,
    rotation: number
  ) {
    setDdAnswers((prev) => {
      const qAnswer = { ...(prev[questionId] || {}) }
      if (qAnswer[choiceId]) {
        qAnswer[choiceId] = { ...qAnswer[choiceId], rotation }
      }
      return { ...prev, [questionId]: qAnswer }
    })
  }

  function handleScale(questionId: string, choiceId: string, scale: number) {
    setDdAnswers((prev) => {
      const qAnswer = { ...(prev[questionId] || {}) }
      if (qAnswer[choiceId]) {
        qAnswer[choiceId] = { ...qAnswer[choiceId], scale }
      }
      return { ...prev, [questionId]: qAnswer }
    })
  }

  function handleRemoveDropped(questionId: string, choiceId: string) {
    setDdAnswers((prev) => {
      const qAnswer = { ...(prev[questionId] || {}) }
      delete qAnswer[choiceId]
      return { ...prev, [questionId]: qAnswer }
    })
    if (selectedDroppedId === choiceId) setSelectedDroppedId(null)
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
        Array<{
          choiceId: string
          dropX: number
          dropY: number
          dropRotation: number
        }>
      > = {}

      for (const [questionId, choiceMap] of Object.entries(ddAnswers)) {
        const question = quest.questions.find((q) => q.id === questionId)
        if (!question) continue

        const placements: Array<{
          choiceId: string
          dropX: number
          dropY: number
          dropRotation: number
        }> = []
        for (const [choiceId, answerData] of Object.entries(choiceMap)) {
          placements.push({
            choiceId,
            dropX: answerData.dropX,
            dropY: answerData.dropY,
            dropRotation: answerData.rotation,
          })
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
    if (m > 0) return `${m} Menit ${s} Detik`
    return `${s} Detik`
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

        {currentQuestion.subText && (
          <div className="mt-3 text-xs leading-relaxed font-bold text-foreground">
            {currentQuestion.subText}
          </div>
        )}

        <Separator className="my-4" />

        {currentQuestion.type === "DRAG_DROP" ? (
          <div className="space-y-4 text-center">
            {/* Drop Image with invisible zones */}
            <div
              className="relative inline-block w-full max-w-3xl overflow-hidden border-2 border-foreground bg-background cursor-crosshair"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(currentQuestion.id, e)}
              onClick={(e) => handleImageClick(currentQuestion.id, e)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentQuestion.imageUrl!}
                alt="Question"
                className="w-full object-contain"
              />
              {/* Render dropped choices on the image */}
              {Object.entries(ddAnswers[currentQuestion.id] || {}).map(
                ([choiceId, answerData]) => {
                  const choice = currentQuestion.choices.find(
                    (c) => c.id === choiceId
                  )
                  if (!choice) return null

                  return (
                    <div
                      key={choice.id}
                      className="absolute z-10 flex flex-col items-center justify-center"
                      style={{
                        left: `${answerData.dropX}%`,
                        top: `${answerData.dropY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {/* Draggable + tappable container for already dropped item */}
                      <div
                        draggable
                        onDragStart={() => {
                          setDraggedChoiceId(choice.id)
                          setSelectedDroppedId(null)
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDroppedId((prev) =>
                            prev === choice.id ? null : choice.id
                          )
                          setDraggedChoiceId(null)
                        }}
                        className={`relative flex cursor-pointer items-center justify-center active:cursor-grabbing transition-all ${
                          selectedDroppedId === choice.id
                            ? "ring-2 ring-primary ring-offset-1 ring-offset-transparent"
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full border-2 border-foreground bg-destructive text-xs text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveDropped(currentQuestion.id, choice.id)
                          }}
                          title="Remove"
                        >
                          X
                        </button>
                        <div
                          className="flex h-full w-full items-center justify-center text-[10px] font-bold"
                          style={{
                            transform: `rotate(${answerData.rotation}deg) scale(${answerData.scale || 1})`,
                          }}
                        >
                          {choice.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={choice.imageUrl}
                              alt={choice.text}
                              className="h-16 object-contain drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"
                            />
                          ) : (
                            <div className="border-2 border-foreground bg-background px-2 py-1 whitespace-nowrap">
                              {choice.text}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Controls Panel — always visible when selected, hover on desktop */}
                      {selectedDroppedId === choice.id && (
                        <div className="absolute top-full left-1/2 z-30 mt-2 flex w-52 -translate-x-1/2 flex-col gap-2 rounded-sm border-2 border-foreground bg-background p-2 shadow-sm">
                          <div className="text-[8px] font-bold text-primary tracking-widest uppercase text-center">
                            Tap gambar untuk pindahkan
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase">
                              Rotate: {answerData.rotation}°
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={answerData.rotation}
                                onChange={(e) =>
                                  handleRotate(
                                    currentQuestion.id,
                                    choice.id,
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full accent-primary"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <input
                                type="number"
                                min="0"
                                max="360"
                                value={answerData.rotation}
                                onChange={(e) =>
                                  handleRotate(
                                    currentQuestion.id,
                                    choice.id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-4 w-12 rounded-sm border border-input bg-muted px-1 text-center text-[10px]"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase">
                              Resize
                            </span>
                            <input
                              type="range"
                              min="0.2"
                              max="3"
                              step="0.1"
                              value={answerData.scale || 1}
                              onChange={(e) =>
                                handleScale(
                                  currentQuestion.id,
                                  choice.id,
                                  parseFloat(e.target.value)
                                )
                              }
                              className="w-full accent-primary"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }
              )}
            </div>

            {/* Draggable choices */}
            <div className="flex flex-wrap gap-2">
              {currentQuestion.choices.map((choice) => {
                const isDropped = !!ddAnswers[currentQuestion.id]?.[choice.id]
                if (isDropped) return null
                return (
                  <div
                    key={choice.id}
                    draggable
                    onDragStart={() => setDraggedChoiceId(choice.id)}
                    onDragEnd={() => setDraggedChoiceId(null)}
                    onClick={() => setDraggedChoiceId(choice.id)}
                    className={`cursor-pointer transition-all ${
                      draggedChoiceId === choice.id
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : ""
                    }`}
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
        ) : currentQuestion.type === "ESSAY" ? (
          // ── Essay UI ──
          <div className="space-y-2">
            <textarea
              className="w-full border-2 border-foreground bg-background p-3 text-xs font-bold text-foreground outline-none shadow-[2px_2px_0px_0px_var(--foreground)] focus:border-primary focus:shadow-[2px_2px_0px_0px_var(--primary)] resize-y min-h-[120px]"
              placeholder="Write your answer here..."
              value={mcAnswers[currentQuestion.id] || ""}
              onChange={(e) => handleSelectChoice(currentQuestion.id, e.target.value)}
            />
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
