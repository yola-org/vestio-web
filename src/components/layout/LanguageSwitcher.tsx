'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CheckIcon, ChevronIcon, GlobeIcon } from '@/components/shared/Icons';
import { LOCALE_COOKIE, localeDirection, localeNames, locales, type Locale } from '@/i18n/config';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectLocale = (next: Locale) => {
    if (next !== locale) {
      const maxAge = 60 * 60 * 24 * 365;
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${maxAge};samesite=lax`;
      document.documentElement.lang = next;
      document.documentElement.dir = localeDirection(next);
      router.refresh();
    }

    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-70"
        aria-label={t('common.language')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <GlobeIcon className="h-5 w-5 opacity-70" />
        <span className="relative top-0.5">{localeNames[locale].short}</span>
        <ChevronIcon className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('common.language')}
          className="absolute end-0 top-full z-[70] mt-2 w-44 overflow-hidden rounded-xl border border-black/10 bg-white py-1 text-primary shadow-2xl"
        >
          {locales.map((option) => {
            const isSelected = option === locale;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectLocale(option)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-start text-sm font-semibold transition hover:bg-black/5 ${
                  isSelected ? 'text-deep-accent' : 'text-black/70'
                }`}
              >
                <span>{localeNames[option].native}</span>
                {isSelected && <CheckIcon className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
