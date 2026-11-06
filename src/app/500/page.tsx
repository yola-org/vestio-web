'use client';

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ea] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight">500</h1>
          <h2 className="text-2xl font-bold">Erreur du serveur</h2>
          <p className="text-gray-600">
            Une partie essentielle de la page est indisponible. Nos équipes ont été informées. Veuillez réessayer plus tard.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#ff5d39] text-white rounded-full font-bold hover:opacity-90 transition"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="px-6 py-3 border-2 border-[#151515] text-[#151515] rounded-full font-bold hover:bg-[#151515] hover:text-white transition"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
