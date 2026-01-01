import type React from "react"
import { SellerSidebar } from "@/components/seller-sidebar"

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <SellerSidebar />
      <main className="pl-64 min-h-screen">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}
