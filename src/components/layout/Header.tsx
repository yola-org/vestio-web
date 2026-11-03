'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchIcon, HeartIcon, UserIcon, MenuIcon, CloseIcon, ChevronIcon, PinIcon, HomeIcon, UploadIcon } from '@/components/shared/Icons';
import UserDropdown from '@/components/layout/UserDropdown';
import { profileApi, callApi } from '@/lib/api';
import { isAuthenticated as hasAuthSession } from '@/lib/auth';
import Link from 'next/link';
import { Category, City } from '@/types/api';
import { HeaderNavSkeleton, MegaMenuSkeleton } from '@/components/layout/HeaderSkeletons';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Toutes les villes');
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const citySelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHeaderData = async () => {
      setLoading(true);
      const [citiesResult, categoriesResult] = await Promise.all([
        callApi(profileApi.getCities(), { silent: true }),
        callApi(profileApi.getCategories(), { silent: true }),
      ]);

      await Promise.all([
        citiesResult.handle({ onSuccess: (data) => setCities(data) }),
        categoriesResult.handle({ onSuccess: (data) => setCategories(data) }),
      ]);

      setLoading(false);
    };

    fetchHeaderData();
  }, []);

  useEffect(() => {
    const updateAuthentication = () => setIsAuthenticated(hasAuthSession());
    updateAuthentication();
    window.addEventListener('vestio:auth-changed', updateAuthentication);
    return () => window.removeEventListener('vestio:auth-changed', updateAuthentication);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (citySelectorRef.current && !citySelectorRef.current.contains(event.target as Node)) {
        setCitySelectorOpen(false);
      }
    };

    if (citySelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [citySelectorOpen]);

  return (
    <header className="relative z-50 border-b border-black/10 bg-[#f7f3ea]">
      <div className="bg-[#173fdb] py-2 text-center text-[11px] font-bold tracking-[0.16em] text-white uppercase sm:text-xs content-padding">
        Achetez près de chez vous • Discutez directement • Aucun frais de livraison
      </div>
      <div className="flex h-20 items-center gap-7 main-container">
        <Link href="/" className="shrink-0 text-[28px] font-black tracking-[-0.06em]" aria-label="Vestio home">
          VESTIO<span className="text-[#ff5d39]">.</span>
        </Link>

        <div className="relative hidden flex-1 lg:block">
          <div className="flex items-center rounded-full border border-black/15 bg-white transition focus-within:border-[#173fdb] focus-within:ring-2 focus-within:ring-[#173fdb]/10">
            <div className="relative border-r border-black/10" ref={citySelectorRef}>
              <button 
                onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                className="flex h-12 items-center gap-2 px-5 text-sm font-bold whitespace-nowrap hover:bg-black/5 rounded-l-full transition"
              >
                <PinIcon className="h-4 w-4 text-[#ff5d39]" />
                {selectedCity}
                <ChevronIcon className={`h-4 w-4 transition ${citySelectorOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {citySelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 overflow-hidden bg-white shadow-2xl rounded-xl border border-black/10 z-50 py-2">
                  <div className="max-h-80 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedCity('Toutes les villes');
                        setCitySelectorOpen(false);
                      }}
                      className={`flex w-full items-center px-5 py-2.5 text-sm transition hover:bg-[#173fdb]/5 ${
                        selectedCity === 'Toutes les villes' ? 'bg-[#173fdb]/10 font-bold text-[#173fdb]' : 'text-black/70'
                      }`}
                    >
                      Toutes les villes
                    </button>
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setSelectedCity(city.name);
                          setCitySelectorOpen(false);
                        }}
                        className={`flex w-full items-center px-5 py-2.5 text-sm transition hover:bg-[#173fdb]/5 ${
                          selectedCity === city.name ? 'bg-[#173fdb]/10 font-bold text-[#173fdb]' : 'text-black/70'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex-1">
              <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-black/40" />
              <input
                type="search"
                placeholder="Rechercher un caftan, une veste, une marque..."
                className="h-12 w-full pr-5 pl-12 text-sm outline-none bg-transparent"
                aria-label="Rechercher des articles"
              />
            </div>
          </div>
        </div>

        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Actions principales">
          <Link href="/welcome#how" className="text-sm font-semibold hover:text-[#173fdb]">Comment ça marche</Link>
          <button className="flex items-center gap-2 text-sm font-semibold hover:text-[#173fdb]">
            <HeartIcon className="h-5 w-5" /> Favoris
          </button>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:text-[#173fdb]" aria-label="Accueil">
            <HomeIcon className="h-5 w-5" />
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/listings/new" className="rounded-full bg-[#ff5d39] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e94422] flex items-center gap-2">
                <UploadIcon className="h-4 w-4" /> Vendre
              </Link>
              <UserDropdown />
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-2 text-sm font-semibold hover:text-[#173fdb]">
                <UserIcon className="h-5 w-5" /> Se connecter
              </Link>
              <Link href="/register" className="rounded-full bg-[#ff5d39] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e94422]">
                Vendre
              </Link>
            </>
          )}
        </nav>
        <button
          className="ml-auto rounded-full border border-black/15 p-2.5 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      <div className="border-t border-black/10">
        {loading ? (
          <HeaderNavSkeleton />
        ) : (
          <nav className="flex h-12 items-center gap-8 overflow-x-auto text-xs font-bold tracking-[0.08em] whitespace-nowrap uppercase main-container" aria-label="Catégories">
            <div
              className="group h-full"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
              onFocus={() => setMegaOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setMegaOpen(false);
              }}
            >
              <button className="flex h-full items-center gap-1.5 text-[#173fdb]" aria-expanded={megaOpen}>
                Toutes les catégories <ChevronIcon className={`h-4 w-4 transition ${megaOpen ? 'rotate-180' : ''}`} />
              </button>
              {megaOpen && (
                loading ? <MegaMenuSkeleton /> : (
                <div className="absolute top-full right-0 left-0 border-t border-black/10 bg-[#f7f3ea] shadow-[0_22px_50px_rgba(0,0,0,0.16)]">
                  <div className="mx-auto grid max-w-[1440px] grid-cols-6 gap-8 py-10 content-padding">
                    {categories.map((parent, index) => (
                      <div key={parent.id} className={index < 5 ? 'border-r border-black/10 pr-4' : ''}>
                        <p className="mb-4 text-base font-black tracking-tight normal-case text-[#151515]">{parent.name}</p>
                        <ul className="space-y-2.5 text-[13px] font-medium tracking-normal normal-case text-black/60">
                          {parent.nestedCategories?.map((child) => (
                            <li key={child.id}>
                              <a href="#shop" className="hover:text-[#173fdb] hover:underline">
                                {child.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                )
              )}
            </div>
            {categories.map((parent) => (
              <a 
                key={parent.id} 
                href="#shop" 
                className="hover:text-[#173fdb]"
              >
                {parent.name}
              </a>
            ))}
          </nav>
        )}
      </div>

      {mobileOpen && (
        <div className="absolute top-full right-0 left-0 border-t border-black/10 bg-[#f7f3ea] p-5 shadow-xl lg:hidden">
          <div className="mb-5 flex flex-col gap-3">
            <div className="relative">
              <button 
                onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-black/15 bg-white px-4 text-sm font-bold"
              >
                <span className="flex items-center gap-2">
                  <PinIcon className="h-4 w-4 text-[#ff5d39]" />
                  {selectedCity}
                </span>
                <ChevronIcon className={`h-4 w-4 transition ${citySelectorOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {citySelectorOpen && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-black/10 bg-white py-2 shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedCity('Toutes les villes');
                      setCitySelectorOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-sm hover:bg-[#173fdb]/5"
                  >
                    Toutes les villes
                  </button>
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        setSelectedCity(city.name);
                        setCitySelectorOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2.5 text-sm hover:bg-[#173fdb]/5"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-black/40" />
              <input 
                type="search" 
                placeholder="Rechercher..." 
                className="h-12 w-full rounded-xl border border-black/15 bg-white pr-4 pl-12 text-sm outline-none" 
              />
            </div>
          </div>
          <div className="grid gap-3 text-sm font-bold">
            <a href="#how" onClick={() => setMobileOpen(false)}>Comment ça marche</a>
            <a href="#shop" onClick={() => setMobileOpen(false)}>Acheter</a>
            {isAuthenticated ? (
              <>
                <Link 
                  href="/listings/new" 
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-[#ff5d39]"
                >
                  <UploadIcon className="h-5 w-5" /> Vendre un article
                </Link>
                <div className="flex items-center" onClick={() => setMobileOpen(false)}>
                  <UserDropdown />
                </div>
              </>
            ) : (
              <>
                <Link href="/register" onClick={() => setMobileOpen(false)}>Vendre un article</Link>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-left">Se connecter</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
