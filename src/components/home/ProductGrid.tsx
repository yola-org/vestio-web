'use client';

import { useState } from 'react';
import { ArrowIcon } from '@/components/shared/Icons';
import { listingsApi, Listing } from '@/lib/api';
import { useApiQuery } from '@/hooks/use-api-query';
import ListingGrid from '@/components/shared/ListingGrid';
import Pagination from '@/components/shared/Pagination';
import { useTranslations } from 'next-intl';

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  compact?: boolean;
}

export default function ProductGrid({ title, subtitle, limit = 12, compact = false }: ProductGridProps) {
  const t = useTranslations();
  const [currentPage, setCurrentPage] = useState(1);
  const [saved, setSaved] = useState<string[]>([]);

  const { data, loading } = useApiQuery(
    () => listingsApi.list(currentPage - 1, limit),
    { deps: [currentPage, limit], loading: false }
  );

  const listings: Listing[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const toggleSaved = (id: string) => {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <section className={`${compact ? 'py-0' : 'py-20 main-container'}`}>
      <div className="mb-9 flex items-end justify-between">
        <div>
          <p className="mb-2 text-xs font-black tracking-[0.16em] text-[#173fdb] uppercase">{subtitle ?? t('home.products.defaultSubtitle')}</p>
          <h2 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl">{title ?? t('home.products.defaultTitle')}</h2>
        </div>
        {!compact && (
          <a href="#" className="hidden items-center gap-2 text-sm font-bold sm:flex">{t('common.seeMore')} <ArrowIcon className="h-5 w-5" /></a>
        )}
      </div>

      <ListingGrid
        listings={listings}
        isLoading={loading}
        columns={`grid-cols-2 gap-x-4 gap-y-9 ${compact ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-4'} lg:gap-6`}
        savedIds={saved}
        onToggleSave={toggleSaved}
      />

      {!compact && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={loading}
        />
      )}
    </section>
  );
}
