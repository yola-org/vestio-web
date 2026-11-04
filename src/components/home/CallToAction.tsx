'use client';

import { ArrowIcon } from '@/components/shared/Icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function CallToAction() {
  const t = useTranslations();

  return (
    <section id="sell" className="mx-auto grid max-w-[1440px] bg-[#173fdb] text-white lg:grid-cols-2">
      <div className="relative min-h-[430px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1753219882414-4ec16b84cb82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200" alt={t('home.cta.imageAlt')} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#ff5d39]/25 mix-blend-multiply" />
        <span className="absolute top-6 start-6 rounded-full bg-[#d8f05e] px-4 py-2 text-xs font-black tracking-wider text-black uppercase">{t('home.cta.badge')}</span>
      </div>
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <p className="mb-5 text-xs font-black tracking-[0.18em] text-[#d8f05e] uppercase">{t('home.cta.eyebrow')}</p>
        <h2 className="max-w-xl text-5xl leading-[0.9] font-black tracking-[-0.055em] sm:text-7xl">{t('home.cta.title')}</h2>
        <p className="mt-7 max-w-lg leading-7 text-white/70">{t('home.cta.body')}</p>
        <Link href="/register" className="mt-9 flex w-fit items-center gap-3 rounded-full bg-[#d8f05e] px-7 py-4 text-sm font-black text-black transition hover:-translate-y-0.5">
          {t('home.cta.button')} <ArrowIcon className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
