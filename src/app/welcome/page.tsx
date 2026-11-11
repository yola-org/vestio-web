"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Hero from "@/components/home/Hero"
import CategoryGrid from "@/components/home/CategoryGrid"
import HowItWorks from "@/components/home/HowItWorks"
import ProductGrid from "@/components/home/ProductGrid"
import CallToAction from "@/components/home/CallToAction"
import Manifesto from "@/components/home/Manifesto"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515] selection:bg-[#ff5d39] selection:text-white">
      <Header />
      <main>
        <Hero />
        <CategoryGrid />
        <HowItWorks />
        <ProductGrid />
        <CallToAction />
        <Manifesto />
      </main>
      <Footer />
    </div>
  )
}
