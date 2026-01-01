"use client"

import { useState, useEffect } from "react"
import SimpleNav from "@/components/simple-nav"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Store, ArrowRight, Loader2 } from "lucide-react"
type StoreType = {
  id: string
  name: string
  slug: string
  quote?: string
  description?: string
  logo_url?: string
}
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { useUser } from "@/components/user-context"

export default function StoreExplorerPage() {
  return (
    <Suspense fallback={null}>
      <StoreExplorerContent />
    </Suspense>
  )
}

function StoreExplorerContent() {
  const [stores, setStores] = useState<StoreType[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 6
  const { user } = useUser()

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
    fetch(`${base}/api/stores/`)
      .then(async (res) => (res.ok ? res.json() : []))
      .then((data) => {
        const mapped = (data || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          quote: s.quote,
          description: s.description,
          logo_url: s.logo_url,
        }))
        setStores(mapped)
        setLoading(false)
      })
  }, [])

  // user info provided by context

  const searchLower = search.toLowerCase()
  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchLower) ||
      (s.quote?.toLowerCase()?.includes(searchLower) ?? false),
  )
  const totalPages = Math.max(1, Math.ceil(filteredStores.length / pageSize))
  const currentPageStores = filteredStores.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SimpleNav />
      <div className="container mx-auto px-4 mt-4">
        <div className="mb-2 text-sm text-muted-foreground">Welcome, {user?.name || user?.email || "User"} — Plan: {user?.plan || "none"}</div>
        <Button variant="secondary" asChild>
          <Link href="/home">Edit Profile</Link>
        </Button>
      </div>
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-12 space-y-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">Explore Stores</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover unique products and services from independent sellers powered by shop-per.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search stores or niches..."
              className="pl-10 bg-white rounded-full shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {currentPageStores.map((store) => (
                <Card
                  key={store.id}
                  className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={store.logo_url || "/placeholder.svg"}
                      alt={store.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Store className="size-4" />
                      </div>
                      <h3 className="text-xl font-bold">{store.name}</h3>
                    </div>
                    <p className="text-sm italic text-primary/80 mb-4">&quot;{store.quote}&quot;</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{store.description}</p>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <Button className="w-full rounded-full group/btn" asChild>
                      <Link href={`/store/${store.slug}`}>
                        Visit Store{" "}
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </>
        )}

        {!loading && filteredStores.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed">
            <Store className="size-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">No stores found matching your search.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
