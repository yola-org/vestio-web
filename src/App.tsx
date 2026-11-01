import { useState, type ReactNode, type SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const SearchIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>
);
const HeartIcon = (props: IconProps) => (
  <Icon {...props}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></Icon>
);
const UserIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>
);
const ArrowIcon = (props: IconProps) => (
  <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
);
const ChevronIcon = (props: IconProps) => (
  <Icon {...props}><path d="m8 10 4 4 4-4" /></Icon>
);
const CameraIcon = (props: IconProps) => (
  <Icon {...props}><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4.5Z" /><circle cx="12" cy="12.5" r="4" /></Icon>
);
const MessageIcon = (props: IconProps) => (
  <Icon {...props}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /></Icon>
);
const PinIcon = (props: IconProps) => (
  <Icon {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></Icon>
);
const MenuIcon = (props: IconProps) => (
  <Icon {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
);
const CloseIcon = (props: IconProps) => (
  <Icon {...props}><path d="m6 6 12 12M18 6 6 18" /></Icon>
);

const heroImage = 'https://images.unsplash.com/photo-1750981089377-2883600c08b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1600';

const products = [
  {
    title: 'Sac en cuir vintage',
    brand: 'Mango',
    size: 'Très bon état',
    price: '380 DH',
    city: 'Casablanca',
    image: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
    seller: 'Sara M.',
  },
  {
    title: 'Hoodie gris essentiel',
    brand: 'Nike',
    size: 'Taille M',
    price: '290 DH',
    city: 'Rabat',
    image: 'https://images.unsplash.com/photo-1576188973526-0e5d7047b0cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
    seller: 'Yassine A.',
  },
  {
    title: 'Baskets rétro',
    brand: 'Stepney Workers Club',
    size: 'Pointure 40',
    price: '520 DH',
    city: 'Marrakech',
    image: 'https://images.unsplash.com/photo-1544441892-83af2e53ea48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
    seller: 'Nour E.',
  },
  {
    title: 'Chemise brodée',
    brand: 'Pièce unique',
    size: 'Taille S',
    price: '240 DH',
    city: 'Tanger',
    image: 'https://images.unsplash.com/photo-1761896898277-5141377f2a12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
    seller: 'Lina B.',
  },
];

const categoryGroups = [
  { title: 'Femme', items: ['Nouveautés', 'Robes', 'Tops & chemises', 'Pantalons', 'Vestes & manteaux', 'Chaussures'] },
  { title: 'Homme', items: ['Nouveautés', 'T-shirts', 'Chemises', 'Jeans & pantalons', 'Vestes', 'Sneakers'] },
  { title: 'Enfant', items: ['Filles', 'Garçons', 'Bébé', 'Chaussures', 'Lots de vêtements', 'Uniformes'] },
  { title: 'À découvrir', items: ['Créateurs marocains', 'Caftans & jellabas', 'Vintage', 'Sacs', 'Accessoires', 'Moins de 200 DH'] },
];

const categories = [
  { name: 'Femme', image: 'https://images.unsplash.com/photo-1761896898277-5141377f2a12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700', tone: 'bg-[#e3b7a8]' },
  { name: 'Homme', image: 'https://images.unsplash.com/photo-1761896904104-334cad0f5d3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700', tone: 'bg-[#b8c7ba]' },
  { name: 'Enfant', image: 'https://images.unsplash.com/photo-1632469188022-b5db09a70fbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700', tone: 'bg-[#d3bd98]' },
  { name: 'Chaussures', image: 'https://images.unsplash.com/photo-1544441892-83af2e53ea48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700', tone: 'bg-[#a9b7c0]' },
  { name: 'Sacs', image: 'https://images.unsplash.com/photo-1602532360508-595f449c7c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700', tone: 'bg-[#c4a58e]' },
  { name: 'Traditionnel', image: 'https://images.unsplash.com/photo-1593398499303-b4341b0295d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700', tone: 'bg-[#bcc3a1]' },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  const toggleSaved = (title: string) => {
    setSaved((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title]);
  };

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515] selection:bg-[#ff5d39] selection:text-white">
      <header className="relative z-50 border-b border-black/10 bg-[#f7f3ea]">
        <div className="bg-[#173fdb] px-5 py-2 text-center text-[11px] font-bold tracking-[0.16em] text-white uppercase sm:text-xs">
          Achetez près de chez vous • Discutez directement • Aucun frais de livraison
        </div>
        <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-7 px-5 lg:px-10">
          <a href="#" className="shrink-0 text-[28px] font-black tracking-[-0.06em]" aria-label="Dar Dôl home">
            DAR<span className="text-[#ff5d39]">DÔL</span><span className="text-[#173fdb]">.</span>
          </a>

          <div className="relative hidden flex-1 lg:block">
            <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Rechercher un caftan, une veste, une marque..."
              className="h-12 w-full rounded-full border border-black/15 bg-white pr-5 pl-12 text-sm outline-none transition focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10"
              aria-label="Rechercher des articles"
            />
          </div>

          <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Actions principales">
            <a href="#how" className="text-sm font-semibold hover:text-[#173fdb]">Comment ça marche</a>
            <button className="flex items-center gap-2 text-sm font-semibold hover:text-[#173fdb]">
              <HeartIcon className="h-5 w-5" /> Favoris
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold hover:text-[#173fdb]">
              <UserIcon className="h-5 w-5" /> Se connecter
            </button>
            <a href="#sell" className="rounded-full bg-[#ff5d39] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e94422]">
              Vendre
            </a>
          </nav>
          <button
            className="ml-auto rounded-full border border-black/15 p-2.5 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        <div className="border-t border-black/10">
          <nav className="mx-auto flex h-12 max-w-[1440px] items-center gap-8 overflow-x-auto px-5 text-xs font-bold tracking-[0.08em] whitespace-nowrap uppercase lg:px-10" aria-label="Catégories">
            <div
              className="group h-full"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
              onFocus={() => setMegaOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setMegaOpen(false);
              }}
            >
              <button className="flex h-full items-center gap-1.5 text-[#173fdb]" aria-expanded={megaOpen}>
                Toutes les catégories <ChevronIcon className={`h-4 w-4 transition ${megaOpen ? 'rotate-180' : ''}`} />
              </button>
              {megaOpen && (
                <div className="absolute top-full right-0 left-0 border-t border-black/10 bg-[#f7f3ea] shadow-[0_22px_50px_rgba(0,0,0,0.16)]">
                  <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-10 px-10 py-9">
                    {categoryGroups.map((group, index) => (
                      <div key={group.title} className={index < 3 ? 'border-r border-black/10' : ''}>
                        <p className="mb-4 text-lg font-black tracking-normal normal-case">{group.title}</p>
                        <ul className="space-y-3 text-[13px] font-medium tracking-normal normal-case text-black/65">
                          {group.items.map((item) => <li key={item}><a href="#shop" className="hover:text-[#173fdb] hover:underline">{item}</a></li>)}
                        </ul>
                      </div>
                    ))}
                    <div className="col-span-4 flex items-center justify-between border-t border-black/10 pt-5">
                      <p className="text-sm font-medium tracking-normal normal-case">La sélection du moment : <strong>Le lin pour l'été</strong></p>
                      <a href="#shop" className="flex items-center gap-2 text-[#ff5d39]">Voir tout <ArrowIcon className="h-4 w-4" /></a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <a href="#shop" className="hover:text-[#173fdb]">Femme</a>
            <a href="#shop" className="hover:text-[#173fdb]">Homme</a>
            <a href="#shop" className="hover:text-[#173fdb]">Enfant</a>
            <a href="#shop" className="hover:text-[#173fdb]">Créateurs marocains</a>
            <a href="#shop" className="hover:text-[#173fdb]">Vintage</a>
            <a href="#shop" className="text-[#ff5d39]">Nouveautés</a>
          </nav>
        </div>

        {mobileOpen && (
          <div className="absolute top-full right-0 left-0 border-t border-black/10 bg-[#f7f3ea] p-5 shadow-xl lg:hidden">
            <div className="relative mb-5">
              <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <input type="search" placeholder="Rechercher..." className="h-12 w-full rounded-full border border-black/15 bg-white pr-4 pl-12 text-sm" />
            </div>
            <div className="grid gap-3 text-sm font-bold">
              <a href="#how" onClick={() => setMobileOpen(false)}>Comment ça marche</a>
              <a href="#shop" onClick={() => setMobileOpen(false)}>Acheter</a>
              <a href="#sell" onClick={() => setMobileOpen(false)}>Vendre un article</a>
              <button className="text-left">Se connecter</button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="mx-auto grid min-h-[680px] max-w-[1600px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-center px-5 py-16 sm:px-10 lg:px-16 xl:px-24">
            <p className="mb-5 flex items-center gap-3 text-xs font-black tracking-[0.18em] text-[#173fdb] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#ff5d39]" /> La mode circule au Maroc
            </p>
            <h1 className="max-w-xl text-[clamp(3.4rem,7vw,7.8rem)] leading-[0.84] font-black tracking-[-0.075em] uppercase">
              Portez.<br /><span className="text-[#173fdb]">Revendez.</span><br />Recommencez.
            </h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-black/65 sm:text-lg">
              La communauté marocaine où chaque dressing trouve une nouvelle histoire. Neuf ou seconde main, achetez et vendez directement, à votre façon.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#shop" className="flex items-center gap-3 rounded-full bg-[#151515] px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#173fdb]">
                Explorer les pièces <ArrowIcon className="h-5 w-5" />
              </a>
              <a href="#sell" className="rounded-full border border-black/25 px-7 py-4 text-sm font-bold transition hover:border-[#ff5d39] hover:text-[#ff5d39]">
                Vider mon dressing
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-black/10 pt-5 text-xs font-semibold text-black/55">
              <span>10 000+ membres</span><span>12 villes actives</span><span>0% frais de mise en ligne</span>
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden bg-[#d7b7a5] lg:min-h-full">
            <img src={heroImage} alt="Rue marocaine bordée de tapis colorés" className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between sm:right-8 sm:bottom-8 sm:left-8">
              <div className="max-w-[220px] rounded-2xl bg-white p-4 shadow-xl sm:max-w-[270px] sm:p-5">
                <div className="mb-4 flex items-start justify-between">
                  <span className="rounded-full bg-[#d8f05e] px-3 py-1 text-[10px] font-black tracking-wider uppercase">À 3 km</span>
                  <HeartIcon className="h-5 w-5" />
                </div>
                <p className="text-lg font-black">Veste artisanale</p>
                <p className="mt-1 text-xs text-black/55">Très bon état • Taille M</p>
                <div className="mt-4 flex items-end justify-between">
                  <strong className="text-xl">450 DH</strong>
                  <span className="flex items-center gap-1 text-[11px] text-black/60"><PinIcon className="h-3.5 w-3.5" /> Marrakech</span>
                </div>
              </div>
              <p className="hidden max-w-[160px] text-right text-xs leading-5 font-semibold text-white sm:block">
                Photographie par Matthew Stephenson sur Unsplash
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-black/10 bg-[#d8f05e] py-4" aria-label="Promesse de la plateforme">
          <div className="flex overflow-hidden text-sm font-black tracking-[0.14em] whitespace-nowrap uppercase">
            <div className="marquee flex min-w-max gap-9">
              <span>Seconde main, première intention</span><span>✦</span><span>Du style, pas du gaspillage</span><span>✦</span><span>De Casa à Tanger</span><span>✦</span><span>Vous décidez de l'échange</span><span>✦</span>
              <span>Seconde main, première intention</span><span>✦</span><span>Du style, pas du gaspillage</span><span>✦</span><span>De Casa à Tanger</span><span>✦</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-20 lg:px-10" id="shop">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-black tracking-[0.16em] text-[#ff5d39] uppercase">Trouvez votre prochain favori</p>
              <h2 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl">Parcourir par catégorie</h2>
            </div>
            <a href="#" className="hidden items-center gap-2 text-sm font-bold sm:flex">Tout voir <ArrowIcon className="h-5 w-5" /></a>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <a href="#" key={category.name} className="group">
                <div className={`aspect-[4/5] overflow-hidden rounded-t-[6rem] ${category.tone}`}>
                  <img src={category.image} alt="" className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex items-center justify-between border-b border-black/20 py-4">
                  <span className="font-bold">{category.name}</span>
                  <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="bg-white px-5 py-20 lg:px-10" id="how">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-12 grid gap-6 lg:grid-cols-2">
              <h2 className="text-5xl leading-[0.95] font-black tracking-[-0.055em] sm:text-7xl">Simple comme<br />salam.</h2>
              <div className="max-w-xl self-end lg:ml-auto">
                <p className="text-lg leading-7 text-black/60">Pas d'entrepôt, pas de livraison imposée. DAR DÔL vous met en relation ; vous choisissez ensemble où, quand et comment échanger.</p>
              </div>
            </div>
            <div className="grid border-t border-black/15 md:grid-cols-3">
              {[
                { number: '01', title: 'Publiez gratuitement', body: 'Quelques photos, une description honnête, votre prix et votre ville. Votre article est en ligne.', icon: <CameraIcon className="h-8 w-8" /> },
                { number: '02', title: 'Discutez entre vous', body: 'Posez vos questions, négociez si vous le souhaitez et convenez des détails en toute simplicité.', icon: <MessageIcon className="h-8 w-8" /> },
                { number: '03', title: 'Organisez l’échange', body: 'Remise en main propre ou solution choisie ensemble : la livraison reste entre vous deux.', icon: <PinIcon className="h-8 w-8" /> },
              ].map((step) => (
                <article key={step.number} className="border-b border-black/15 py-8 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                  <div className="mb-16 flex items-start justify-between">
                    <span className="text-xs font-black tracking-widest text-[#173fdb]">{step.number}</span>
                    <span className="rounded-full bg-[#f7f3ea] p-4 text-[#173fdb]">{step.icon}</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{step.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-black/55">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-20 lg:px-10">
          <div className="mb-9 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-black tracking-[0.16em] text-[#173fdb] uppercase">Fraîchement publiés</p>
              <h2 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl">Nouveaux dans le souk</h2>
            </div>
            <a href="#" className="hidden items-center gap-2 text-sm font-bold sm:flex">Voir les nouveautés <ArrowIcon className="h-5 w-5" /></a>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => {
              const isSaved = saved.includes(product.title);
              return (
                <article key={product.title} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e4d9]">
                    <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase backdrop-blur">Seconde main</span>
                    <button
                      onClick={() => toggleSaved(product.title)}
                      className={`absolute top-3 right-3 rounded-full p-2.5 backdrop-blur transition ${isSaved ? 'bg-[#ff5d39] text-white' : 'bg-white/90 hover:bg-white'}`}
                      aria-label={isSaved ? `Retirer ${product.title} des favoris` : `Ajouter ${product.title} aux favoris`}
                    >
                      <HeartIcon className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{product.title}</h3>
                        <p className="mt-1 text-xs text-black/50">{product.brand} • {product.size}</p>
                      </div>
                      <strong className="shrink-0">{product.price}</strong>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[11px] text-black/55">
                      <span>{product.seller}</span>
                      <span className="flex items-center gap-1"><PinIcon className="h-3.5 w-3.5" />{product.city}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="sell" className="mx-auto grid max-w-[1600px] bg-[#173fdb] text-white lg:grid-cols-2">
          <div className="relative min-h-[430px] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1753219882414-4ec16b84cb82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200" alt="Marché de vêtements et d'art au Maroc" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#ff5d39]/25 mix-blend-multiply" />
            <span className="absolute top-6 left-6 rounded-full bg-[#d8f05e] px-4 py-2 text-xs font-black tracking-wider text-black uppercase">Votre dressing vaut de l'or</span>
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
            <p className="mb-5 text-xs font-black tracking-[0.18em] text-[#d8f05e] uppercase">Prêt·e à faire de la place ?</p>
            <h2 className="max-w-xl text-5xl leading-[0.9] font-black tracking-[-0.055em] sm:text-7xl">Ce que vous ne portez plus peut faire le bonheur de quelqu'un.</h2>
            <p className="mt-7 max-w-lg leading-7 text-white/70">Publier est gratuit. Vous gardez la main sur le prix, la discussion et la façon dont l'article change de dressing.</p>
            <a href="#" className="mt-9 flex w-fit items-center gap-3 rounded-full bg-[#d8f05e] px-7 py-4 text-sm font-black text-black transition hover:-translate-y-0.5">
              Publier mon premier article <ArrowIcon className="h-5 w-5" />
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-20 lg:px-10">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-black tracking-[0.16em] text-[#ff5d39] uppercase">Le journal DAR DÔL</p>
              <h2 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl">Des idées qui durent</h2>
            </div>
            <a href="#" className="hidden items-center gap-2 text-sm font-bold sm:flex">Tous les articles <ArrowIcon className="h-5 w-5" /></a>
          </div>
          <div className="grid gap-6 md:grid-cols-12">
            <article className="group md:col-span-7">
              <div className="aspect-[16/10] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1750981074109-677c6783f9a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200" alt="Ruelle rose au Maroc" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
              </div>
              <p className="mt-5 text-xs font-black tracking-wider text-[#173fdb] uppercase">Guide • 6 min</p>
              <h3 className="mt-2 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">7 réflexes pour acheter de la seconde main sans se tromper</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-black/55">Matières, mesures, photos et rendez-vous : notre checklist pour chiner avec confiance.</p>
            </article>
            <div className="grid gap-6 md:col-span-5">
              {[
                { tag: 'Dressing', title: 'Comment photographier vos pièces comme un pro', image: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800' },
                { tag: 'Rencontre', title: 'Les créateurs marocains qui réinventent l’upcycling', image: 'https://images.unsplash.com/photo-1750981068401-0f8bc4587a11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800' },
              ].map((story) => (
                <article key={story.title} className="group grid grid-cols-[0.9fr_1.1fr] gap-5 border-b border-black/15 pb-6">
                  <div className="aspect-square overflow-hidden">
                    <img src={story.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] font-black tracking-wider text-[#ff5d39] uppercase">{story.tag} • 4 min</p>
                    <h3 className="mt-2 text-xl leading-tight font-black tracking-tight">{story.title}</h3>
                    <a href="#" className="mt-5 flex items-center gap-2 text-xs font-bold">Lire l'article <ArrowIcon className="h-4 w-4" /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 bg-[#d8f05e] px-5 py-16 text-center">
          <p className="text-xs font-black tracking-[0.18em] uppercase">Le beau mérite plusieurs vies</p>
          <h2 className="mx-auto mt-4 max-w-4xl text-4xl leading-[0.95] font-black tracking-[-0.05em] sm:text-6xl">Rejoignez celles et ceux qui font circuler le style au Maroc.</h2>
          <a href="#shop" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#151515] px-8 py-4 text-sm font-black text-white">Créer mon compte <ArrowIcon className="h-5 w-5" /></a>
        </section>
      </main>

      <footer className="bg-[#151515] px-5 pt-16 pb-8 text-white lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <a href="#" className="text-3xl font-black tracking-[-0.06em]">DAR<span className="text-[#ff5d39]">DÔL</span><span className="text-[#d8f05e]">.</span></a>
              <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">Le marché de mode entre particuliers, pensé au Maroc. Vous publiez, vous discutez, vous échangez.</p>
            </div>
            {[
              { title: 'Découvrir', links: ['Femme', 'Homme', 'Enfant', 'Créateurs marocains'] },
              { title: 'DAR DÔL', links: ['Comment ça marche', 'Vendre', 'Confiance & sécurité', 'Notre manifeste'] },
              { title: 'Besoin d’aide ?', links: ['Centre d’aide', 'Nous contacter', 'Conseils de rencontre', 'Conditions'] },
            ].map((column) => (
              <div key={column.title}>
                <p className="mb-5 text-xs font-black tracking-wider text-[#d8f05e] uppercase">{column.title}</p>
                <ul className="space-y-3 text-sm text-white/60">
                  {column.links.map((link) => <li key={link}><a href="#" className="hover:text-white">{link}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 pt-7 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2025 DAR DÔL. Fait avec soin au Maroc.</p>
            <div className="flex gap-5"><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">Français · MAD</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
