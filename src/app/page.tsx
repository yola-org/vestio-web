"use client"

// Listen for auth changes

import PageSkeleton from "@/components/shared/PageSkeleton"
import Skeleton, { SkeletonGroup } from "@/components/shared/Skeleton"
import { ListingGridSkeleton } from "@/components/shared/ListingSkeletons"
import { useState, useEffect } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Hero from "@/components/home/Hero"
import CategoryGrid from "@/components/home/CategoryGrid"
import HowItWorks from "@/components/home/HowItWorks"
import ProductGrid from "@/components/home/ProductGrid"
import CallToAction from "@/components/home/CallToAction"
import Manifesto from "@/components/home/Manifesto"
import AuthenticatedHome from "@/components/home/AuthenticatedHome"
import { isAuthenticated as hasAuthSession } from "@/lib/auth"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateAuthentication = () => setIsAuthenticated(hasAuthSession())
    updateAuthentication()
    window.addEventListener("vestio:auth-changed", updateAuthentication)

    setLoading(false)
    return () =>
      window.removeEventListener("vestio:auth-changed", updateAuthentication)
  }, [])

  if (loading) {
    return (
      <PageSkeleton>
        <main className="main-container space-y-10 py-12">
          <SkeletonGroup className="space-y-5">
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-8 w-48" />
          </SkeletonGroup>
          <ListingGridSkeleton />
        </main>
      </PageSkeleton>
    )
  }

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent selection:text-white">
      <Header />
      <main>
        {isAuthenticated ? (
          <AuthenticatedHome />
        ) : (
          <>
            <Hero />
            <CategoryGrid />
            <HowItWorks />
            <ProductGrid />
            <CallToAction />
            <Manifesto />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
