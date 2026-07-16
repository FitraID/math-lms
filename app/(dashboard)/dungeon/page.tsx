import Link from "next/link"
import { Skull, Clock, Star } from "@phosphor-icons/react/dist/ssr"
import { getDungeonsWithAttempts } from "@/lib/actions/dungeons"
import { Card } from "@/components/ui/8bit/card"
import { Badge } from "@/components/ui/8bit/badge"
import { Button } from "@/components/ui/8bit/button"
import { Separator } from "@/components/ui/8bit/separator"

const difficultyConfig = {
  NORMAL: { label: "NORMAL", color: "text-emerald-500" },
  HARD: { label: "HARD", color: "text-amber-500" },
  LEGENDARY: { label: "LEGENDARY", color: "text-red-500" },
} as const

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export default async function DungeonPage() {
  const dungeons = await getDungeonsWithAttempts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider text-foreground">
          DUNGEON
        </h1>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Timed challenges with harder questions · Each dungeon grants up to +300 XP
        </p>
        <div className="mt-2 flex gap-3 text-[9px] font-bold uppercase tracking-wider">
          <span className="text-emerald-500">● NORMAL</span>
          <span className="text-amber-500">● HARD</span>
          <span className="text-red-500">● LEGENDARY</span>
        </div>
      </div>

      {dungeons.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-3xl mb-3">🏰</div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            No dungeons available yet
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dungeons.map((dungeon) => {
            const attempted = dungeon.bestAttempt !== null
            const diff = difficultyConfig[dungeon.difficulty as keyof typeof difficultyConfig] ?? difficultyConfig.NORMAL
            return (
              <Card key={dungeon.id} className="flex flex-col p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-foreground bg-destructive/10 dark:border-ring">
                    <Skull size={18} weight="fill" className="text-destructive" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${diff.color}`}>
                    {diff.label}
                  </span>
                </div>

                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                  {dungeon.title}
                </h3>
                <p className="mt-1 flex-1 text-[10px] leading-relaxed text-muted-foreground">
                  {dungeon.description}
                </p>

                <Separator className="my-3" />

                <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {formatTime(dungeon.timeLimitSeconds)} limit
                  </span>
                  <span>{dungeon.questionCount} questions</span>
                  {attempted && (
                    <span className="font-bold text-primary">
                      Best: {dungeon.bestAttempt!.score}/{dungeon.bestAttempt!.totalScore}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent">
                    +{dungeon.xpReward} XP max
                  </span>
                  <Link href={`/dungeon/${dungeon.id}`}>
                    <Button size="sm" variant={attempted ? "outline" : "default"}>
                      {attempted ? "RETRY" : "ENTER →"}
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
