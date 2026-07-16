"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash } from "@phosphor-icons/react"
import { adminCreateDungeon } from "@/lib/actions/admin"
import { Button } from "@/components/ui/8bit/button"
import { Card } from "@/components/ui/8bit/card"
import { Separator } from "@/components/ui/8bit/separator"
import { toast } from "@/components/ui/8bit/toast"

interface ChoiceInput { text: string; isCorrect: boolean }
interface QuestionInput { text: string; choices: ChoiceInput[] }

function emptyQuestion(): QuestionInput {
  return { text: "", choices: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] }
}

export default function AdminNewDungeonPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState("NORMAL")
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(1800)
  const [xpReward, setXpReward] = useState(300)
  const [questions, setQuestions] = useState<QuestionInput[]>([emptyQuestion()])

  function addQuestion() { setQuestions((q) => [...q, emptyQuestion()]) }
  function removeQuestion(qi: number) { setQuestions((q) => q.filter((_, i) => i !== qi)) }
  function updateQuestionText(qi: number, text: string) { setQuestions((q) => q.map((qq, i) => i === qi ? { ...qq, text } : qq)) }
  function updateChoiceText(qi: number, ci: number, text: string) {
    setQuestions((q) => q.map((qq, i) => i === qi ? { ...qq, choices: qq.choices.map((c, j) => j === ci ? { ...c, text } : c) } : qq))
  }
  function setCorrectChoice(qi: number, ci: number) {
    setQuestions((q) => q.map((qq, i) => i === qi ? { ...qq, choices: qq.choices.map((c, j) => ({ ...c, isCorrect: j === ci })) } : qq))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    for (const [qi, q] of questions.entries()) {
      if (!q.text.trim()) return setError(`Question ${qi + 1} text is empty`)
      if (!q.choices.some((c) => c.isCorrect)) return setError(`Question ${qi + 1} has no correct answer`)
      if (q.choices.some((c) => !c.text.trim())) return setError(`Question ${qi + 1} has empty choices`)
    }
    startTransition(async () => {
      const result = await adminCreateDungeon({ title, description, difficulty, timeLimitSeconds, xpReward, questions })
      if ("error" in result) { setError(result.error as string) }
      else {
        toast("Dungeon created successfully")
        router.push("/admin/dungeons")
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider text-foreground">NEW DUNGEON</h1>
        <p className="mt-1 text-[10px] text-muted-foreground">Create a timed dungeon challenge</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider">Dungeon Config</h2>
          <Separator />
          {[
            { label: "TITLE", value: title, set: setTitle, placeholder: "e.g. The Calculus Lair" },
            { label: "DESCRIPTION", value: description, set: setDescription, placeholder: "Describe this dungeon challenge..." },
          ].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{f.label}</label>
              <input value={f.value} onChange={(e) => f.set(e.target.value)} required placeholder={f.placeholder}
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-xs outline-none shadow-[2px_2px_0px_0px_var(--foreground)] dark:border-ring" />
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">DIFFICULTY</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border-2 border-foreground bg-background px-2 py-2 text-xs outline-none dark:border-ring">
                <option value="NORMAL">NORMAL</option>
                <option value="HARD">HARD</option>
                <option value="LEGENDARY">LEGENDARY</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TIME (sec)</label>
              <input type="number" value={timeLimitSeconds} onChange={(e) => setTimeLimitSeconds(Number(e.target.value))} min={60}
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-xs outline-none dark:border-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">XP REWARD</label>
              <input type="number" value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))} min={1}
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-xs outline-none dark:border-ring" />
            </div>
          </div>
        </Card>

        {questions.map((q, qi) => (
          <Card key={qi} className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider">Question {qi + 1}</h2>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qi)} className="text-[10px] font-bold text-destructive hover:underline">
                  <Trash size={12} className="inline" /> Remove
                </button>
              )}
            </div>
            <Separator />
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">QUESTION TEXT</label>
              <input value={q.text} onChange={(e) => updateQuestionText(qi, e.target.value)} required placeholder="Enter the question..."
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-xs outline-none dark:border-ring" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CHOICES (click radio = correct)</label>
              {q.choices.map((c, ci) => (
                <div key={ci} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${qi}`} checked={c.isCorrect} onChange={() => setCorrectChoice(qi, ci)} className="shrink-0 accent-primary" />
                  <input value={c.text} onChange={(e) => updateChoiceText(qi, ci, e.target.value)} required placeholder={`Choice ${ci + 1}`}
                    className="flex-1 border-2 border-foreground bg-background px-3 py-1.5 text-xs outline-none dark:border-ring" />
                </div>
              ))}
            </div>
          </Card>
        ))}

        <Button type="button" variant="outline" className="w-full" onClick={addQuestion}>
          <Plus size={14} /> ADD QUESTION
        </Button>

        {error && (
          <div className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-[10px] font-bold text-destructive">⚠ {error}</div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>CANCEL</Button>
          <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? "SAVING..." : "CREATE DUNGEON"}</Button>
        </div>
      </form>
    </div>
  )
}
