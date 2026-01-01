export type DashboardStats = {
  totalProjects: number
  totalOrders: number
  currentPlan: string
  visitsPerProject: { name: string; visits: number }[]
  ordersPerProject: { name: string; orders: number }[]
}

export const mockDashboardService = {
  async getStats(): Promise<DashboardStats> {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 400))

    return {
      totalProjects: 5,
      totalOrders: 128,
      currentPlan: "free",
      visitsPerProject: [
        { name: "Store A", visits: 1240 },
        { name: "Store B", visits: 980 },
        { name: "Store C", visits: 760 },
        { name: "Store D", visits: 540 },
        { name: "Store E", visits: 430 },
      ],
      ordersPerProject: [
        { name: "Store A", orders: 120 },
        { name: "Store B", orders: 95 },
        { name: "Store C", orders: 70 },
        { name: "Store D", orders: 55 },
        { name: "Store E", orders: 45 },
      ],
    }
  },
}

// --- Store Explorer mock data/service ---
export type Store = {
  id: string
  name: string
  slug: string
  image?: string
  quote: string
  description: string
}

const STORES: Store[] = [
  {
    id: "1",
    name: "Store A",
    slug: "store-a",
    image: "/images/store-a.jpg",
    quote: "Quality you can trust",
    description: "Discover curated products and handcrafted goods from Store A, focused on sustainability and style.",
  },
  {
    id: "2",
    name: "Store B",
    slug: "store-b",
    image: "/images/store-b.jpg",
    quote: "Made for everyday",
    description: "Everyday essentials with a modern twist, from apparel to homeware and lifestyle accessories.",
  },
  {
    id: "3",
    name: "Store C",
    slug: "store-c",
    image: "/images/store-c.jpg",
    quote: "Crafted with care",
    description: "Artisan-made products that celebrate craftsmanship and local makers across categories.",
  },
  {
    id: "4",
    name: "Store D",
    slug: "store-d",
    image: "/images/store-d.jpg",
    quote: "Designed to inspire",
    description: "Design-forward collections for work and home — bold, functional, and timeless.",
  },
  {
    id: "5",
    name: "Store E",
    slug: "store-e",
    image: "/images/store-e.jpg",
    quote: "Simple. Better.",
    description: "Minimalist selections with exceptional build quality across tech, accessories, and decor.",
  },
]

export const mockStoreService = {
  async getAllStores(): Promise<Store[]> {
    // Simulate latency similar to dashboard
    await new Promise((r) => setTimeout(r, 300))
    return STORES
  },
}
