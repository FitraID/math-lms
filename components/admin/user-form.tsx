"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/8bit/button"
import { Input } from "@/components/ui/8bit/input"
import { Label } from "@/components/ui/8bit/label"
import { Card } from "@/components/ui/8bit/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/8bit/select"

import { adminCreateUser, adminUpdateUser } from "@/lib/actions/admin"

export type UserFormProps = {
  initialData?: {
    id: string
    name: string | null
    email: string
    role: string
    totalXp: number
  }
}

export function UserForm({ initialData }: UserFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [loading, setLoading] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      let result
      if (isEditing) {
        result = await adminUpdateUser(initialData.id, formData)
      } else {
        result = await adminCreateUser(formData)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          isEditing ? "User updated successfully" : "User created successfully"
        )
        router.push("/admin/users")
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto p-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name || ""}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initialData?.email || ""}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password{" "}
              {isEditing && (
                <span className="text-xs font-normal text-muted-foreground">
                  (Leave blank to keep current)
                </span>
              )}
            </Label>
            <Input
              id="password"
              name="password"
              type="text"
              placeholder={
                isEditing ? "Enter new password to overwrite" : "••••••••"
              }
              required={!isEditing}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={initialData?.role || "USER"}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalXp">Total XP</Label>
            <Input
              id="totalXp"
              name="totalXp"
              type="number"
              defaultValue={initialData?.totalXp || 0}
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Save Changes" : "Create User"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
