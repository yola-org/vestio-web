'use client';

import { ArrowIcon } from '@/components/shared/Icons';
import { heroImage } from '@/constants/data';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Hero() {
  const t = useTranslations();

  return (
    <div className="main-container">
      <section className="relative min-h-[720px] overflow-hidden bg-[#d7b7a5] rounded-2xl">
        <img
          src={heroImage}
          alt={t('home.hero.imageAlt')}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative flex h-full min-h-[720px] flex-col justify-center py-20 sm:px-5 lg:px-10 xl:px-22">
          <div className="max-w-2xl">
            <p className="mb-6 flex items-center gap-3 text-xs font-black tracking-[0.18em] text-[#d8f05e] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#ff5d39]" /> {t('home.hero.eyebrow')}
            </p>
            <h1 className="text-[clamp(3.5rem,8vw,8.5rem)] leading-[0.82] font-black tracking-[-0.075em] text-white uppercase">
              {t('home.hero.titleLine1')}<br /><span className="text-[#d8f05e]">{t('home.hero.titleLine2')}</span><br />{t('home.hero.titleLine3')}
            </h1>
            <p className="mt-8 max-w-lg text-base leading-8 text-white/90 sm:text-xl">
              {t('home.hero.description')}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#shop" className="flex items-center gap-3 rounded-full bg-[#ff5d39] px-8 py-4.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e94422]">
                {t('home.hero.explore')} <ArrowIcon className="h-5 w-5" />
              </a>
              <Link href="/register" className="rounded-full border-2 border-white/40 bg-white/10 px-8 py-4.5 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/20">
                {t('home.hero.emptyCloset')}
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-3 border-t border-white/20 pt-6 text-xs font-bold text-white/70 uppercase tracking-widest">
              <span>{t('home.hero.members')}</span>
              <span>{t('home.hero.cities')}</span>
              <span>{t('home.hero.fees')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
