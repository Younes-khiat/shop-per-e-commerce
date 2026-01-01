import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BookOpen, CheckCircle2, ChevronRight, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
          {/* Docs Sidebar */}
          <aside className="hidden lg:block space-y-8">
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Getting Started</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="font-bold text-primary">
                    Introduction
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Quick Start Guide
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Plans & Pricing</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Plan Comparison
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Billing & Payments
                  </Link>
                </li>
              </ul>
            </div>
          </aside>

          {/* Docs Content */}
          <div className="space-y-12">
            <div>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight">Introduction</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Welcome to the shop-per documentation. Learn how to create, manage, and scale your online presence using
                our friendly SaaS platform.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="size-5 text-primary" />
                    How shop-per works
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  shop-per acts as an abstraction layer between you and the complex world of e-commerce. We handle the
                  hosting, security, and interface, while you focus on your products and customers.
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="size-5 text-primary" />
                    Steps to create a store
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-500" />
                      Create your seller account
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-500" />
                      Choose your store plan
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-500" />
                      Configure your general store info
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-500" />
                      Add your first products
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="mb-6 text-2xl font-bold">Choosing the right plan</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { name: "Free", price: "$0", features: ["1 Store", "3 Products", "Standard Support"] },
                  { name: "Pro", price: "$29", features: ["3 Stores", "50 Products", "Priority Support"] },
                  {
                    name: "Business",
                    price: "$99",
                    features: ["Unlimited Stores", "Unlimited Products", "24/7 Support"],
                  },
                ].map((plan) => (
                  <div key={plan.name} className="flex flex-col rounded-xl border bg-card p-6 shadow-sm">
                    <h4 className="font-bold text-primary">{plan.name}</h4>
                    <p className="my-4 text-3xl font-extrabold">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                    <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <ChevronRight className="size-3 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Ready to start?</h3>
                  <p className="text-primary-foreground/80">
                    Join thousands of sellers building their dreams on shop-per.
                  </p>
                </div>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                  <Link href="/register">Create Store Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
