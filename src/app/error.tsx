'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('ERROR_BOUNDARY', error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ea] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight">Erreur</h1>
          <h2 className="text-2xl font-bold">Une erreur s'est produite</h2>
          <p className="text-gray-600">
            Le serveur est temporairement indisponible ou une erreur est survenue.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#ff5d39] text-white rounded-full font-bold hover:opacity-90 transition"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-6 py-3 border-2 border-[#151515] text-[#151515] rounded-full font-bold hover:bg-[#151515] hover:text-white transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
