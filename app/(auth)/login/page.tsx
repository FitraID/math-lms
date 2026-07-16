"use client"

import { useState } from "react"
import Link from "next/link"
import { login } from "@/lib/actions/auth"
import { Button } from "@/components/ui/8bit/button"
import { Card } from "@/components/ui/8bit/card"
import { Separator } from "@/components/ui/8bit/separator"
import { Input } from "@/components/ui/8bit/input"

import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="p-6">
        <h2 className="mb-1 text-sm font-bold tracking-wider uppercase">
          ACCESS PORTAL
        </h2>
        <p className="mb-4 text-[10px] text-muted-foreground">
          Enter credentials to initialize session
        </p>
        <Separator className="mb-5" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              EMAIL
            </label>
            <Input
              name="email"
              type="email"
              required
              placeholder="operative@pixel.ac"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              PASSWORD
            </label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-[10px] font-bold text-destructive">
              ⚠ {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "INITIALIZING..." : "LOGIN // ENTER"}
          </Button>
        </form>

        <Separator className="my-5" />
        <p className="text-center text-[10px] text-muted-foreground">
          No account?{" "}
          <Link
            href="/register"
            className="font-bold text-primary underline-offset-2 hover:underline"
          >
            REGISTER
          </Link>
        </p>
      </Card>
    </div>
  )
}
