import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/actions/auth"

export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    orderBy: [{ totalXp: "desc" }, { questPoints: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      totalXp: true,
      questPoints: true,
      role: true,
    },
  })

  const currentUser = await getCurrentUser()

  return { users, currentUserId: currentUser?.id ?? null }
}
