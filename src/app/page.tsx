'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import CategoryGrid from '@/components/home/CategoryGrid';
import HowItWorks from '@/components/home/HowItWorks';
import ProductGrid from '@/components/home/ProductGrid';
import CallToAction from '@/components/home/CallToAction';
import Manifesto from '@/components/home/Manifesto';
import AuthenticatedHome from '@/components/home/AuthenticatedHome';
import { isAuthenticated as hasAuthSession } from '@/lib/auth';

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateAuthentication = () => setIsAuthenticated(hasAuthSession());
    updateAuthentication();
    
    // Listen for auth changes
    window.addEventListener('vestio:auth-changed', updateAuthentication);
    
    setLoading(false);
    return () => window.removeEventListener('vestio:auth-changed', updateAuthentication);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#173fdb] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515] selection:bg-[#ff5d39] selection:text-white">
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
  );
}
