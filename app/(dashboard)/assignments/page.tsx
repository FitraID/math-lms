import Link from "next/link"
import { Sword, Star, CheckCircle } from "@phosphor-icons/react/dist/ssr"
import { getQuestsWithAttempts } from "@/lib/actions/quests"
import { Card } from "@/components/ui/8bit/card"
import { Badge } from "@/components/ui/8bit/badge"
import { Button } from "@/components/ui/8bit/button"
import { Separator } from "@/components/ui/8bit/separator"

export default async function QuestPage() {
  const quests = await getQuestsWithAttempts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider text-foreground">
          QUEST HUB
        </h1>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Complete quests to earn XP · Each quest grants up to +100 XP based on score
        </p>
      </div>

      {quests.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-3xl mb-3">⚔️</div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            No quests available yet
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {quests.map((quest) => {
            const attempted = quest.bestAttempt !== null
            const perfect = quest.bestAttempt?.score === quest.bestAttempt?.totalScore && attempted
            return (
              <Card key={quest.id} className="flex flex-col p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-foreground bg-secondary/20 dark:border-ring">
                    <Sword size={18} weight="fill" className="text-secondary" />
                  </div>
                  {perfect ? (
                    <Badge variant="default" className="text-[9px]">PERFECT ★</Badge>
                  ) : attempted ? (
                    <Badge variant="outline" className="text-[9px]">
                      SCORE: {quest.bestAttempt!.score}/{quest.bestAttempt!.totalScore}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px]">NEW</Badge>
                  )}
                </div>

                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                  {quest.title}
                </h3>
                <p className="mt-1 flex-1 text-[10px] leading-relaxed text-muted-foreground">
                  {quest.description}
                </p>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-accent">
                      +{quest.xpReward} XP max
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {quest.questionCount} questions
                    </span>
                  </div>
                  <Link href={`/assignments/${quest.id}`}>
                    <Button size="sm" variant={attempted ? "outline" : "default"}>
                      {attempted ? "RETRY" : "START →"}
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
