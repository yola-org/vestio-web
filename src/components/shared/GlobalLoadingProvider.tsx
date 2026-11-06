'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

type GlobalLoadingContextValue = {
  setPending: (pending: boolean) => void;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextValue>({
  setPending: () => undefined,
});

export function useGlobalLoading(): GlobalLoadingContextValue {
  return useContext(GlobalLoadingContext);
}

/** A reference-counted full-page loader for API calls that opt into it. */
export default function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const [pendingCount, setPendingCount] = useState(0);
  const setPending = useCallback((pending: boolean) => {
    setPendingCount((count) => Math.max(0, count + (pending ? 1 : -1)));
  }, []);
  const value = useMemo(() => ({ setPending }), [setPending]);

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      {pendingCount > 0 && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-[#f7f3ea]/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label={t('loading.message')}
        >
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#173fdb]/15 border-t-[#173fdb]" />
          <p className="font-bold text-black/60">{t('loading.message')}</p>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
}
