"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ShoppingBag, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
// Removed BetterAuth client; we will call backend directly

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("client")
  const [selectedPlan, setSelectedPlan] = useState<string>("free")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string

    const name = `${firstName} ${lastName}`.trim()
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
      const res = await fetch(`${base}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, firstName, lastName, phone, role: selectedRole, plan: selectedPlan || "none", name }),
      })

      if (!res.ok) {
        const msg = await res.text().catch(() => "Registration failed")
        alert(msg || "Registration failed")
        setIsLoading(false)
        return
      }

      router.replace("/login")
    } catch (e) {
      setIsLoading(false)
      alert("Registration failed")
    }
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center py-12 lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-112.5">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <ShoppingBag className="size-8" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Start building your online store today</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Registration</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-6">
              {/* Role selection */}
              <div className="grid gap-3">
                <Label>Choose account type</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={selectedRole === "client" ? "default" : "outline"}
                    onClick={() => setSelectedRole("client")}
                  >
                    Client
                  </Button>
                  <Button
                    type="button"
                    variant={selectedRole === "seller" ? "default" : "outline"}
                    onClick={() => setSelectedRole("seller")}
                  >
                    Seller
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" name="firstName" placeholder="Tony" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" name="lastName" placeholder="Chopper" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="chopper@shop-per.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              {selectedRole === "seller" && (
                <div className="grid gap-3">
                  <Label>Select your plan</Label>
                  <RadioGroup defaultValue="free" onValueChange={setSelectedPlan} className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2 rounded-md border p-2 has-checked:border-primary has-checked:bg-primary/5">
                      <RadioGroupItem value="free" id="plan-free" />
                      <Label htmlFor="plan-free" className="cursor-pointer">
                        Free
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-2 has-checked:border-primary has-checked:bg-primary/5">
                      <RadioGroupItem value="pro" id="plan-pro" />
                      <Label htmlFor="plan-pro" className="cursor-pointer">
                        Pro
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-2 has-checked:border-primary has-checked:bg-primary/5">
                      <RadioGroupItem value="business" id="plan-business" />
                      <Label htmlFor="plan-business" className="cursor-pointer">
                        Business
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {selectedRole === "seller" && (selectedPlan === "pro" || selectedPlan === "business") && (
                <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-700 border border-amber-200 animate-in fade-in zoom-in-95 duration-300">
                  <AlertCircle className="size-4 shrink-0" />
                  <p>This plan is under development. You will be notified when it becomes fully active.</p>
                </div>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-0.5"
                >
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Privacy Policy and Terms of Service
                  </Link>
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-10 w-full bg-muted/50 rounded flex items-center justify-center text-[10px] text-muted-foreground uppercase tracking-widest border border-dashed">
                  Captcha Placeholder
                </div>
              </div>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-center gap-2">
            <div className="text-sm text-muted-foreground">Already have an account?</div>
            <Link href="/login" className="text-sm font-bold text-primary hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
