"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/components/user-context"
import { useRouter } from "next/navigation"

export default function AddProjectPage() {
  // Navbar items removed per request
  const [products, setProducts] = useState([
    { name: "", oldPrice: "", currentPrice: "", freeDelivery: false, description: "" },
    { name: "", oldPrice: "", currentPrice: "", freeDelivery: false, description: "" },
    { name: "", oldPrice: "", currentPrice: "", freeDelivery: false, description: "" },
  ])

  // Removed navbar items handlers

  // Products step removed per request

  const router = useRouter()
  const { user, refresh } = useUser()
  const [creating, setCreating] = useState(false)
  const [projName, setProjName] = useState("")
  const [navbarEnabled, setNavbarEnabled] = useState(false)
  const [logoPosition, setLogoPosition] = useState<"left"|"center"|"right"|"none">("left")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoAlt, setLogoAlt] = useState("")

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-12">
      <div className="flex items-center justify-between">
        <Link
          href="/home"
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
        </Link>
          <Button className="rounded-full shadow-lg" disabled={creating} onClick={async () => {
            if (!projName.trim()) { alert("Please enter a project name"); return }
            setCreating(true)
            try {
              const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
              const fd = new FormData()
              fd.append("name", projName)
              fd.append("store_type", (document.getElementById("store-type") as HTMLInputElement)?.value || "")
              fd.append("email", (document.getElementById("store-email") as HTMLInputElement)?.value || "")
              fd.append("phone", (document.getElementById("store-phone") as HTMLInputElement)?.value || "")
              fd.append("quote", (document.getElementById("store-quote") as HTMLInputElement)?.value || "")
              fd.append("description", (document.getElementById("store-desc") as HTMLTextAreaElement)?.value || "")
              fd.append("navbar_enabled", String(navbarEnabled))
              fd.append("logo_position", logoPosition)
              if (logoFile) fd.append("logo", logoFile)
              if (logoAlt) fd.append("logo_alt", logoAlt)

              const res = await fetch(`${base}/api/stores/create`, {
                method: "POST",
                credentials: "include",
                body: fd,
              })
              if (!res.ok) {
                const msg = await res.text().catch(() => "Failed to create store")
                alert(msg)
                setCreating(false)
                return
              }
              await refresh()
              router.replace("/home")
            } catch (e) {
              alert("Network error. Please try again.")
            } finally {
              setCreating(false)
            }
          }}>
            {creating ? <Save className="mr-2 size-4 animate-pulse" /> : <Save className="mr-2 size-4" />}
            Create Project
          </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Create your Store</h1>
        <p className="text-muted-foreground text-lg">Follow the steps below to configure your new online storefront.</p>
      </div>

      {/* Step 1: General Info */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-2 bg-primary/20 w-full" />
        <CardHeader>
          <CardTitle className="text-xl">1. General Information</CardTitle>
          <CardDescription>The core details of your online business.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proj-name">Project name</Label>
              <Input id="proj-name" placeholder="My Awesome Store" value={projName} onChange={(e) => setProjName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-type">Store type</Label>
              <Input id="store-type" placeholder="Merchandise, Food, Services..." />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store-email">Store email</Label>
              <Input id="store-email" type="email" placeholder="contact@store.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">Store phone</Label>
              <Input id="store-phone" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-quote">Store quote</Label>
            <Input id="store-quote" placeholder="Quality you can trust" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-desc">Description</Label>
            <Textarea id="store-desc" placeholder="Tell us about your business..." className="min-h-25" />
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Navbar Configuration */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-2 bg-accent/20 w-full" />
        <CardHeader>
          <CardTitle className="text-xl">2. Navigation Bar</CardTitle>
          <CardDescription>Configure how users navigate your store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox id="enable-nav" checked={navbarEnabled} onCheckedChange={(v) => setNavbarEnabled(!!v)} />
            <Label htmlFor="enable-nav">Enable navbar</Label>
          </div>

          <div className="space-y-3">
            <Label>Logo position</Label>
            <RadioGroup value={logoPosition} onValueChange={(v) => setLogoPosition(v as any)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="logo-left" />
                <Label htmlFor="logo-left">Left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="center" id="logo-center" />
                <Label htmlFor="logo-center">Center</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="logo-right" />
                <Label htmlFor="logo-right">Right</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="logo-none" />
                <Label htmlFor="logo-none">No logo</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="store-logo">Store logo</Label>
            <Input id="store-logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo-alt">Logo alt text</Label>
                <Input id="logo-alt" placeholder="Company logo" value={logoAlt} onChange={(e) => setLogoAlt(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Navbar items removed */}
        </CardContent>
      </Card>

      {/* Step 3 removed: Products */}

      <div className="flex justify-end pt-8">
        <Button size="lg" className="rounded-full px-12 shadow-xl hover:scale-105 transition-transform">
          Finalize & Launch Store
        </Button>
      </div>
    </div>
  )
}
