"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Clock, Trophy, Skull } from "@phosphor-icons/react"
import { submitDungeonAttempt } from "@/lib/actions/dungeons"
import { Button } from "@/components/ui/8bit/button"
import { Card } from "@/components/ui/8bit/card"
import { Badge } from "@/components/ui/8bit/badge"
import { Separator } from "@/components/ui/8bit/separator"

interface Choice {
  id: string
  text: string
}

interface Question {
  id: string
  text: string
  order: number
  choices: Choice[]
}

interface DungeonClientProps {
  dungeon: {
    id: string
    title: string
    description: string
    difficulty: string
    timeLimitSeconds: number
    xpReward: number
    questions: Question[]
  }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const difficultyColor: Record<string, string> = {
  NORMAL: "text-emerald-500",
  HARD: "text-amber-500",
  LEGENDARY: "text-red-500",
}

export default function DungeonClient({ dungeon }: DungeonClientProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<"lobby" | "active" | "result">("lobby")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(dungeon.timeLimitSeconds)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [result, setResult] = useState<{
    score: number
    totalScore: number
    xpEarned: number
    timeSpent: number
  } | null>(null)
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown timer
  useEffect(() => {
    if (phase !== "active") return

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          handleAutoSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current!)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleStart() {
    setStartTime(Date.now())
    setPhase("active")
  }

  function handleAutoSubmit() {
    submitResult(answers)
  }

  function handleManualSubmit() {
    clearInterval(timerRef.current!)
    submitResult(answers)
  }

  function submitResult(finalAnswers: Record<string, string>) {
    const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : dungeon.timeLimitSeconds
    startTransition(async () => {
      const res = await submitDungeonAttempt(dungeon.id, finalAnswers, elapsed)
      if (res.success) {
        setResult({
          score: res.score!,
          totalScore: res.totalScore!,
          xpEarned: res.xpEarned!,
          timeSpent: elapsed,
        })
        setPhase("result")
      }
    })
  }

  const currentQuestion = dungeon.questions[currentIndex]
  const totalQuestions = dungeon.questions.length
  const isLast = currentIndex === totalQuestions - 1
  const isUrgent = timeLeft <= 60

  // ── LOBBY ──────────────────────────────────────────────────────────────────
  if (phase === "lobby") {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className="text-5xl animate-pulse">🏰</div>
        <Card className="w-full max-w-md p-6 text-center">
          <span className={`text-[10px] font-black uppercase tracking-widest ${difficultyColor[dungeon.difficulty] ?? "text-foreground"}`}>
            {dungeon.difficulty}
          </span>
          <h2 className="mt-1 text-sm font-black uppercase tracking-wider text-foreground">
            {dungeon.title}
          </h2>
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            {dungeon.description}
          </p>

          <Separator className="my-4" />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Questions</p>
              <p className="text-base font-black text-foreground">{totalQuestions}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Time Limit</p>
              <p className="text-base font-black text-foreground">{formatTime(dungeon.timeLimitSeconds)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Max XP</p>
              <p className="text-base font-black text-accent">+{dungeon.xpReward}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <p className="mb-4 text-[9px] text-muted-foreground">
            ⚠ Timer starts immediately when you enter. The dungeon will auto-submit when time runs out.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => router.back()}>
              ← BACK
            </Button>
            <Button className="flex-1" onClick={handleStart}>
              ENTER DUNGEON →
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const percentage = Math.round((result.score / result.totalScore) * 100)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6">
        <div className="text-5xl">{percentage === 100 ? "👑" : percentage >= 60 ? "⚔️" : "💀"}</div>
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
            DUNGEON CLEARED
          </h2>
          <Separator className="my-4" />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Score</p>
              <p className="text-2xl font-black text-foreground">
                {result.score}<span className="text-sm text-muted-foreground">/{result.totalScore}</span>
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-black text-foreground">{percentage}%</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Time</p>
              <p className="text-2xl font-black text-foreground">{formatTime(result.timeSpent)}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="mb-4 flex items-center justify-center gap-2">
            <Trophy size={16} className="text-accent" weight="fill" />
            <span className="text-sm font-black text-accent">+{result.xpEarned} XP EARNED</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/dungeon")}>
              ← DUNGEON LIST
            </Button>
            <Button className="flex-1" onClick={() => {
              setPhase("lobby")
              setAnswers({})
              setCurrentIndex(0)
              setTimeLeft(dungeon.timeLimitSeconds)
              setResult(null)
            }}>
              RETRY
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ── ACTIVE ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Timer + progress header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px]">
            {currentIndex + 1} / {totalQuestions}
          </Badge>
          <span className={`text-[10px] font-black uppercase tracking-widest ${difficultyColor[dungeon.difficulty] ?? ""}`}>
            {dungeon.difficulty}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 border-2 px-3 py-1 text-xs font-black tabular-nums ${
          isUrgent
            ? "animate-pulse border-red-500 text-red-500"
            : "border-foreground text-foreground dark:border-ring"
        }`}>
          <Clock size={12} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 border-2 border-foreground bg-muted dark:border-ring">
        <div
          className={`h-full transition-all duration-1000 ${
            isUrgent ? "bg-red-500" : "bg-primary"
          }`}
          style={{ width: `${(timeLeft / dungeon.timeLimitSeconds) * 100}%` }}
        />
      </div>

      <h1 className="text-sm font-black uppercase tracking-wider text-foreground">
        {dungeon.title}
      </h1>

      {/* Question Card */}
      <Card className="p-5">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Question {currentIndex + 1}
        </p>
        <h3 className="text-xs font-bold leading-relaxed text-foreground">
          {currentQuestion.text}
        </h3>

        <Separator className="my-4" />

        <div className="space-y-2">
          {currentQuestion.choices.map((choice) => {
            const selected = answers[currentQuestion.id] === choice.id
            return (
              <button
                key={choice.id}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: choice.id }))
                }
                className={`w-full border-2 px-4 py-3 text-left text-xs font-bold transition-all ${
                  selected
                    ? "border-primary bg-primary/10 text-primary shadow-[2px_2px_0px_0px_var(--primary)]"
                    : "border-foreground bg-background text-foreground hover:border-primary/50 hover:bg-primary/5 dark:border-ring"
                }`}
              >
                {choice.text}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={14} /> PREV
        </Button>

        {isLast ? (
          <Button
            onClick={handleManualSubmit}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "SUBMITTING..." : <><Skull size={14} /> SUBMIT DUNGEON</>}
          </Button>
        ) : (
          <Button onClick={() => setCurrentIndex((i) => i + 1)}>
            NEXT <ArrowRight size={14} />
          </Button>
        )}
      </div>
    </div>
  )
}
