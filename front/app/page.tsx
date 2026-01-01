import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Store, Rocket, ShieldCheck, Mail, MapPin, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section id="hero" className="relative overflow-hidden bg-background py-20 lg:py-32">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <span>Launching shop-per 1.0</span>
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
                  Build your <span className="text-primary">dream store</span> in minutes.
                </h1>
                <p className="max-w-150 text-lg text-muted-foreground md:text-xl leading-relaxed">
                  The most friendly, modern, and accessible SaaS platform for university projects and real-world small
                  businesses alike.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all" asChild>
                    <Link href="/register">
                      Get Started <ArrowRight className="ml-2 size-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8 bg-transparent" asChild>
                    <Link href="/docs">How it works</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="relative rounded-2xl border bg-card p-2 shadow-2xl">
                  <Image
                    src="/saas-dashboard-preview.jpg"
                    alt="shop-per Dashboard"
                    width={600}
                    height={400}
                    className="rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 hidden rounded-lg border bg-background p-4 shadow-xl lg:block">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-green-100 p-2 text-green-600">
                      <ShieldCheck className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Secure Mock Auth</p>
                      <p className="text-xs text-muted-foreground">Ready for production integration</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Example Stores Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Powering diverse storefronts</h2>
            <p className="mx-auto mb-16 max-w-2xl text-muted-foreground">
              From anime merchandise to cozy cafes, shop-per provides the tools to reflect your unique brand identity.
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Chopper Merch", type: "Merchandise", img: "/anime-store.jpg" },
                { name: "Pirate Supplies", type: "Adventure", img: "/pirate-shop.jpg" },
                { name: "Straw Hat Cafe", type: "Hospitality", img: "/cozy-cafe.jpg" },
              ].map((store, i) => (
                <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                  <Image
                    src={store.img || "/placeholder.svg"}
                    alt={store.name}
                    width={600}
                    height={400}
                    className="aspect-video object-cover"
                  />
                  <CardContent className="p-6 text-left">
                    <h3 className="text-lg font-bold">{store.name}</h3>
                    <p className="text-sm text-muted-foreground">{store.type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div className="relative order-last lg:order-first">
                <Image
                  src="/clean-code-architecture.jpg"
                  alt="Architecture"
                  width={500}
                  height={500}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Built with Clean Architecture</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  shop-per is not just a store builder; it's a demonstration of high-quality frontend engineering.
                  Created for the MTI module, it emphasizes maintainability, scalability, and clear separation of
                  concerns.
                </p>
                <ul className="space-y-4">
                  {[
                    {
                      icon: Store,
                      title: "Store Management",
                      desc: "Powerful tools for sellers to manage inventory and design.",
                    },
                    {
                      icon: Rocket,
                      title: "Next.js 15+",
                      desc: "Utilizing the latest features of the App Router for optimal performance.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Accessibility First",
                      desc: "Ensuring your stores are usable by everyone, everywhere.",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Get in touch</h2>
              <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
                Have questions about the project or want to collaborate? We'd love to hear from you.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: Mail, title: "Email", value: "hello@shop-per.edu" },
                { icon: Phone, title: "Phone", value: "+1 (555) 000-0000" },
                { icon: MapPin, title: "Location", value: "MTI University Campus" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center rounded-2xl bg-white/10 p-8 text-center backdrop-blur-sm"
                >
                  <div className="mb-4 rounded-full bg-white/20 p-3">
                    <item.icon className="size-6" />
                  </div>
                  <h4 className="mb-2 font-bold">{item.title}</h4>
                  <p className="text-sm text-white/90">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
