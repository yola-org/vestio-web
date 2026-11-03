'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types/api';
import { getCategoriesAction } from '@/lib/actions/profile';
import CategoryFilter from './CategoryFilter';
import Skeleton from '@/components/shared/Skeleton';

export default function FilterPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique'];
  const conditions = ['Neuf avec étiquette', 'Neuf', 'Très bon état', 'Bon état', 'Satisfaisant'];

  useEffect(() => {
    async function loadCategories() {
      const result = await getCategoriesAction();
      if (result.success) {
        setCategories(result.data);
      }
      setLoading(false);
    }
    loadCategories();
  }, []);

  const handleToggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllCategories = (ids: string[], selected: boolean) => {
    setSelectedCategoryIds((prev) => {
      if (selected) {
        // Add all IDs that aren't already there
        const next = [...prev];
        ids.forEach((id) => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      } else {
        // Remove all IDs in the list
        return prev.filter((id) => !ids.includes(id));
      }
    });
  };

  const resetFilters = () => {
    setSelectedCategoryIds([]);
  };

  return (
    <aside className="w-full shrink-0 lg:w-64 space-y-8">
      <div>
        <h3 className="mb-4 text-xs font-black tracking-widest text-black/40 uppercase">Catégories</h3>
        {loading ? (
          <div className="space-y-3 px-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <CategoryFilter
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onToggle={handleToggleCategory}
            onSelectAll={handleSelectAllCategories}
          />
        )}
      </div>

      <div>
        <h3 className="mb-4 text-xs font-black tracking-widest text-black/40 uppercase">Prix (DH)</h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#173fdb]"
          />
          <span className="text-black/30">—</span>
          <input
            type="number"
            placeholder="Max"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#173fdb]"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs font-black tracking-widest text-black/40 uppercase">Taille</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-bold hover:border-[#173fdb] hover:text-[#173fdb]"
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs font-black tracking-widest text-black/40 uppercase">État</h3>
        <div className="space-y-2">
          {conditions.map((cond) => (
            <label key={cond} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="h-4 w-4 rounded border-black/15 text-[#173fdb] focus:ring-[#173fdb]" />
              <span className="text-sm font-medium text-black/70 group-hover:text-[#173fdb]">{cond}</span>
            </label>
          ))}
        </div>
      </div>
      
      <button 
        onClick={resetFilters}
        className="w-full rounded-xl bg-black py-3 text-xs font-bold text-white transition hover:bg-black/80"
      >
        Réinitialiser les filtres
      </button>
    </aside>
  );
}
