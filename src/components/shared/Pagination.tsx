'use client';

import { ChevronIcon } from './Icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Page précédente"
      >
        <ChevronIcon className="h-5 w-5 rotate-90" />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            className={`h-10 min-w-[40px] px-3 rounded-full text-sm font-bold transition ${
              currentPage === page
                ? 'bg-[#173fdb] text-white'
                : 'hover:bg-black/5 text-black/60'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Page suivante"
      >
        <ChevronIcon className="h-5 w-5 -rotate-90" />
      </button>
    </div>
  );
}
