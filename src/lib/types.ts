
export interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  stock: number
  status: "active" | "inactive"
  image: string
  images?: ProductImage[]
  rating?: number
  reviews?: number
  features?: string[]
  specifications?: Record<string, string>
  variants?: ProductVariant[]
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  variantId?: string
}

export interface ProductVariant {
  id: string
  name: string
  type: "color" | "size" | "feature"
  value: string
  description?: string
  images: ProductImage[]
  priceModifier?: number
  stockQuantity: number
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  products: { name: string; quantity: number; price: number }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  orderDate: string
  shippingAddress: string
}

export interface LandingPage {
  id: number
  title: string
  slug: string
  productId: number
  productName: string
  headline: string
  subheadline?: string
  description: string
  heroImage: string
  status: "published" | "draft"
  createdAt: string
  templateId?: number
  sections?: LandingPageSection[]
  features?: string[]
  testimonials?: {
    name: string
    role: string
    content: string
    rating: number
  }[]
  benefits?: {
    title: string
    description: string
  }[]
}

export interface LandingPageTemplate {
  id: number
  name: string
  description: string
  thumbnail: string
  sections: TemplateSection[]
  createdAt: string
  isDefault: boolean
}

export interface TemplateSection {
  id: string
  type: "hero" | "features" | "testimonials" | "cta" | "text" | "image" | "gallery"
  title: string
  content?: string
  image?: string
  settings: Record<string, any>
  order: number
}

export interface LandingPageSection {
  id: string
  type: "hero" | "features" | "testimonials" | "cta" | "text" | "image" | "gallery"
  title: string
  content?: string
  image?: string
  settings: Record<string, any>
  order: number
}
