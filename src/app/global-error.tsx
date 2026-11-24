"use client"

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#f7f3ea] px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight">
                Un petit contretemps
              </h1>
              <p className="text-gray-600">
                Nous n’avons pas pu charger cette page. Réessayez dans un
                instant.
              </p>
            </div>
            <button
              onClick={retry}
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
