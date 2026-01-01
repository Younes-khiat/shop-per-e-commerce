"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type UserInfo = {
  id?: string
  name?: string
  email?: string
  role?: string
  plan?: string
  projects?: Array<{ id: string; name: string; created_at: string; owner?: string, ordersCount?: number }>
  stores?: Record<string, string>
  storeSlugs?: Record<string, string>
}

export type UserContextValue = {
  user: UserInfo | null
  loading: boolean
  refresh: () => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"}/api/auth/me`
      const res = await fetch(url, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
        let projects: Array<{ id: string; name: string; created_at: string; owner?: string }> = []
        try {
          const resProjects = await fetch(`${base}/api/projects/mine`, { credentials: "include" })
          if (resProjects.ok) {
            const pdata = await resProjects.json()
            projects = pdata?.map((p: any) => ({ id: p.id, name: p.name, created_at: p.created_at, owner: p.owner })) ?? []
          }
        } catch {}
        setUser({ id: data.id, name: data.name, email: data.email, role: data.role, plan: data.plan, projects, stores: data.stores || {}, storeSlugs: data.stores_slugs || {} })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const value = useMemo<UserContextValue>(() => ({ user, loading, refresh }), [user, loading])
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within a UserProvider")
  return ctx
}
