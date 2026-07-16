import { notFound } from "next/navigation"
import { getDungeonWithQuestions } from "@/lib/actions/dungeons"
import DungeonClient from "./dungeon-client"

export default async function DungeonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getDungeonWithQuestions(id)

  if (!data) notFound()

  return (
    <div className="max-w-2xl">
      <DungeonClient dungeon={data.dungeon} />
    </div>
  )
}
