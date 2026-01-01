"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Github, Mail, ArrowLeft, Loader2 } from "lucide-react"
// Removed BetterAuth imports; we'll call backend directly

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  // No client-side session management from BetterAuth

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const msg = await res.text().catch(() => "Invalid credentials")
        alert(msg || "Invalid credentials")
        setIsLoading(false)
        return
      }

      // Redirect based on role returned by backend
      const payload = await res.json().catch(() => ({}))
      const rawRole = String((payload?.role ?? "")).toLowerCase()
      const isSeller = rawRole === "seller" || rawRole.includes("admin") || rawRole.includes("owner")
      router.replace(isSeller ? "/home" : "/store-explorer")
      // Keep loading until navigation/unmount
    } catch (e) {
      alert("Login failed")
      setIsLoading(false)
    }
  }

  function handleForgot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setForgotSuccess(true)
  }

  // No BetterAuth session routing; backend should set cookies/token

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-87.5">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <ShoppingBag className="size-8" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>Login with your email and password</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={onSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email or phone</Label>
                  <Input id="email" name="email" type="text" placeholder="name@example.com" required />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(!showForgot)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input id="password" name="password" type="password" required />
                </div>

                {showForgot && !forgotSuccess && (
                  <div className="grid gap-2 animate-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="forgot-email">Recover Email</Label>
                    <div className="flex gap-2">
                      <Input id="forgot-email" placeholder="Enter your email" className="flex-1" />
                      <Button type="button" onClick={() => setForgotSuccess(true)}>
                        Send
                      </Button>
                    </div>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="rounded-md bg-green-50 p-3 text-xs text-green-700 border border-green-200 animate-in fade-in duration-300">
                    We sent you an email. Continue there.
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" className="bg-white">
                <Github className="mr-2 h-4 w-4" /> Github
              </Button>
              <Button variant="outline" type="button" className="bg-white">
                <Mail className="mr-2 h-4 w-4" /> Google
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-center gap-2">
            <div className="text-sm text-muted-foreground">Don&apos;t have an account?</div>
            <Link href="/register" className="text-sm font-bold text-primary hover:underline">
              Register now
            </Link>
          </CardFooter>
        </Card>

        <p className="px-8 text-center text-xs text-muted-foreground leading-relaxed">
          By clicking continue, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
