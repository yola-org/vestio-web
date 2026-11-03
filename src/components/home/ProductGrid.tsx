'use client';

import { useState, useEffect } from 'react';
import { ArrowIcon } from '@/components/shared/Icons';
import { listingsApi, callApi, Listing } from '@/lib/api';
import ListingGrid from '@/components/shared/ListingGrid';
import Pagination from '@/components/shared/Pagination';

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  compact?: boolean;
}

export default function ProductGrid({ title = "Nouveaux", subtitle = "Fraîchement publiés", limit = 12, compact = false }: ProductGridProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const result = await callApi(listingsApi.list(currentPage - 1, limit), { silent: true });
      await result.handle({
        onSuccess: (data) => {
          setListings(data?.content || []);
          setTotalPages(data?.totalPages || 0);
        },
      });
      setLoading(false);
    };
    fetchListings();
  }, [currentPage, limit]);

  const toggleSaved = (id: string) => {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <section className={`${compact ? 'py-0' : 'py-20 main-container'}`}>
      <div className="mb-9 flex items-end justify-between">
        <div>
          <p className="mb-2 text-xs font-black tracking-[0.16em] text-[#173fdb] uppercase">{subtitle}</p>
          <h2 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl">{title}</h2>
        </div>
        {!compact && (
          <a href="#" className="hidden items-center gap-2 text-sm font-bold sm:flex">Voir plus <ArrowIcon className="h-5 w-5" /></a>
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
