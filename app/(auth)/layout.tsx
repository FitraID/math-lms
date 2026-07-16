import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-4 border-foreground bg-primary text-2xl shadow-[4px_4px_0px_0px_var(--foreground)] dark:border-ring dark:shadow-[4px_4px_0px_0px_var(--ring)]">
            👾
          </div>
          <h1 className="text-sm font-bold tracking-wider text-foreground uppercase">
            Spatia Lab
          </h1>
          <p className="mt-1 text-[10px] tracking-widest text-muted-foreground uppercase">
            Online Academy — v1.0
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
