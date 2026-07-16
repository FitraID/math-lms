"use client"

import { useState } from "react"
import Link from "next/link"
import { register } from "@/lib/actions/auth"
import { Button } from "@/components/ui/8bit/button"
import { Card } from "@/components/ui/8bit/card"
import { Separator } from "@/components/ui/8bit/separator"
import { Input } from "@/components/ui/8bit/input"

import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    if (formData.get("password") !== formData.get("confirmPassword")) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <Card className="p-6">
      <h2 className="mb-1 text-sm font-bold tracking-wider uppercase">
        NEW OPERATIVE
      </h2>
      <p className="mb-4 text-[10px] text-muted-foreground">
        Create your Pixel Academy account
      </p>
      <Separator className="mb-5" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            OPERATIVE NAME
          </label>
          <Input name="name" type="text" required placeholder="e.g. Novan" />
        </div>

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
              minLength={6}
              placeholder="min. 6 characters"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="min. 6 characters"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-[10px] font-bold text-destructive">
            ⚠ {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "CREATING..." : "REGISTER // ENLIST"}
        </Button>
      </form>

      <Separator className="my-5" />
      <p className="text-center text-[10px] text-muted-foreground">
        Already enlisted?{" "}
        <Link
          href="/login"
          className="font-bold text-primary underline-offset-2 hover:underline"
        >
          LOGIN
        </Link>
      </p>
    </Card>
  )
}
