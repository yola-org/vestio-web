"use client"

/** A reference-counted full-page loader for API calls that opt into it. */

import Spinner from "@/components/shared/Spinner"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useTranslations } from "next-intl"

type GlobalLoadingContextValue = {
  setPending: (pending: boolean) => void
}

const GlobalLoadingContext = createContext<GlobalLoadingContextValue>({
  setPending: () => undefined,
})

export function useGlobalLoading(): GlobalLoadingContextValue {
  return useContext(GlobalLoadingContext)
}
export default function GlobalLoadingProvider({
  children,
}: {
  children: ReactNode
}) {
  const t = useTranslations()
  const [pendingCount, setPendingCount] = useState(0)
  const setPending = useCallback((pending: boolean) => {
    setPendingCount((count) => Math.max(0, count + (pending ? 1 : -1)))
  }, [])
  const value = useMemo(() => ({ setPending }), [setPending])

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      {pendingCount > 0 && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#f7f3ea]/80 text-deep-accent backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label={t("loading.message")}
        >
          <Spinner className="size-12 border-4" />
        </div>
      )}
    </GlobalLoadingContext.Provider>
  )
}
