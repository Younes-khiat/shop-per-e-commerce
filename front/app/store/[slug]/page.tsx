"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ShoppingCart, Truck, ArrowLeft, Loader2, Star, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SellerSidebar } from "@/components/seller-sidebar"
import { useUser } from "@/components/user-context"

type StoreData = {
  id: string
  name: string
  description?: string
  quote?: string
  navbar_enabled?: boolean
  logo_position?: "left" | "center" | "right" | "none"
  logo_url?: string
  logo_alt?: string
  owner_info?: { id?: string | null; name?: string | null; email?: string | null; phone?: string | null }
}

type Product = {
  id: string
  name: string
  images: string[]
  currentPrice: number
  oldPrice?: number
  description?: string
  freeDelivery?: boolean
  ordersCount?: number
}

async function fetchStoreBySlug(slug: string): Promise<StoreData | null> {
  try {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
    const res = await fetch(`${base}/api/stores/by-slug/${encodeURIComponent(slug)}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

type ProductData = {
  id: string
  name: string
  description?: string
  images: string[]
  image_alts?: string[]
  old_price?: number
  current_price?: number
  orders_count?: number
}

async function fetchProductsBySlug(slug: string): Promise<ProductData[]> {
  try {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
    const res = await fetch(`${base}/api/products/by-slug/${encodeURIComponent(slug)}`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export default function StorePublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { user } = useUser()
  const [store, setStore] = useState<StoreData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [editingStore, setEditingStore] = useState(false)
  const [storeName, setStoreName] = useState("")
  const [storeQuote, setStoreQuote] = useState("")
  const [storeDesc, setStoreDesc] = useState("")
  const [storeLogoFile, setStoreLogoFile] = useState<File | null>(null)
  const [storeLogoAlt, setStoreLogoAlt] = useState("")
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null)
  const [prodName, setProdName] = useState("")
  const [prodDesc, setProdDesc] = useState("")
  const [prodOld, setProdOld] = useState<string>("")
  const [prodNew, setProdNew] = useState<string>("")
  const [prodImage, setProdImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isBuying, setIsBuying] = useState(false)

  useEffect(() => {
    async function loadData() {
      const storeData = await fetchStoreBySlug(slug)
      if (storeData) {
        setStore(storeData)
        setStoreName(storeData.name)
        setStoreQuote(storeData.quote || "")
        setStoreDesc(storeData.description || "")
        setStoreLogoAlt(storeData.logo_alt || "")
        const prods = await fetchProductsBySlug(slug)
        setProducts(
          prods.map((p) => ({
            id: p.id,
            name: p.name,
            images: p.images || [],
            description: p.description || "",
            currentPrice: Number(p.current_price || 0),
            oldPrice: p.old_price ? Number(p.old_price) : undefined,
            freeDelivery: false,
            ordersCount: p.orders_count || 0,
          }))
        )
      }
      setLoading(false)
    }
    loadData()
  }, [slug])

  useEffect(() => {
    if (editingProduct) {
      setProdName(editingProduct.name || "")
      setProdDesc(editingProduct.description || "")
      setProdOld(editingProduct.old_price != null ? String(editingProduct.old_price) : "")
      setProdNew(editingProduct.current_price != null ? String(editingProduct.current_price) : "")
      setProdImage(null)
    } else if (showProductModal) {
      setProdName("")
      setProdDesc("")
      setProdOld("")
      setProdNew("")
      setProdImage(null)
    }
  }, [editingProduct, showProductModal])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Store not found</h1>
        <Button asChild>
          <Link href="/home">Back to home</Link>
        </Button>
      </div>
    )
  }

  const handleBuy = () => {
    setIsBuying(true)
    setTimeout(() => {
      setIsBuying(false)
      setSelectedProduct(null)
      alert("Order placed successfully! (This is a mock interaction)")
    }, 1500)
  }

  async function saveStoreEdits() {
    if (!store) return
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
    const fd = new FormData()
    fd.append("name", storeName)
    fd.append("quote", storeQuote)
    fd.append("description", storeDesc)
    if (storeLogoFile) fd.append("logo", storeLogoFile)
    if (storeLogoAlt) fd.append("logo_alt", storeLogoAlt)
    const res = await fetch(`${base}/api/stores/update/${store.id}`, { method: "PATCH", credentials: "include", body: fd })
    if (res.ok) {
      const updated = await res.json()
      setStore(updated)
      setEditingStore(false)
    } else {
      alert("Failed to update store")
    }
  }

  async function submitProduct() {
    if (!store) return
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
    const fd = new FormData()
    fd.append("slug", slug)
    fd.append("name", prodName)
    fd.append("description", prodDesc)
    if (prodOld) fd.append("old_price", prodOld)
    if (prodNew) fd.append("current_price", prodNew)
    if (prodImage) fd.append("images", prodImage)
    const url = editingProduct ? `${base}/api/products/update/${editingProduct.id}` : `${base}/api/products/create`
    const method = editingProduct ? "PATCH" : "POST"
    const res = await fetch(url, { method, credentials: "include", body: fd })
    if (res.ok) {
      setShowProductModal(false)
      setEditingProduct(null)
      const prods = await fetchProductsBySlug(slug)
      setProducts(
        prods.map((p) => ({
          id: p.id,
          name: p.name,
          images: p.images || [],
          description: p.description || "",
          currentPrice: Number(p.current_price || 0),
          oldPrice: p.old_price ? Number(p.old_price) : undefined,
          freeDelivery: false,
        }))
      )
    } else {
      alert("Failed to save product")
    }
  }

  async function buyProduct(pid: string) {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
    const res = await fetch(`${base}/api/products/buy/${pid}`, { method: "POST" })
    if (res.ok) {
      alert("Thank you for purchasing this item")
      const prods = await fetchProductsBySlug(slug)
      setProducts(
        prods.map((p) => ({
          id: p.id,
          name: p.name,
          images: p.images || [],
          description: p.description || "",
          currentPrice: Number(p.current_price || 0),
          oldPrice: p.old_price ? Number(p.old_price) : undefined,
          freeDelivery: false,
        }))
      )
    } else {
      alert("Failed to process order")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`grid gap-0 ${user?.id && store?.owner_info?.id === user.id ? "grid-cols-12" : "grid-cols-1"}`}>
        {user?.id && store?.owner_info?.id === user.id && (
          <aside className="col-span-3 border-r bg-muted/20 min-h-screen">
            <SellerSidebar />
          </aside>
        )}
        <div className={`${user?.id && store?.owner_info?.id === user.id ? "col-span-9" : "col-span-1"} flex flex-col`}>
      {/* Store Header (controlled by navbar_enabled) */}
      {store.navbar_enabled && (
        <header className="border-b bg-white sticky top-0 z-40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/store-explorer"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 size-4" /> Back
            </Link>
            <div className="flex-1 flex items-center gap-6 justify-center">
              <div className="text-left">
                <p className="text-sm font-bold">Owner</p>
                <p className="text-sm text-primary">{store.owner_info?.name || "Unnamed"}</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Email</p>
                <p className="text-sm text-muted-foreground">{store.owner_info?.email || "-"}</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Phone</p>
                <p className="text-sm text-muted-foreground">{store.owner_info?.phone || "-"}</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="relative">
              <ShoppingCart className="size-5" />
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center font-bold">
                0
              </span>
            </Button>
          </div>
        </header>
      )}

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Store Brand Header (logo_position controls alignment) */}
        <div className="mb-16 flex items-start justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">{store.name}</h2>
            {store.quote && <p className="text-sm italic text-primary/70 mt-1">{store.quote}</p>}
            {store.description && <p className="text-muted-foreground mt-3">{store.description}</p>}
          </div>
          {user?.id && store.owner_info?.id === user.id && (
            <Button variant="secondary" onClick={() => setEditingStore(true)}>Edit Store</Button>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer border-none shadow-sm hover:shadow-lg transition-all"
              onClick={() => setEditingProduct({
                id: product.id,
                name: product.name,
                description: product.description,
                images: product.images,
                current_price: product.currentPrice,
                old_price: product.oldPrice,
                orders_count: 0,
              })}
            >
              <div className="aspect-square relative overflow-hidden rounded-t-xl bg-muted/30">
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.freeDelivery && (
                  <div className="absolute top-2 left-2 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                    Free Delivery
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold mb-1 truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-primary">${product.currentPrice}</span>
                  {product.oldPrice && (
                    <span className="text-sm text-muted-foreground line-through">${product.oldPrice}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 fill-current" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">{product.ordersCount ?? 0} orders</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); buyProduct(product.id) }}>Buy</Button>
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setEditingProduct({ id: product.id, name: product.name, description: product.description, images: product.images, current_price: product.currentPrice, old_price: product.oldPrice, orders_count: 0 }) }}>Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {user?.id && store.owner_info?.id === user.id && (
            <Card className="flex items-center justify-center border-dashed">
              <Button size="icon" variant="ghost" onClick={() => setShowProductModal(true)}>
                +
              </Button>
            </Card>
          )}
        </div>
      </main>

      {/* Product Detail Modal */}
      {/* Store edit modal */}
      {user?.id && store.owner_info?.id === user.id && (
      <Dialog open={editingStore} onOpenChange={() => setEditingStore(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
            <DialogDescription>Update store name, quote, description or logo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-sm">Name</label>
            <input className="w-full border rounded p-2" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            <label className="block text-sm">Quote</label>
            <input className="w-full border rounded p-2" value={storeQuote} onChange={(e) => setStoreQuote(e.target.value)} />
            <label className="block text-sm">Description</label>
            <textarea className="w-full border rounded p-2" value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} />
            <label className="block text-sm">Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setStoreLogoFile(e.target.files?.[0] || null)} />
            <label className="block text-sm">Logo Alt</label>
            <input className="w-full border rounded p-2" value={storeLogoAlt} onChange={(e) => setStoreLogoAlt(e.target.value)} />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setEditingStore(false)}>Cancel</Button>
              <Button onClick={saveStoreEdits}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}

      {/* Product create/edit modal */}
      {user?.id && store.owner_info?.id === user.id && (
      <Dialog open={showProductModal || !!editingProduct} onOpenChange={() => { setShowProductModal(false); setEditingProduct(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-sm">Name</label>
            <input className="w-full border rounded p-2" value={prodName} onChange={(e) => setProdName(e.target.value)} />
            <label className="block text-sm">Description</label>
            <textarea className="w-full border rounded p-2" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Old Price</label>
                <input className="w-full border rounded p-2" value={prodOld} onChange={(e) => setProdOld(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">New Price</label>
                <input className="w-full border rounded p-2" value={prodNew} onChange={(e) => setProdNew(e.target.value)} />
              </div>
            </div>
            <label className="block text-sm">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setProdImage(e.target.files?.[0] || null)} />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => { setShowProductModal(false); setEditingProduct(null) }}>Cancel</Button>
              <Button onClick={submitProduct}>{editingProduct ? "Save" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}
        </div>
      </div>
    </div>
  )
}
