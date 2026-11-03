import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#151515] pt-16 pb-8 text-white content-padding">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="text-3xl font-black tracking-[-0.06em]">VESTIO<span className="text-[#ff5d39]">.</span></Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">Le marché de mode entre particuliers, pensé au Maroc. Vous publiez, vous discutez, vous échangez.</p>
          </div>
          {[
            { title: 'Découvrir', links: ['Femme', 'Homme', 'Enfant', 'Créateurs marocains'] },
            { title: 'VESTIO', links: [{ name: 'Comment ça marche', href: '/#how' }, { name: 'Vendre', href: '/register' }, { name: 'Confiance & sécurité', href: '#' }, { name: 'Notre manifeste', href: '#' }] },
            { title: 'Besoin d’aide ?', links: [{ name: 'Centre d’aide', href: '#' }, { name: 'Nous contacter', href: '#' }, { name: 'Conseils de rencontre', href: '#' }, { name: 'Conditions', href: '#' }] },
          ].map((column) => (
            <div key={column.title}>
              <p className="mb-5 text-xs font-black tracking-wider text-[#d8f05e] uppercase">{column.title}</p>
              <ul className="space-y-3 text-sm text-white/60">
                {column.links.map((link) => (
                  <li key={typeof link === 'string' ? link : link.name}>
                    {typeof link === 'string' ? (
                      <a href="#" className="hover:text-white">{link}</a>
                    ) : link.href.startsWith('/') ? (
                      <Link href={link.href} className="hover:text-white">{link.name}</Link>
                    ) : (
                      <a href={link.href} className="hover:text-white">{link.name}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 pt-7 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 VESTIO. Fait avec soin au Maroc.</p>
          <div className="flex gap-5"><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">Français · MAD</a></div>
        </div>
      </div>
    </footer>
  );
}
