import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ea] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight">404</h1>
          <h2 className="text-2xl font-bold">Page introuvable</h2>
          <p className="text-gray-600">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#ff5d39] text-white rounded-full font-bold hover:opacity-90 transition"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
