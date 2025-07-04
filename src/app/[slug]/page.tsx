
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Check, ArrowRight } from "lucide-react"
import Image from "next/image"

// Mock landing page data - in a real app, this would come from your database
const getLandingPage = (slug: string) => {
  const pages = {
    "premium-headphones": {
      id: 1,
      title: "Premium Headphones Landing",
      slug: "premium-headphones",
      productId: 1,
      productName: "Premium Wireless Headphones",
      headline: "Experience Sound Like Never Before",
      subheadline: "Immerse yourself in crystal-clear audio with our revolutionary wireless headphones",
      description:
        "Discover the ultimate audio experience with our premium wireless headphones featuring advanced noise cancellation technology, premium materials, and industry-leading battery life. Whether you're a music enthusiast, professional, or casual listener, these headphones will transform how you experience sound.",
      heroImage: "/placeholder.svg?height=600&width=1200",
      price: 299.99,
      originalPrice: 399.99,
      features: [
        "Advanced Active Noise Cancellation",
        "30-hour battery life with quick charge",
        "Premium leather and metal construction",
        "Studio-quality 40mm drivers",
        "Bluetooth 5.0 with multipoint connection",
        "Touch controls and voice assistant support",
      ],
      testimonials: [
        {
          name: "Sarah Johnson",
          role: "Music Producer",
          content:
            "These headphones have completely changed my workflow. The sound quality is incredible and the noise cancellation lets me focus completely on my work.",
          rating: 5,
        },
        {
          name: "Mike Chen",
          role: "Frequent Traveler",
          content:
            "Perfect for long flights. The battery lasts forever and the comfort is unmatched. Best purchase I've made this year.",
          rating: 5,
        },
      ],
      benefits: [
        {
          title: "Unmatched Sound Quality",
          description: "Experience every detail with our custom-tuned 40mm drivers and advanced audio processing.",
        },
        {
          title: "All-Day Comfort",
          description: "Premium materials and ergonomic design ensure comfort during extended listening sessions.",
        },
        {
          title: "Smart Features",
          description: "Intuitive touch controls, voice assistant integration, and automatic pause/play detection.",
        },
      ],
    },
    "smart-fitness-watch": {
      id: 2,
      title: "Fitness Watch Campaign",
      slug: "smart-fitness-watch",
      productId: 2,
      productName: "Smart Fitness Watch",
      headline: "Your Health, Your Way",
      subheadline: "Transform your fitness journey with intelligent health monitoring",
      description:
        "Take control of your health and fitness with our advanced smart watch. Featuring comprehensive health monitoring, GPS tracking, and a sleek design that complements any lifestyle. Whether you're training for a marathon or simply want to stay active, this watch adapts to your needs.",
      heroImage: "/placeholder.svg?height=600&width=1200",
      price: 199.99,
      originalPrice: 249.99,
      features: [
        "Continuous heart rate monitoring",
        "Advanced sleep tracking and analysis",
        "Built-in GPS for accurate tracking",
        "Water resistant up to 50 meters",
        "7-day battery life",
        "100+ workout modes",
      ],
      testimonials: [
        {
          name: "Emma Davis",
          role: "Marathon Runner",
          content:
            "The GPS accuracy is incredible and the heart rate monitoring helps me train more effectively. It's become an essential part of my routine.",
          rating: 5,
        },
      ],
      benefits: [
        {
          title: "Comprehensive Health Insights",
          description: "Monitor heart rate, sleep quality, stress levels, and more with medical-grade sensors.",
        },
        {
          title: "Motivation That Works",
          description: "Smart coaching and personalized goals keep you motivated and on track.",
        },
        {
          title: "Built for Life",
          description: "Water resistant design and week-long battery life mean it's ready for anything.",
        },
      ],
    },
  }

  return pages[slug as keyof typeof pages] || null
}

export default function LandingPage({ params }: { params: { slug: string } }) {
  const page = getLandingPage(params.slug)

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <Button>Return Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={page.heroImage || "/placeholder.svg"}
            alt={page.headline}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">{page.headline}</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">{page.subheadline}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4">
              Order Now - ${page.price}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Why Choose {page.productName}?</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">{page.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {page.benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Premium Features</h2>
            <p className="text-xl text-muted-foreground">Every detail designed for excellence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="Product features"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <ul className="space-y-4 text-background">
                {page.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {page.testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Order Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">Ready to Experience the Difference?</h2>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className="text-3xl font-bold">${page.price}</span>
              {page.originalPrice && (
                <>
                  <span className="text-xl line-through opacity-75">${page.originalPrice}</span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Save ${(page.originalPrice - page.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>

          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-700">
                      First Name
                    </Label>
                    <Input id="firstName" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-700">
                      Last Name
                    </Label>
                    <Input id="lastName" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <Input id="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700">
                    Phone
                  </Label>
                  <Input id="phone" type="tel" required />
                </div>
                <div>
                  <Label htmlFor="address" className="text-gray-700">
                    Shipping Address
                  </Label>
                  <Textarea id="address" required />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                  Order Now - ${page.price}
                </Button>
                <p className="text-xs text-center text-gray-600">Free shipping • 30-day returns • 2-year warranty</p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
