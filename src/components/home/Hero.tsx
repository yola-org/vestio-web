import { ArrowIcon } from '@/components/shared/Icons';
import { heroImage } from '@/constants/data';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="main-container">
      <section className="relative min-h-[720px] overflow-hidden bg-[#d7b7a5] rounded-2xl">
        <img
          src={heroImage}
          alt="Rue marocaine bordée de tapis colorés"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="relative flex h-full min-h-[720px] flex-col justify-center py-20 sm:px-5 lg:px-10 xl:px-22">
          <div className="max-w-2xl">
            <p className="mb-6 flex items-center gap-3 text-xs font-black tracking-[0.18em] text-[#d8f05e] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#ff5d39]" /> La mode circule au Maroc
            </p>
            <h1 className="text-[clamp(3.5rem,8vw,8.5rem)] leading-[0.82] font-black tracking-[-0.075em] text-white uppercase">
              Portez.<br /><span className="text-[#d8f05e]">Revendez.</span><br />Recommencez.
            </h1>
            <p className="mt-8 max-w-lg text-base leading-8 text-white/90 sm:text-xl">
              La communauté marocaine où chaque dressing trouve une nouvelle histoire. Neuf ou seconde main, achetez et vendez directement, à votre façon.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#shop" className="flex items-center gap-3 rounded-full bg-[#ff5d39] px-8 py-4.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e94422]">
                Explorer les pièces <ArrowIcon className="h-5 w-5" />
              </a>
              <Link href="/register" className="rounded-full border-2 border-white/40 bg-white/10 px-8 py-4.5 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/20">
                Vider mon dressing
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-3 border-t border-white/20 pt-6 text-xs font-bold text-white/70 uppercase tracking-widest">
              <span>10 000+ membres</span>
              <span>12 villes actives</span>
              <span>0% frais de mise en ligne</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
