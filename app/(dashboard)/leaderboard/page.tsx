import { getLeaderboard } from "@/lib/actions/leaderboard"
import { Card } from "@/components/ui/8bit/card"
import { Badge } from "@/components/ui/8bit/badge"
import {
  Trophy,
  Lightning,
  Crown,
  Medal,
  Star,
} from "@phosphor-icons/react/dist/ssr"
import { Separator } from "@/components/ui/8bit/separator"

const RANK_CONFIG = [
  {
    icon: Crown,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10 border-yellow-400",
    label: "1ST",
  },
  {
    icon: Medal,
    color: "text-slate-300",
    bgColor: "bg-slate-300/10 border-slate-300",
    label: "2ND",
  },
  {
    icon: Medal,
    color: "text-amber-600",
    bgColor: "bg-amber-600/10 border-amber-600",
    label: "3RD",
  },
]

export default async function LeaderboardPage() {
  const { users, currentUserId } = await getLeaderboard()

  const topThree = users.slice(0, 3)
  const rest = users.slice(3)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-wider text-foreground uppercase">
          LEADERBOARD // HALL OF FAME
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Rankings based on total XP earned and quest points accumulated.
        </p>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Re-order to show 2nd-1st-3rd for visual podium effect */}
          {[topThree[1], topThree[0], topThree[2]].map((user, podiumIndex) => {
            if (!user) return <div key={podiumIndex} />
            const realRank = podiumIndex === 0 ? 1 : podiumIndex === 1 ? 0 : 2
            const cfg = RANK_CONFIG[realRank]
            const Icon = cfg.icon
            const isMe = user.id === currentUserId

            return (
              <Card
                key={user.id}
                className={`relative flex flex-col items-center gap-3 p-6 text-center transition-all ${
                  podiumIndex === 1
                    ? "border-yellow-400 shadow-[4px_4px_0px_0px_rgb(250,204,21)]"
                    : ""
                } ${isMe ? "ring-2 ring-primary" : ""}`}
              >
                {isMe && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="text-[8px]">YOU</Badge>
                  </div>
                )}
                <Icon size={32} className={cfg.color} weight="fill" />
                <div className="space-y-1">
                  <p
                    className={`text-[10px] font-black tracking-widest uppercase ${cfg.color}`}
                  >
                    {cfg.label} PLACE
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {user.name ?? user.email.split("@")[0]}
                  </p>
                </div>
                <Separator />
                <div className="flex w-full justify-center gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <Lightning
                      size={12}
                      className="text-yellow-400"
                      weight="fill"
                    />
                    <span className="text-xs font-bold">
                      {user.totalXp.toLocaleString()}
                    </span>
                    <span className="text-[8px] text-muted-foreground uppercase">
                      XP
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Star size={12} className="text-purple-400" weight="fill" />
                    <span className="text-xs font-bold">
                      {user.questPoints.toLocaleString()}
                    </span>
                    <span className="text-[8px] text-muted-foreground uppercase">
                      PTS
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      <Card className="p-0">
        {/* Table Header */}
        <div className="grid grid-cols-[3rem_1fr_auto_auto] items-center gap-4 border-b-2 border-foreground bg-muted px-4 py-2">
          <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
            #
          </span>
          <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
            Player
          </span>
          <div className="flex items-center justify-end gap-1">
            <Lightning size={10} className="text-yellow-400" weight="fill" />
            <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
              XP
            </span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <Star size={10} className="text-purple-400" weight="fill" />
            <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
              Points
            </span>
          </div>
        </div>

        {/* All Rows */}
        {users.map((user, index) => {
          const rank = index + 1
          const isMe = user.id === currentUserId
          const cfg = RANK_CONFIG[index] ?? null
          const RankIcon = cfg?.icon

          return (
            <div
              key={user.id}
              className={`grid grid-cols-[3rem_1fr_auto_auto] items-center gap-4 border-b border-border px-4 py-3 transition-colors last:border-0 ${
                isMe ? "bg-primary/10 font-bold" : "hover:bg-muted/40"
              }`}
            >
              {/* Rank */}
              <div className="flex items-center gap-1">
                {RankIcon ? (
                  <RankIcon size={14} className={cfg!.color} weight="fill" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">
                    {rank}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-[10px] font-bold text-primary-foreground uppercase">
                  {(user.name ?? user.email)[0]}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-bold">
                    {user.name ?? user.email.split("@")[0]}
                    {isMe && (
                      <Badge className="ml-2 h-auto px-1 py-0 text-[7px]">
                        YOU
                      </Badge>
                    )}
                  </span>
                  {user.role === "ADMIN" && (
                    <span className="text-[8px] tracking-wider text-muted-foreground uppercase">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* XP */}
              <div className="flex items-center justify-end gap-1">
                <span className="text-xs font-bold text-yellow-500">
                  {user.totalXp.toLocaleString()}
                </span>
              </div>

              {/* Quest Points */}
              <div className="flex items-center justify-end gap-1">
                <span className="text-xs font-bold text-purple-400">
                  {user.questPoints.toLocaleString()}
                </span>
              </div>
            </div>
          )
        })}

        {users.length === 0 && (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No players yet. Be the first on the leaderboard!
          </div>
        )}
      </Card>
    </div>
  )
}
