'use client';

import Link from 'next/link';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations();

  const columns = [
    {
      title: t('footer.discover'),
      links: [
        t('footer.discoverWomen'),
        t('footer.discoverMen'),
        t('footer.discoverKids'),
        t('footer.discoverDesigners'),
      ],
    },
    {
      title: t('footer.vestio'),
      links: [
        { name: t('footer.howItWorks'), href: '/#how' },
        { name: t('footer.sell'), href: '/register' },
        { name: t('footer.trust'), href: '#' },
        { name: t('footer.manifesto'), href: '#' },
      ],
    },
    {
      title: t('footer.help'),
      links: [
        { name: t('footer.helpCenter'), href: '#' },
        { name: t('footer.contact'), href: '#' },
        { name: t('footer.meetupTips'), href: '#' },
        { name: t('footer.terms'), href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-[#151515] pt-16 pb-8 text-white content-padding">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="text-3xl font-black tracking-[-0.06em]">VESTIO<span className="text-[#ff5d39]">.</span></Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">{t('footer.description')}</p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="mb-5 text-xs font-black tracking-wider text-[#d8f05e] uppercase">{column.title}</p>
              <ul className="space-y-3 text-sm text-white/60">
                {column.links.map((link) => (
                  <li key={typeof link === 'string' ? link : link.name}>
                    {typeof link === 'string' ? (
                      <a href="#" className="hover:text-white">{link}</a>
                    ) : link.href.startsWith('/') ? (
                      <Link href={link.href} className="hover:text-white">{link.name}</Link>
                    ) : (
                      <a href={link.href} className="hover:text-white">{link.name}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 pt-7 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-5">
            <a href="#">Instagram</a>
            <a href="#">TikTok</a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
