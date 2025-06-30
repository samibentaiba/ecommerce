import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Award, Globe, Heart, Leaf, Star, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ThemeLanguageSwitcher } from "@/components/ui/theme-language-switcher"

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Passionate about sustainable business and customer experience.",
  },
  {
    name: "Michael Chen",
    role: "Head of Product",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Expert in product development and quality assurance.",
  },
  {
    name: "Emily Rodriguez",
    role: "Customer Success",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Dedicated to ensuring every customer has an amazing experience.",
  },
  {
    name: "David Kim",
    role: "Technology Lead",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Building the future of e-commerce with innovative solutions.",
  },
]

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description: "Every decision we make is centered around providing the best possible experience for our customers.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description: "We're committed to environmental responsibility and sustainable business practices.",
  },
  {
    icon: Award,
    title: "Quality Excellence",
    description: "We carefully curate every product to ensure it meets our high standards for quality and value.",
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Building a business that makes a positive impact on communities around the world.",
  },
]

const milestones = [
  {
    year: "2020",
    title: "Company Founded",
    description: "Started with a vision to make quality products accessible to everyone.",
  },
  {
    year: "2021",
    title: "First 1,000 Customers",
    description: "Reached our first major milestone and expanded our product catalog.",
  },
  {
    year: "2022",
    title: "Sustainability Initiative",
    description: "Launched our eco-friendly product line and carbon-neutral shipping.",
  },
  {
    year: "2023",
    title: "Global Expansion",
    description: "Expanded to serve customers in over 25 countries worldwide.",
  },
  {
    year: "2024",
    title: "100,000+ Happy Customers",
    description: "Celebrating our growing community of satisfied customers.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              EcoStore
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/products" className="text-muted-foreground hover:text-foreground">
                Products
              </Link>
              <Link href="/collections" className="text-muted-foreground hover:text-foreground">
                Collections
              </Link>
              <Link href="/about" className="text-foreground font-medium">
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeLanguageSwitcher />
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">About EcoStore</h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                We're on a mission to make quality products accessible to everyone while building a sustainable future.
                Since 2020, we've been committed to exceptional customer service, product excellence, and environmental
                responsibility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg">
                  Shop Our Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="About EcoStore"
                width={600}
                height={500}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100K+</div>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-muted-foreground">Products</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">25+</div>
              <p className="text-muted-foreground">Countries</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">4.8</div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and shape how we serve our customers and community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From a small startup to a global e-commerce platform, here's how we've grown over the years.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200"></div>

              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <Card className="p-6">
                      <CardContent className="pt-0">
                        <Badge variant="outline" className="mb-2">
                          {milestone.year}
                        </Badge>
                        <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind EcoStore who work every day to bring you the best products and service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground">Real feedback from our valued customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6">
              <CardContent className="pt-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "Exceptional quality products and outstanding customer service. EcoStore has become my go-to for all
                  my shopping needs."
                </p>
                <div>
                  <div className="font-semibold">Jennifer Martinez</div>
                  <div className="text-sm text-muted-foreground">Verified Customer</div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="pt-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "Fast shipping, great prices, and products that exceed expectations. I've recommended EcoStore to all
                  my friends."
                </p>
                <div>
                  <div className="font-semibold">Robert Thompson</div>
                  <div className="text-sm text-muted-foreground">Verified Customer</div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="pt-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "Love their commitment to sustainability and the environment. Quality products with a conscience."
                </p>
                <div>
                  <div className="font-semibold">Lisa Wang</div>
                  <div className="text-sm text-muted-foreground">Verified Customer</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Discover amazing products, exceptional service, and become part of the EcoStore family today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-bold text-lg mb-4">EcoStore</h5>
              <p className="text-gray-400">Your trusted partner for quality products and exceptional service.</p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Quick Links</h6>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/products" className="hover:text-white">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="hover:text-white">
                    Collections
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white">
                    Shipping
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Connect</h6>
              <p className="text-gray-400">Follow us for updates and special offers.</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EcoStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

