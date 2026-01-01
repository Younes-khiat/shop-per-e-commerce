"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

export function Navbar() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <ShoppingBag className="size-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary">shop-per</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Home
          </button>
          <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
            Getting Started
          </Link>
          <button
            onClick={() => scrollToSection("about")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Contact
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button className="rounded-full shadow-md" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
