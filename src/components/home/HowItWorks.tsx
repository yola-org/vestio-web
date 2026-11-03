import { CameraIcon, MessageIcon, PinIcon, ArrowIcon } from '@/components/shared/Icons';
import Link from 'next/link';

export default function HowItWorks() {
  return (
    <section className="bg-white py-24 content-padding" id="how">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-20 grid gap-12 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="mb-4 inline-block text-xs font-black tracking-[0.2em] text-[#ff5d39] uppercase">
              Guide d'utilisation
            </span>
            <h2 className="text-5xl leading-[0.95] font-black tracking-[-0.055em] text-[#151515] sm:text-7xl">
              Comment ça<br />marche sur <span className="text-[#173fdb]">Vestio</span>.
            </h2>
          </div>
          <div className="max-w-xl lg:ml-auto">
            <p className="text-xl leading-8 text-black/60">
              Vestio est la première plateforme marocaine dédiée à la revente de mode entre particuliers. 
              Nous simplifions la mise en relation pour que vous puissiez donner une seconde vie à vos vêtements en toute confiance.
            </p>
          </div>
        </div>

        <div className="grid gap-1 border-t border-black/10 md:grid-cols-3">
          {[
            {
              number: '01',
              title: 'Vendez vos pépites',
              body: 'Prenez quelques belles photos de vos articles, ajoutez une description honnête et fixez votre prix. C\'est 100% gratuit et sans commission sur la mise en ligne.',
              icon: <CameraIcon className="h-10 w-10" />,
              color: 'bg-[#f7f3ea]'
            },
            {
              number: '02',
              title: 'Discutez en direct',
              body: 'Les acheteurs intéressés vous contactent directement via notre messagerie. Posez vos questions, négociez le prix et mettez-vous d\'accord sur les détails.',
              icon: <MessageIcon className="h-10 w-10" />,
              color: 'bg-[#e8f0fe]'
            },
            {
              number: '03',
              title: 'Finalisez à votre façon',
              body: 'Choisissez le mode de livraison qui vous convient le mieux : remise en main propre dans votre ville ou envoi par colis. C\'est vous qui décidez.',
              icon: <PinIcon className="h-10 w-10" />,
              color: 'bg-[#f0fdf4]'
            },
          ].map((step) => (
            <div key={step.number} className="group relative overflow-hidden border-b border-black/10 py-12 md:border-b-0 md:border-r md:px-10 md:first:pl-0 md:last:border-r-0">
              <div className="mb-20 flex items-start justify-between">
                <span className="text-4xl font-black italic tracking-tighter text-black/5">
                  {step.number}
                </span>
                <div className={`rounded-2xl ${step.color} p-5 text-[#173fdb] transition-transform duration-500 group-hover:scale-110`}>
                  {step.icon}
                </div>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-[#151515]">{step.title}</h3>
              <p className="mt-4 text-base leading-7 text-black/50">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-8 rounded-[2rem] bg-[#151515] p-10 md:flex-row md:p-16">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Prêt à faire circuler la mode ?
            </h4>
            <p className="mt-4 text-white/60">
              Rejoignez plus de 10 000 membres qui achètent et vendent quotidiennement sur Vestio.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="flex items-center gap-3 rounded-full bg-[#ff5d39] px-8 py-4.5 text-sm font-bold text-white transition hover:scale-105 active:scale-95">
              Commencer à vendre <ArrowIcon className="h-5 w-5" />
            </Link>
            <a href="#shop" className="rounded-full border-2 border-white/20 px-8 py-4.5 text-sm font-bold text-white transition hover:bg-white/10">
              Découvrir les articles
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
