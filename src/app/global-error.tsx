"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#f7f3ea] px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-black tracking-tight">500</h1>
              <h2 className="text-2xl font-bold">Erreur du serveur</h2>
              <p className="text-gray-600">
                Le serveur est inaccessible. Veuillez réessayer plus tard.
              </p>
            </div>
            <button
              onClick={reset}
              className="px-6 py-3 bg-[#ff5d39] text-white rounded-full font-bold hover:opacity-90 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
