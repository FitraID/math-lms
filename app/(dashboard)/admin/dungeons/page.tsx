import Link from "next/link"
import { adminGetDungeons, adminDeleteDungeon } from "@/lib/actions/admin"
import { Card } from "@/components/ui/8bit/card"
import { Badge } from "@/components/ui/8bit/badge"
import { Button } from "@/components/ui/8bit/button"
import { DeleteDungeonButton } from "./delete-dungeon-button"

const difficultyColor: Record<string, string> = {
  NORMAL: "text-emerald-500",
  HARD: "text-amber-500",
  LEGENDARY: "text-red-500",
}

export default async function AdminDungeonsPage() {
  const dungeons = await adminGetDungeons()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-foreground">DUNGEONS</h1>
          <p className="mt-1 text-[10px] text-muted-foreground">{dungeons.length} dungeons total</p>
        </div>
        <Link href="/admin/dungeons/new"><Button>+ NEW DUNGEON</Button></Link>
      </div>
      {dungeons.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">No dungeons yet</p></Card>
      ) : (
        <div className="space-y-3">
          {dungeons.map((d) => (
            <Card key={d.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground">{d.title}</p>
                  <span className={`text-[9px] font-black uppercase ${difficultyColor[d.difficulty] ?? ""}`}>{d.difficulty}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{d.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge variant="outline" className="text-[9px]">{d._count.questions} Q</Badge>
                <Badge variant="outline" className="text-[9px]">{d._count.attempts} attempts</Badge>
                <Badge variant="outline" className="text-[9px]">+{d.xpReward} XP</Badge>
                <DeleteDungeonButton dungeonId={d.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
