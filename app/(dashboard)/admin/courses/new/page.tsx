"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { adminCreateCourse } from "@/lib/actions/admin"
import { Button } from "@/components/ui/8bit/button"
import { Card } from "@/components/ui/8bit/card"
import { Separator } from "@/components/ui/8bit/separator"
import { Input } from "@/components/ui/8bit/input"
import { Textarea } from "@/components/ui/8bit/textarea"
import { toast } from "@/components/ui/8bit/toast"

export default function AdminNewCoursePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : "")
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await adminCreateCourse(formData)
      if (result.error) {
        setError(result.error)
      } else {
        toast("Course created successfully")
        router.push("/admin/courses")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black tracking-wider text-foreground uppercase">
          NEW COURSE
        </h1>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Upload a PDF and set course metadata
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                COURSE TITLE
              </label>
              <Input
                name="title"
                required
                placeholder="e.g. Introduction to Algebra"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                XP REWARD
              </label>
              <Input name="xpReward" type="number" defaultValue={50} min={1} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              DESCRIPTION
            </label>
            <Textarea
              name="description"
              required
              rows={5}
              placeholder="What will students learn?"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              PDF FILE
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-foreground bg-muted/30 px-4 py-6 text-center transition-colors hover:bg-muted/50 dark:border-ring">
              <input
                name="pdf"
                type="file"
                accept="application/pdf"
                required
                onChange={handleFileChange}
                className="sr-only"
              />
              <span className="text-2xl">📄</span>
              <span className="mt-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                {fileName || "Click to upload PDF"}
              </span>
            </label>
          </div>

          {error && (
            <div className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-[10px] font-bold text-destructive">
              ⚠ {error}
            </div>
          )}

          <Separator />

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
              {isPending ? "UPLOADING..." : "CREATE COURSE"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
