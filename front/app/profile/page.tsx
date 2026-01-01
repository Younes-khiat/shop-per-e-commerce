"use client"

import SimpleNav from "@/components/simple-nav"
import { useUser } from "@/components/user-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  const { user, refresh } = useUser()
  const [draft, setDraft] = useState<{ first_name?: string; last_name?: string; phone?: string; plan?: string }>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setDraft({
        first_name: (user as any).first_name || "",
        last_name: (user as any).last_name || "",
        phone: (user as any).phone || "",
        plan: user.plan || "",
      })
    }
  }, [user])

  async function onSave() {
    setSaving(true)
    setSaved(null)
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
    try {
      const res = await fetch(`${base}/api/auth/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ first_name: draft.first_name, last_name: draft.last_name, phone: draft.phone, plan: draft.plan }),
      })
      if (res.ok) {
        await refresh()
        setSaved("Profile updated.")
      } else {
        setSaved("Failed to update profile.")
      }
    } catch {
      setSaved("Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SimpleNav />
      <div className="container mx-auto px-4 mt-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/home">
            <ArrowLeft className="size-4" /> Back to Home
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground">View and update your profile information.</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Basic information we use for your stores.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label>First Name</Label>
              <Input value={draft.first_name || ""} onChange={(e) => setDraft({ ...draft, first_name: e.target.value })} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={draft.last_name || ""} onChange={(e) => setDraft({ ...draft, last_name: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={draft.phone || ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </div>
          <div>
            <Label>Plan</Label>
            <select
              className="bg-white border rounded-md h-9 px-3 text-sm"
              value={draft.plan || ""}
              onChange={(e) => setDraft({ ...draft, plan: e.target.value })}
            >
              <option value="">none</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            {saved && <span className="text-sm text-muted-foreground">{saved}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
