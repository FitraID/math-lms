"use client"

import { useState } from "react"
import { adminDeleteDungeon } from "@/lib/actions/admin"
import { toast } from "@/components/ui/8bit/toast"
import { toast as sonnerToast } from "sonner"
import { useRouter } from "next/navigation"

export function DeleteDungeonButton({ dungeonId }: { dungeonId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this dungeon?")) return
    setLoading(true)
    try {
      const result = await adminDeleteDungeon(dungeonId)
      if (!result.success) {
        sonnerToast.error(result.success)
      } else {
        toast("Dungeon deleted successfully")
        router.refresh()
      }
    } catch (e: any) {
      sonnerToast.error(e.message || "Failed to delete dungeon")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-[10px] font-bold text-destructive hover:underline disabled:opacity-50"
    >
      {loading ? "DELETING..." : "DELETE"}
    </button>
  )
}
