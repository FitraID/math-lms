import { Button } from "@/components/ui/8bit/button"
import { Card } from "@/components/ui/8bit/card"
import { Badge } from "@/components/ui/8bit/badge"
import { Separator } from "@/components/ui/8bit/separator"
import { getCurrentUser } from "@/lib/actions/auth"
import { redirect } from "next/navigation"
import {
  User,
  Shield,
  GameController,
  Medal,
  Gear,
  HardDrives,
} from "@phosphor-icons/react/dist/ssr"

export default async function UserPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const achievements = [
    {
      title: "FIRST_COMMIT 👾",
      description: "Successfully initialized the lms-pixel workspace",
      unlockedAt: user.createdAt.toISOString().split("T")[0],
      unlocked: true,
    },
    {
      title: "MATH_ADEPT 📚",
      description: "Finished your first course",
      unlockedAt: "—",
      unlocked: user._count.courseProgresses > 0,
    },
    {
      title: "QUEST_HUNTER ⚔️",
      description: "Completed your first quest",
      unlockedAt: "—",
      unlocked: user._count.questAttempts > 0,
    },
    {
      title: "DUNGEON_CRAWLER 🏰",
      description: "Survived your first dungeon challenge",
      unlockedAt: "—",
      unlocked: user._count.dungeonAttempts > 0,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-wider text-foreground uppercase">
          USER PROFILE // INTEL
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage your learning operative credentials, system integrations, and
          achievement badges.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Stats (left side) */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <Card className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center border-4 border-foreground bg-primary text-3xl text-primary-foreground dark:border-ring">
              <User weight="fill" />
            </div>
            <h2 className="text-lg font-bold tracking-wider uppercase">
              {user.name || "OPERATIVE"}
            </h2>
            <p className="text-[10px] text-muted-foreground">{user.email}</p>

            <div className="mt-4 flex w-full flex-col gap-2">
              <div className="flex items-center justify-between border-2 border-foreground bg-muted p-2 dark:border-ring">
                <span className="text-[10px] font-bold text-muted-foreground">
                  ROLE
                </span>
                <span className="text-xs font-black uppercase text-foreground">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between border-2 border-foreground bg-muted p-2 dark:border-ring">
                <span className="text-[10px] font-bold text-muted-foreground">
                  EXP
                </span>
                <span className="text-xs font-black text-accent">
                  {user.totalXp} XP
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              <Shield size={14} /> System Info
            </h3>
            <div className="flex flex-col gap-2 text-[10px] text-muted-foreground">
              <p>
                <strong className="text-foreground">USER_ID:</strong>{" "}
                {user.id.substring(0, 13)}...
              </p>
              <p>
                <strong className="text-foreground">STATUS:</strong> ACTIVE
              </p>
              <p>
                <strong className="text-foreground">JOIN_DATE:</strong>{" "}
                {user.createdAt.toISOString().split("T")[0]}
              </p>
            </div>
          </Card>
        </div>

        {/* Achievements / Credentials (right side) */}
        <Card className="p-5 md:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
            <Medal size={16} /> Badges & Achievements
          </h2>
          <Separator className="mb-5" />

          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.map((ach, idx) => (
              <Card
                key={idx}
                className={`relative flex gap-3 p-3 ${
                  ach.unlocked
                    ? "bg-background/40"
                    : "bg-background/10 opacity-60"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center border border-border text-lg ${
                    ach.unlocked
                      ? "border-primary/20 bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  {ach.unlocked ? "🏆" : "🔒"}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-foreground">
                    {ach.title}
                  </span>
                  <span className="mt-0.5 text-[9px] leading-snug text-muted-foreground">
                    {ach.description}
                  </span>
                  {ach.unlocked && (
                    <span className="mt-1 text-[8px] font-bold tracking-widest text-emerald-500">
                      UNLOCKED: {ach.unlockedAt}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Separator className="mt-8 mb-5" />
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <Gear size={14} /> Profile Security Settings
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Sync Progress to Cloud</Button>
              <Button variant="outline" size="sm">
                Reset Operative XP
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
