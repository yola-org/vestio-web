'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchIcon, HeartIcon, UserIcon, MenuIcon, CloseIcon, ChevronIcon, PinIcon, HomeIcon, UploadIcon } from '@/components/shared/Icons';
import UserDropdown from '@/components/layout/UserDropdown';
import OnboardingStatus from '@/components/layout/OnboardingStatus';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { profileApi, callApi } from '@/lib/api';
import { isAuthenticated as hasAuthSession } from '@/lib/auth';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Category, City } from '@/types/api';
import { HeaderNavSkeleton, MegaMenuSkeleton } from '@/components/layout/HeaderSkeletons';

export default function Header() {
  const t = useTranslations();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
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
    <header className="relative z-50 border-b border-black/10 bg-background">
      <div className="bg-deep-accent py-2 text-center text-[11px] font-bold tracking-[0.16em] text-white uppercase sm:text-xs content-padding">
        {t('header.banner')}
      </div>
      <div className="flex h-20 items-center gap-7 main-container">
        <Link href="/" className="shrink-0 text-[28px] font-black tracking-[-0.06em]" aria-label={t('header.homeAria')}>
          VESTIO<span className="text-accent">.</span>
        </Link>

        <div className="relative hidden flex-1 lg:block">
          <div className="flex items-center rounded-full border border-black/15 bg-white transition focus-within:border-deep-accent focus-within:ring-2 focus-within:ring-deep-accent/10">
            <div className="relative border-e border-black/10" ref={citySelectorRef}>
              <button
                onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                className="flex h-12 items-center gap-2 px-5 text-sm font-bold whitespace-nowrap hover:bg-black/5 rounded-s-full transition"
              >
                <PinIcon className="h-4 w-4 text-accent" />
                {selectedCity ?? t('header.allCities')}
                <ChevronIcon className={`h-4 w-4 transition ${citySelectorOpen ? 'rotate-180' : ''}`} />
              </button>

              {citySelectorOpen && (
                <div className="absolute top-full start-0 mt-2 w-56 overflow-hidden bg-white shadow-2xl rounded-xl border border-black/10 z-50 py-2">
                  <div className="max-h-80 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedCity(null);
                        setCitySelectorOpen(false);
                      }}
                      className={`flex w-full items-center px-5 py-2.5 text-sm transition hover:bg-deep-accent/5 ${
                        selectedCity === null ? 'bg-deep-accent/10 font-bold text-deep-accent' : 'text-black/70'
                      }`}
                    >
                      {t('header.allCities')}
                    </button>
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setSelectedCity(city.name);
                          setCitySelectorOpen(false);
                        }}
                        className={`flex w-full items-center px-5 py-2.5 text-sm transition hover:bg-deep-accent/5 ${
                          selectedCity === city.name ? 'bg-deep-accent/10 font-bold text-deep-accent' : 'text-black/70'
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
              <SearchIcon className="absolute top-1/2 start-4 h-5 w-5 -translate-y-1/2 text-black/40" />
              <input
                type="search"
                placeholder={t('header.searchPlaceholder')}
                className="h-12 w-full pe-5 ps-12 text-sm outline-none bg-transparent"
                aria-label={t('header.searchAria')}
              />
            </div>
          </div>
        </div>

        <nav className="ms-auto hidden items-center gap-6 lg:flex" aria-label={t('header.mainActionsAria')}>
          <Link href="/welcome#how" className="text-sm font-semibold hover:text-deep-accent">{t('header.howItWorks')}</Link>
          <button className="flex items-center gap-2 text-sm font-semibold hover:text-deep-accent">
            <HeartIcon className="h-5 w-5" /> {t('header.favorites')}
          </button>
          {isAuthenticated ? (
            <>
              <Link href="/listings/new" className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90 flex items-center gap-2">
                <UploadIcon className="h-4 w-4" /> {t('header.sell')}
              </Link>
              <OnboardingStatus />
              <UserDropdown />
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-2 text-sm font-semibold hover:text-deep-accent">
                <UserIcon className="h-5 w-5" /> {t('header.login')}
              </Link>
              <Link href="/register" className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90">
                {t('header.sell')}
              </Link>
            </>
          )}
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:text-deep-accent" aria-label={t('header.homeAriaShort')}>
            <HomeIcon className="h-5 w-5" />
          </Link>
          <LanguageSwitcher />
        </nav>
        <button
          className="ms-auto rounded-full border border-black/15 p-2.5 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t('header.closeMenu') : t('header.openMenu')}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      <div className="border-t border-black/10">
        {loading ? (
          <HeaderNavSkeleton />
        ) : (
          <nav className="flex h-12 items-center gap-8 overflow-x-auto text-xs font-bold tracking-[0.08em] whitespace-nowrap uppercase main-container" aria-label={t('header.categoriesAria')}>
            <div
              className="group h-full"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
              onFocus={() => setMegaOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setMegaOpen(false);
              }}
            >
              <button className="flex h-full items-center gap-1.5 text-deep-accent" aria-expanded={megaOpen}>
                {t('header.allCategories')} <ChevronIcon className={`h-4 w-4 transition ${megaOpen ? 'rotate-180' : ''}`} />
              </button>
              {megaOpen && (
                loading ? <MegaMenuSkeleton /> : (
                <div className="absolute top-full end-0 start-0 border-t border-black/10 bg-background shadow-[0_22px_50px_rgba(0,0,0,0.16)]">
                  <div className="mx-auto grid max-w-[1440px] grid-cols-6 gap-8 py-10 content-padding">
                    {categories.map((parent, index) => (
                      <div key={parent.id} className={index < 5 ? 'border-e border-black/10 pe-4' : ''}>
                        <p className="mb-4 text-base font-black tracking-tight normal-case text-primary">{parent.name}</p>
                        <ul className="space-y-2.5 text-[13px] font-medium tracking-normal normal-case text-black/60">
                          {parent.subCategories?.map((child) => (
                            <li key={child.id}>
                              <a href="#shop" className="hover:text-deep-accent hover:underline">
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
                className="hover:text-deep-accent"
              >
                {parent.name}
              </a>
            ))}
          </nav>
        )}
      </div>

      {mobileOpen && (
        <div className="absolute top-full end-0 start-0 border-t border-black/10 bg-background p-5 shadow-xl lg:hidden">
          <div className="mb-5 flex flex-col gap-3">
            <div className="relative">
              <button
                onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-black/15 bg-white px-4 text-sm font-bold"
              >
                <span className="flex items-center gap-2">
                  <PinIcon className="h-4 w-4 text-accent" />
                  {selectedCity ?? t('header.allCities')}
                </span>
                <ChevronIcon className={`h-4 w-4 transition ${citySelectorOpen ? 'rotate-180' : ''}`} />
              </button>

              {citySelectorOpen && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-black/10 bg-white py-2 shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedCity(null);
                      setCitySelectorOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-sm hover:bg-deep-accent/5"
                  >
                    {t('header.allCities')}
                  </button>
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        setSelectedCity(city.name);
                        setCitySelectorOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2.5 text-sm hover:bg-deep-accent/5"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <SearchIcon className="absolute top-1/2 start-4 h-5 w-5 -translate-y-1/2 text-black/40" />
              <input
                type="search"
                placeholder={t('header.mobileSearchPlaceholder')}
                className="h-12 w-full rounded-xl border border-black/15 bg-white pe-4 ps-12 text-sm outline-none"
              />
            </div>
          </div>
          <div className="grid gap-3 text-sm font-bold">
            <a href="#how" onClick={() => setMobileOpen(false)}>{t('header.howItWorks')}</a>
            <a href="#shop" onClick={() => setMobileOpen(false)}>{t('header.buy')}</a>
            {isAuthenticated ? (
              <>
                <Link
                  href="/listings/new"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-accent"
                >
                  <UploadIcon className="h-5 w-5" /> {t('header.sellItem')}
                </Link>
                <div className="flex items-center" onClick={() => setMobileOpen(false)}>
                  <UserDropdown />
                </div>
              </>
            ) : (
              <>
                <Link href="/register" onClick={() => setMobileOpen(false)}>{t('header.sellItem')}</Link>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-start">{t('header.login')}</Link>
              </>
            )}
            <div className="mt-2 border-t border-black/10 pt-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
