"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, LogOut } from "lucide-react"
import { useState } from "react"
import { useUser } from "@/components/user-context"

export default function SimpleNav() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, loading } = useUser()

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
      // Attempt backend logout if available; ignore failures
      if (base) {
        await fetch(`${base}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {})
      }
    } finally {
      router.replace("/register")
    }
  }

  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-extrabold tracking-tight text-xl">
          shop-per
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `Welcome, ${user?.name || user?.email || "User"}${user?.plan ? ` · ${user.plan}` : ""}`}
          </span>
          <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut} className="gap-2">
            {isLoggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
