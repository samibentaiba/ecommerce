"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle, Quote, ShoppingCart, ArrowRight } from "lucide-react"
import Image from "next/image"

type SectionType = "hero" | "features" | "testimonials" | "cta" | "text" | "image" | "gallery"

interface SectionPreviewProps {
  type: SectionType
  title: string
  content: string
  settings?: Record<string, any>
}

// Sample data for previews
const sampleData = {
  product: {
    name: "Premium Wireless Headphones",
    price: "$299.99",
    originalPrice: "$399.99",
    description: "High-quality wireless headphones with advanced noise cancellation technology",
    image: "/placeholder.svg?height=400&width=600",
    rating: 4.5,
    features: [
      "Active Noise Cancellation",
      "40-hour battery life",
      "Premium audio quality",
      "Comfortable design"
    ],
    testimonials: [
      {
        name: "Sarah Johnson",
        role: "Music Producer",
        content: "These headphones are incredible! The sound quality is unmatched.",
        rating: 5
      },
      {
        name: "Mike Chen",
        role: "Tech Enthusiast",
        content: "Best wireless headphones I've ever owned. Battery life is amazing.",
        rating: 5
      },
      {
        name: "Emily Davis",
        role: "Fitness Trainer",
        content: "Perfect for my workouts. They stay in place and sound great.",
        rating: 4
      }
    ]
  }
}

export const SectionPreview: React.FC<SectionPreviewProps> = ({ 
  type, 
  title, 
  content, 
  settings = {} 
}) => {
  const renderHeroSection = () => (
    <div className="relative min-h-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
      <div className="relative z-10 flex items-center justify-between p-8 h-full">
        <div className="flex-1 max-w-2xl">
          <Badge variant="secondary" className="mb-4">New Product</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {title || "Experience Sound Like Never Before"}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {content || sampleData.product.description}
          </p>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(sampleData.product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {sampleData.product.rating} ({Math.floor(Math.random() * 1000) + 500} reviews)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Shop Now
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <Image
            src={sampleData.product.image}
            alt={sampleData.product.name}
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )

  const renderFeaturesSection = () => (
    <div className="bg-white rounded-lg p-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {title || "Key Features"}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {content || "Discover what makes our product stand out from the competition"}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sampleData.product.features.map((feature, index) => (
          <Card key={index} className="text-center border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature}</h3>
              <p className="text-sm text-gray-600">
                Experience premium quality with every use
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderTestimonialsSection = () => (
    <div className="bg-gray-50 rounded-lg p-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {title || "What Our Customers Say"}
        </h2>
        <p className="text-lg text-gray-600">
          {content || "Real reviews from satisfied customers"}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleData.product.testimonials.map((testimonial, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <Quote className="w-8 h-8 text-gray-300 mb-4" />
              <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderCTASection = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
      <h2 className="text-3xl font-bold mb-4">
        {title || "Ready to Get Started?"}
      </h2>
      <p className="text-xl mb-6 opacity-90">
        {content || "Join thousands of satisfied customers today"}
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Shop Now
        </Button>
        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
          Learn More
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderTextSection = () => (
    <div className="bg-white rounded-lg p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {title || "About Our Product"}
        </h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            {content || sampleData.product.description}
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our commitment to quality and innovation has made us a trusted name in the industry. 
            We believe that great products should be accessible to everyone, which is why we 
            focus on creating value without compromising on quality.
          </p>
        </div>
      </div>
    </div>
  )

  const renderImageSection = () => (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {title || "Product Showcase"}
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          {content || "See our product in action"}
        </p>
      </div>
      <div className="relative">
        <Image
          src={sampleData.product.image}
          alt={sampleData.product.name}
          width={800}
          height={500}
          className="w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
            View Full Size
          </Button>
        </div>
      </div>
    </div>
  )

  const renderGallerySection = () => (
    <div className="bg-white rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {title || "Product Gallery"}
        </h2>
        <p className="text-lg text-gray-600">
          {content || "Explore every detail of our product"}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={`/placeholder.svg?height=200&width=200&text=Image+${index + 1}`}
              alt={`Product image ${index + 1}`}
              width={200}
              height={200}
              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  )

  const renderSection = () => {
    switch (type) {
      case "hero":
        return renderHeroSection()
      case "features":
        return renderFeaturesSection()
      case "testimonials":
        return renderTestimonialsSection()
      case "cta":
        return renderCTASection()
      case "text":
        return renderTextSection()
      case "image":
        return renderImageSection()
      case "gallery":
        return renderGallerySection()
      default:
        return renderTextSection()
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {type.toUpperCase()} Section Preview
          </span>
          <Badge variant="outline" className="text-xs">
            Client View
          </Badge>
        </div>
      </div>
      <div className="bg-white">
        {renderSection()}
      </div>
    </div>
  )
} 