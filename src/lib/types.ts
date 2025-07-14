export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  status: "ACTIVE" | "INACTIVE";
  image?: string;
  images?: ProductImage[];
  rating?: number;
  reviews?: number;
  features?: string[];
  specifications?: Record<string, string>;
  variants?: ProductVariant[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  variantId?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: "COLOR" | "SIZE" | "FEATURE";
  value: string;
  description?: string;
  images: ProductImage[];
  variantPrice?: number;
  stockQuantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  shippingAddress: string;
}

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  productId: string;
  productName: string;
  headline: string;
  subheadline?: string;
  description: string;
  heroImage: string;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  templateId?: string;
  sections?: LandingPageSection[];
  features?: string[];
  testimonials?: {
    name: string;
    role: string;
    content: string;
    rating: number;
  }[];
  benefits?: {
    title: string;
    description: string;
  }[];
}

export interface LandingPageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  sections: TemplateSection[];
  createdAt: string;
  isDefault: boolean;
}

export interface TemplateSection {
  id: string;
  type:
    | "hero"
    | "features"
    | "testimonials"
    | "cta"
    | "text"
    | "image"
    | "gallery";
  title: string;
  content?: string;
  image?: string;
  settings: Record<string, any>;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  isVisible?: boolean;
  customCSS?: string;
}

export interface LandingPageSection {
  id: string;
  type:
    | "hero"
    | "features"
    | "testimonials"
    | "cta"
    | "text"
    | "image"
    | "gallery";
  title: string;
  content?: string;
  image?: string;
  settings: Record<string, any>;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  isVisible?: boolean;
  customCSS?: string;
}

export interface ProductPage {
  id: string;
  title: string;
  productId: string;
  productName: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  featuredImage: string;
  status: "PUBLISHED" | "DRAFT";
  seoScore: number;
  lastModified: string;
}
