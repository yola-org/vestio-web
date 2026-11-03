'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number; code?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  const is404 = error.status === 404 || error.message?.includes('404');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-8 p-6 rounded-[2.5rem] bg-white border border-black/5 shadow-xl shadow-black/[0.02]">
        <div className="w-20 h-20 bg-[#ff5d39]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        
        <h1 className="text-3xl font-black mb-4 tracking-tight">
          {is404 ? 'Page ou ressource introuvable' : 'Oups ! Quelque chose s\'est mal passé'}
        </h1>
        
        <p className="text-black/50 font-medium max-w-md mx-auto mb-8">
          {error.message || 'Une erreur inattendue est survenue. Notre équipe technique a été informée.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-[#173fdb] text-white rounded-full font-bold hover:-translate-y-1 transition shadow-lg shadow-[#173fdb]/20"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-black/5 text-black rounded-full font-bold hover:bg-black/10 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 rounded-xl bg-red-50 border border-red-100 text-left max-w-2xl overflow-auto">
          <p className="text-xs font-mono text-red-600">
            <strong>Debug info:</strong><br />
            Status: {error.status}<br />
            Code: {error.code}<br />
            Stack: {error.stack}
          </p>
        </div>
      )}
    </div>
  );
}
