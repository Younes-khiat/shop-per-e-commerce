"use client"

import SimpleNav from "@/components/simple-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Briefcase, ShoppingBag, CreditCard, TrendingUp, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useUser } from "@/components/user-context"

export default function DashboardPage() {
  const { user, refresh } = useUser()
  const [summary, setSummary] = useState<{ totalStores: number; totalProducts: number; totalOrders: number; totalRevenue: number } | null>(null)
  const [breakdown, setBreakdown] = useState<Array<{ name: string; slug: string; products: number; orders: number }>>([])
  const [accountOpen, setAccountOpen] = useState(false)
  const [profileDraft, setProfileDraft] = useState<{ name?: string; first_name?: string; last_name?: string; phone?: string; plan?: string }>({})
  useEffect(() => {
    async function load() {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
        const res = await fetch(`${base}/api/dashboard/summary`, { credentials: "include" })
        if (res.ok) setSummary(await res.json())
        const br = await fetch(`${base}/api/dashboard/breakdown`, { credentials: "include" })
        if (br.ok) setBreakdown(await br.json())
      } catch {}
    }
    load()
  }, [])


  const totalStores = summary?.totalStores ?? Object.keys(user?.stores || {}).length
  const statCards = [
    {
      title: "Total Stores",
      value: totalStores,
      icon: Briefcase,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Total Orders",
      value: summary?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Current Plan",
      value: user?.plan || "Free",
      icon: CreditCard,
      color: "bg-amber-500/10 text-amber-600",
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SimpleNav />
      <div className="container mx-auto px-4 mt-4 flex items-center gap-2">
        <Button variant="secondary" onClick={() => {
          setProfileDraft({ first_name: "", last_name: "", plan: user?.plan || "", phone: (user as any)?.phone || "" })
          setAccountOpen(true)
        }}>My Account</Button>
      </div>
      <AccountDialog
        open={accountOpen}
        onOpenChange={setAccountOpen}
        draft={profileDraft}
        setDraft={setProfileDraft}
        onSave={async () => {
          const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
          try {
            const res = await fetch(`${base}/api/auth/update`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(profileDraft),
            })
            if (res.ok) {
              await refresh()
              setAccountOpen(false)
            }
          } catch {}
        }}
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || user?.email || "User"}!</h1>
        <p className="text-muted-foreground">Current plan: {user?.plan || "none"}</p>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your stores today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={cn("p-2 rounded-lg", stat.color)}>
                <stat.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500 font-medium inline-flex items-center">
                  <TrendingUp className="mr-1 size-3" /> +12%
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Products per project</CardTitle>
            <CardDescription>Total products listed per store</CardDescription>
          </CardHeader>
          <CardContent className="h-75">
            <ChartContainer
              config={{
                products: { label: "Products", color: "var(--primary)" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown.map((b) => ({ name: b.name, products: b.products }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="products" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Orders per project</CardTitle>
            <CardDescription>Conversion performance per store</CardDescription>
          </CardHeader>
          <CardContent className="h-75">
            <ChartContainer
              config={{
                orders: { label: "Orders", color: "var(--accent)" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={breakdown.map((b) => ({ name: b.name, orders: b.orders }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"

// Account dialog
function AccountDialog({ open, onOpenChange, draft, setDraft, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; draft: any; setDraft: (d: any) => void; onSave: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My Account</DialogTitle>
          <DialogDescription>Update your profile information.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
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
        </div>
        <DialogFooter>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
