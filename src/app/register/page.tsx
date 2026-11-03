import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowIcon } from '@/components/shared/Icons';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515]">
      <Header />
      <main className="py-20 main-container">
        <div className="mx-auto max-w-md bg-white p-8 shadow-sm rounded-2xl">
          <h1 className="text-4xl font-black tracking-tight mb-2">Bienvenue !</h1>
          <p className="text-black/60 mb-8">Rejoignez Vestio et commencez à faire circuler le style au Maroc.</p>
          
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="name">Nom complet</label>
              <input 
                type="text" 
                id="name" 
                placeholder="Prénom Nom"
                className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="votre@email.com"
                className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="password">Mot de passe</label>
              <input 
                type="password" 
                id="password" 
                placeholder="8 caractères minimum"
                className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition"
              />
            </div>
            <button className="w-full bg-[#ff5d39] text-white h-12 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#e94422] transition">
              Créer mon compte <ArrowIcon className="h-5 w-5" />
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-black/10 text-center">
            <p className="text-sm text-black/60 mb-4">Déjà membre ?</p>
            <Link href="/login" className="inline-block text-[#173fdb] font-bold hover:underline">
              Se connecter à mon compte
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
