import HomeHero from './HomeHero';
import FilterPanel from './FilterPanel';
import ProductGrid from './ProductGrid';

export default function AuthenticatedHome() {
  return (
    <div className="bg-[#f7f3ea]">
      <HomeHero />
      <div className="main-container py-12">
        <div className="flex flex-col gap-10 lg:flex-row">
          <FilterPanel />
          <div className="flex-1">
            <ProductGrid 
              title="Pour vous" 
              subtitle="Basé sur vos préférences" 
              limit={20} 
              compact={true} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
