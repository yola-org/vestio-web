'use client';

import { ArrowIcon } from '@/components/shared/Icons';
import { useTranslations } from 'next-intl';

export default function HomeHero() {
  const t = useTranslations();

  return (
    <div className="main-container mt-6">
      <section className="relative h-48 overflow-hidden rounded-2xl bg-[#d7b7a5]">
        <img
          src="https://images.unsplash.com/photo-1750981089377-2883600c08b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1600"
          alt={t('home.banner.alt')}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#173fdb]/40 to-transparent" />

        <div className="relative flex h-full flex-col justify-center px-8 sm:px-12">
          <h2 className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
            {t('home.banner.titlePrefix')} <span className="text-[#d8f05e]">{t('home.banner.titleHighlight')}</span>
          </h2>
          <p className="mt-2 max-w-md text-sm font-medium text-white/90">
            {t('home.banner.subtitle')}
          </p>
        </div>
      </section>
    </div>
  );
}
