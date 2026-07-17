"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash, MapPin } from "@phosphor-icons/react"
import { adminCreateQuest, uploadQuestImage } from "@/lib/actions/admin"
import { Button } from "@/components/ui/8bit/button"
import { Card } from "@/components/ui/8bit/card"
import { Separator } from "@/components/ui/8bit/separator"
import { Input } from "@/components/ui/8bit/input"
import { Textarea } from "@/components/ui/8bit/textarea"
import { toast } from "@/components/ui/8bit/toast"

interface ChoiceInput {
  text: string
  isCorrect: boolean
  imageFile?: File | null
  dropX?: number | null
  dropY?: number | null
  dropRotation?: number | null
}
interface QuestionInput {
  text: string
  subText?: string
  type: "MULTIPLE_CHOICE" | "DRAG_DROP" | "ESSAY"
  imageFile?: File | null
  choices: ChoiceInput[]
}

function emptyQuestion(): QuestionInput {
  return {
    text: "",
    subText: "",
    type: "MULTIPLE_CHOICE",
    choices: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  }
}

export default function AdminNewQuestPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [xpReward, setXpReward] = useState(100)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(1)
  const [questPoint, setQuestPoint] = useState(10)
  const [questions, setQuestions] = useState<QuestionInput[]>([emptyQuestion()])
  const [settingDropZone, setSettingDropZone] = useState<{
    qi: number
    ci: number
  } | null>(null)

  function addQuestion() {
    setQuestions((q) => [...q, emptyQuestion()])
  }
  function removeQuestion(qi: number) {
    setQuestions((q) => q.filter((_, i) => i !== qi))
  }
  function updateQuestion(qi: number, updates: Partial<QuestionInput>) {
    setQuestions((q) =>
      q.map((qq, i) => (i === qi ? { ...qq, ...updates } : qq))
    )
  }
  function updateChoice(qi: number, ci: number, updates: Partial<ChoiceInput>) {
    setQuestions((q) =>
      q.map((qq, i) =>
        i === qi
          ? {
              ...qq,
              choices: qq.choices.map((c, j) =>
                j === ci ? { ...c, ...updates } : c
              ),
            }
          : qq
      )
    )
  }
  function setCorrectChoice(qi: number, ci: number) {
    setQuestions((q) =>
      q.map((qq, i) =>
        i === qi && qq.type === "MULTIPLE_CHOICE"
          ? {
              ...qq,
              choices: qq.choices.map((c, j) => ({
                ...c,
                isCorrect: j === ci,
              })),
            }
          : qq
      )
    )
  }

  function handleImageClick(qi: number, e: React.MouseEvent<HTMLImageElement>) {
    if (settingDropZone?.qi !== qi) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    updateChoice(qi, settingDropZone.ci, { dropX: x, dropY: y })
    setSettingDropZone(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    for (const [qi, q] of questions.entries()) {
      if (!q.text.trim() && !q.imageFile)
        return setError(`Question ${qi + 1} is empty`)
      if (q.type === "MULTIPLE_CHOICE" && !q.choices.some((c) => c.isCorrect))
        return setError(`Question ${qi + 1} has no correct answer`)
      if (q.type === "DRAG_DROP" && !q.imageFile)
        return setError(`Question ${qi + 1} requires an image for Drag & Drop`)
    }

    startTransition(async () => {
      try {
        const finalQuestions = []
        for (const q of questions) {
          let questionImageUrl: string | undefined = undefined
          if (q.imageFile) {
            const fd = new FormData()
            fd.append("file", q.imageFile)
            const res = await uploadQuestImage(fd)
            if (res.error) throw new Error(res.error)
            questionImageUrl = res.url
          }

          const finalChoices = []
          if (q.type !== "ESSAY") {
            for (const c of q.choices) {
              let choiceImageUrl: string | undefined = undefined
              if (c.imageFile) {
                const fd = new FormData()
                fd.append("file", c.imageFile)
                const res = await uploadQuestImage(fd)
                if (res.error) throw new Error(res.error)
                choiceImageUrl = res.url
              }
              finalChoices.push({
                text: c.text,
                imageUrl: choiceImageUrl,
                dropX: c.dropX ?? undefined,
                dropY: c.dropY ?? undefined,
                dropRotation: c.dropRotation ?? undefined,
                isCorrect: q.type === "DRAG_DROP" ? true : c.isCorrect,
              })
            }
          }

          finalQuestions.push({
            text: q.text,
            subText: q.subText,
            type: q.type,
            imageUrl: questionImageUrl,
            choices: finalChoices,
          })
        }

        const result = await adminCreateQuest({
          title,
          description,
          xpReward,
          timeLimitSeconds: timeLimitMinutes * 60,
          questPoint,
          questions: finalQuestions,
        })
        if ("error" in result) throw new Error(result.error as string)
        toast("Quest created successfully!")
        router.push("/admin/quests")
      } catch (err: any) {
        setError(err.message || "An error occurred")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black tracking-wider text-foreground uppercase">
          NEW QUEST
        </h1>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Create a quest with multiple choice or drag &amp; drop questions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4 p-5">
            <h2 className="text-xs font-bold tracking-wider uppercase">
              Quest Info
            </h2>
            <Separator />
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                TITLE
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Algebra Basics"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                DESCRIPTION
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                XP REWARD
              </label>
              <Input
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                min={1}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  TIME LIMIT (MINUTES)
                </label>
                <Input
                  type="number"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  QUEST POINTS
                </label>
                <Input
                  type="number"
                  value={questPoint}
                  onChange={(e) => setQuestPoint(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
          </Card>

          {questions.map((q, qi) => (
            <Card key={qi} className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-wider uppercase">
                  Question {qi + 1}
                </h2>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qi)}
                    className="text-[10px] font-bold text-destructive hover:underline"
                  >
                    <Trash size={12} className="inline" /> Remove
                  </button>
                )}
              </div>
              <Separator />

              {/* Question Type */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  TYPE
                </label>
                <select
                  className="flex h-10 w-full rounded-none border-2 border-foreground bg-background px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_var(--foreground)] outline-none focus-visible:shadow-[4px_4px_0px_0px_var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(qi, {
                      type: e.target.value as any,
                    })
                  }
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="DRAG_DROP">Drag &amp; Drop Image</option>
                  <option value="ESSAY">Essay</option>
                </select>
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  QUESTION TEXT
                </label>
                <Textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                  placeholder="Enter the question..."
                />
              </div>

              {/* Question Image */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  QUESTION IMAGE{" "}
                  {q.type === "MULTIPLE_CHOICE" ? "(Optional)" : "(Required)"}
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    updateQuestion(qi, {
                      imageFile: e.target.files?.[0] || null,
                    })
                  }
                />
                {q.imageFile && (
                  <div className="relative mt-2 inline-block max-w-full overflow-hidden border-2 border-foreground">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(q.imageFile)}
                      alt="Preview"
                      className={`max-h-48 ${settingDropZone?.qi === qi ? "cursor-crosshair opacity-80" : ""}`}
                      onClick={(e) => handleImageClick(qi, e)}
                    />
                    {/* Show drop zone markers */}
                    {q.type === "DRAG_DROP" &&
                      q.choices.map((c, ci) =>
                        c.dropX != null && c.dropY != null ? (
                          <div
                            key={ci}
                            className="absolute flex h-6 w-6 items-center justify-center border-2 border-foreground bg-primary text-[10px] font-bold text-primary-foreground"
                            style={{
                              left: `${c.dropX}%`,
                              top: `${c.dropY}%`,
                              transform: `translate(-50%, -50%) rotate(${c.dropRotation ?? 0}deg)`,
                              transition: 'transform 0.2s',
                            }}
                          >
                            <span style={{ transform: `rotate(${-(c.dropRotation ?? 0)}deg)` }}>{ci + 1}</span>
                          </div>
                        ) : null
                      )}
                    {settingDropZone?.qi === qi && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/50">
                        <span className="border-2 border-foreground bg-background px-2 py-1 text-xs font-bold">
                          Click to set Drop Zone for Choice{" "}
                          {settingDropZone.ci + 1}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Second Question Text (Below Image) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  SECOND QUESTION TEXT (BELOW IMAGE)
                </label>
                <Textarea
                  value={q.subText || ""}
                  onChange={(e) => updateQuestion(qi, { subText: e.target.value })}
                  placeholder="Enter the secondary question text..."
                />
              </div>

              {/* Choices */}
              {q.type !== "ESSAY" && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    CHOICES
                  {q.type === "MULTIPLE_CHOICE"
                    ? " (click radio = correct)"
                    : " (set drop zones on image)"}
                </label>
                {q.choices.map((c, ci) => (
                  <div
                    key={ci}
                    className="flex flex-col gap-2 rounded-sm border-2 border-border p-3"
                  >
                    <div className="flex items-center gap-4">
                      {q.type === "MULTIPLE_CHOICE" && (
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={c.isCorrect}
                          onChange={() => setCorrectChoice(qi, ci)}
                          className="shrink-0 accent-primary"
                        />
                      )}
                      {q.type === "DRAG_DROP" && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                          {ci + 1}
                        </div>
                      )}
                      <Input
                        value={c.text}
                        onChange={(e) =>
                          updateChoice(qi, ci, {
                            text: e.target.value,
                          })
                        }
                        placeholder={`Choice ${ci + 1} Text`}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2 pl-8">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          updateChoice(qi, ci, {
                            imageFile: e.target.files?.[0] || null,
                          })
                        }
                        className="h-8 text-[10px]"
                      />
                      {q.type === "DRAG_DROP" && (
                        <Button
                          type="button"
                          variant={
                            settingDropZone?.qi === qi &&
                            settingDropZone?.ci === ci
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setSettingDropZone(
                              settingDropZone?.qi === qi &&
                                settingDropZone?.ci === ci
                                ? null
                                : { qi, ci }
                            )
                          }
                          className="shrink-0"
                        >
                          <MapPin size={12} className="mr-1" />{" "}
                          {c.dropX != null ? "Re-set" : "Set Zone"}
                        </Button>
                      )}
                    </div>
                    {q.type === "DRAG_DROP" && (
                      <div className="flex items-center gap-4 pl-8">
                        <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase whitespace-nowrap">
                          ROTATION: {c.dropRotation ?? 0}°
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={c.dropRotation ?? 0}
                          onChange={(e) => updateChoice(qi, ci, { dropRotation: parseInt(e.target.value) })}
                          className="w-full accent-primary"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </Card>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addQuestion}
        >
          <Plus size={14} /> ADD QUESTION
        </Button>

        {error && (
          <div className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-[10px] font-bold text-destructive">
            ⚠ {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            CANCEL
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? "SAVING..." : "CREATE QUEST"}
          </Button>
        </div>
      </form>
    </div>
  )
}
