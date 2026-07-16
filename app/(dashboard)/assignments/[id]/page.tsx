import { notFound } from "next/navigation"
import { getQuestWithQuestions } from "@/lib/actions/quests"
import QuestClient from "./quest-client"

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getQuestWithQuestions(id)

  if (!data) notFound()

  return (
    <div className="">
      <QuestClient quest={data.quest} />
    </div>
  )
}
