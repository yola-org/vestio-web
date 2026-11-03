import Skeleton from '@/components/shared/Skeleton';

export function MegaMenuSkeleton() {
  return (
    <div className="absolute top-full right-0 left-0 border-t border-black/10 bg-[#f7f3ea] shadow-[0_22px_50px_rgba(0,0,0,0.16)]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-6 gap-8 py-10 content-padding">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={i < 5 ? 'border-r border-black/10 pr-4' : ''}>
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-2.5">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-full max-w-[120px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeaderNavSkeleton() {
  return (
    <div className="flex h-12 items-center gap-8 overflow-x-auto main-container">
      <Skeleton className="h-4 w-32" />
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-20" />
      ))}
    </div>
  );
}
