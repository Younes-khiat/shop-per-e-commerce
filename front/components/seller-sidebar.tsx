"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ShoppingBag, LayoutDashboard, PlusCircle, User, LogOut, Store, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/components/user-context"

const storeItems = [
  { name: "Store-1", slug: "store-1" },
  { name: "Store-2", slug: "store-2" },
  { name: "Store-3", slug: "store-3" },
]

export function SellerSidebar() {
  const pathname = usePathname()
  const { user, loading } = useUser()
  const storesEntries = Object.entries(user?.storeSlugs || {}) // [storeName, slug]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar p-6 flex flex-col">
      <Link href="/home" className="flex items-center gap-2 mb-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <ShoppingBag className="size-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-primary">shop-per</span>
      </Link>

      <div className="flex-1 space-y-8 overflow-y-auto">
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Main Menu</h4>
          <nav className="space-y-1">
            <Link
              href="/home"
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary",
                pathname === "/home" ? "bg-primary/10 text-primary" : "text-muted-foreground",
              )}
            >
              <LayoutDashboard className="mr-3 size-4" />
              Dashboard
            </Link>
          </nav>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">My Stores</h4>
            <Link href="/add-project" className="text-primary hover:text-primary/80">
              <PlusCircle className="size-4" />
            </Link>
          </div>
          <nav className="space-y-1">
            {storesEntries.map(([name, slug]) => (
              <Link
                key={slug}
                href={`/store/${slug}`}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary",
                  pathname === "/home" ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                <div className="flex items-center">
                  <Store className="mr-3 size-4" />
                  {name}
                </div>
                <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
            {!loading && storesEntries.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No projects yet. <Link href="/add-project" className="text-primary hover:text-primary/80">Create one</Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      <div className="pt-6 border-t space-y-2">
        <Link
          href="/profile"
          className={cn(
            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary",
            pathname === "/profile" ? "bg-primary/10 text-primary" : "text-muted-foreground",
          )}
        >
          <User className="mr-3 size-4" />
          My Account
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => (window.location.href = "/")}
        >
          <LogOut className="mr-3 size-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
