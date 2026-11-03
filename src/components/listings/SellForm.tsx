'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CameraIcon, ChevronIcon, CheckIcon } from '@/components/shared/Icons';
import { profileApi, listingsApi, callApi } from '@/lib/api';
import { Category, City, SizeGroup, Condition, ContactType, ListingInput } from '@/types/api';

const CONDITIONS: { value: Condition; label: string; description: string }[] = [
  { value: 'NEW_WITH_TAG', label: 'Neuf avec étiquette', description: 'Article jamais porté, avec étiquettes d\'origine.' },
  { value: 'NEW_WITHOUT_TAG', label: 'Neuf sans étiquette', description: 'Article jamais porté, sans étiquettes.' },
  { value: 'VERY_GOOD', label: 'Très bon état', description: 'Article peu porté, sans défauts.' },
  { value: 'GOOD', label: 'Bon état', description: 'Article porté, avec de légères traces d\'usure.' },
  { value: 'SATISFACTORY', label: 'Satisfaisant', description: 'Article bien porté, peut avoir des défauts mineurs.' },
];

const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'PHONE', label: 'Téléphone' },
  { value: 'CHAT', label: 'Chat interne' },
  { value: 'EMAIL', label: 'Email' },
];

export default function SellForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<SizeGroup[]>([]);
  
  const [formData, setFormData] = useState<Partial<ListingInput>>({
    title: '',
    description: '',
    price: 0,
    quantity: 1,
    condition: 'VERY_GOOD',
    contactTypes: ['WHATSAPP'],
    cityIds: [],
    categoryId: '',
    sizeIds: [],
  });

  const [selectedParentId, setSelectedParentId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [citiesRes, categoriesRes, sizesRes] = await Promise.all([
        callApi(profileApi.getCities(), { silent: true }),
        callApi(profileApi.getCategories(), { silent: true }),
        callApi(profileApi.getSizes(), { silent: true }),
      ]);

      citiesRes.handle({ onSuccess: (data) => setCities(data) });
      categoriesRes.handle({ 
        onSuccess: (data) => {
          setCategories(data);
          // Only set first parent as selected if none is selected yet
          if (data.length > 0 && !selectedParentId) {
            setSelectedParentId(data[0].id);
          }
        } 
      });
      sizesRes.handle({ onSuccess: (data) => setSizes(data) });

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return;
    setSubmitting(true);

    const result = await callApi(listingsApi.create(formData as ListingInput));
    
    result.handle({
      onSuccess: () => {
        router.push('/');
      },
      onError: () => {
        setSubmitting(false);
      }
    });
  };

  const selectedParent = categories.find(c => c.id === selectedParentId);
  const selectedCategory = categories.flatMap(c => [c, ...(c.nestedCategories || [])]).find(c => c.id === formData.categoryId);
  
  const availableSizes = sizes.find(s => s.id === (selectedCategory?.sizeGroup?.id || selectedCategory?.sizeGroupId))?.sizes || [];

  const handleParentSelect = (parentId: string) => {
    setSelectedParentId(parentId);
    // Reset subcategory and sizes when parent changes
    setFormData(prev => ({ ...prev, categoryId: '', sizeIds: [] }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId, sizeIds: [] }));
  };

  const toggleSize = (sizeId: string) => {
    setFormData(prev => {
      const currentSizes = prev.sizeIds || [];
      const newSizes = currentSizes.includes(sizeId)
        ? currentSizes.filter(id => id !== sizeId)
        : [...currentSizes, sizeId];
      return { ...prev, sizeIds: newSizes };
    });
  };

  const toggleCity = (cityId: string) => {
    setFormData(prev => {
      const currentCities = prev.cityIds || [];
      const newCities = currentCities.includes(cityId)
        ? currentCities.filter(id => id !== cityId)
        : [...currentCities, cityId];
      return { ...prev, cityIds: newCities };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#173fdb] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      {/* Photo Upload Placeholder */}
      <section className="rounded-2xl border-2 border-dashed border-black/10 bg-white p-10 text-center transition hover:border-[#173fdb]/30">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f3ea] text-[#ff5d39]">
          <CameraIcon className="h-10 w-10" />
        </div>
        <h3 className="mt-4 text-lg font-bold">Ajouter des photos</h3>
        <p className="mt-1 text-sm text-black/50">Jusqu'à 10 photos. La première sera la photo principale.</p>
        <button type="button" className="mt-6 rounded-full bg-[#173fdb] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#173fdb]/90">
          Sélectionner des fichiers
        </button>
      </section>

      {/* Main Details */}
      <section className="rounded-2xl border border-black/10 bg-white p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">Titre de l'annonce</label>
          <input
            required
            type="text"
            placeholder="Ex: Sac en cuir vintage Mango"
            className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#173fdb] transition"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Description</label>
          <textarea
            required
            rows={5}
            placeholder="Décrivez votre article (matière, état, défauts éventuels...)"
            className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#173fdb] transition"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </section>

      {/* Categories & Attributes */}
      <section className="rounded-2xl border border-black/10 bg-white p-8 space-y-8">
        <div>
          <label className="block text-sm font-bold mb-4">Catégorie principale</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleParentSelect(cat.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  selectedParentId === cat.id
                    ? 'bg-[#173fdb] text-white'
                    : 'bg-[#f7f3ea] text-black/70 hover:bg-black/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <input type="hidden" name="parentCategoryId" value={selectedParentId} required />
        </div>

        {selectedParent && (selectedParent.nestedCategories?.length ?? 0) > 0 && (
          <div>
            <label className="block text-sm font-bold mb-4">Sous-catégorie</label>
            <div className="flex flex-wrap gap-2">
              {selectedParent.nestedCategories?.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handleCategorySelect(child.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    formData.categoryId === child.id
                      ? 'bg-[#ff5d39] text-white'
                      : 'bg-[#f7f3ea] text-black/70 hover:bg-black/5'
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
            <input type="hidden" name="categoryId" value={formData.categoryId || ''} required />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold mb-4">Taille / Pointure</label>
          <div className="flex flex-wrap gap-2">
            {!formData.categoryId ? (
              <div className="text-sm text-black/30 italic py-2">Sélectionnez d'abord une sous-catégorie</div>
            ) : availableSizes.length > 0 ? (
              availableSizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => toggleSize(size.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    formData.sizeIds?.includes(size.id)
                      ? 'bg-[#173fdb] text-white'
                      : 'bg-[#f7f3ea] text-black/70 hover:bg-black/5'
                  }`}
                >
                  {size.name}
                </button>
              ))
            ) : (
              <div className="text-sm text-black/30 italic py-2">Aucune taille disponible pour cette catégorie</div>
            )}
          </div>
          <input type="hidden" name="sizeIds" value={formData.sizeIds?.join(',') || ''} required={formData.categoryId ? availableSizes.length > 0 : false} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-4">État de l'article</label>
          <div className="space-y-3">
            {CONDITIONS.map((cond) => (
              <label 
                key={cond.value} 
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                  formData.condition === cond.value ? 'border-[#173fdb] bg-[#173fdb]/5' : 'border-black/10 hover:border-black/20'
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  className="mt-1"
                  checked={formData.condition === cond.value}
                  onChange={() => setFormData({ ...formData, condition: cond.value })}
                />
                <div>
                  <div className="font-bold text-sm">{cond.label}</div>
                  <div className="text-xs text-black/50 mt-0.5">{cond.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Location */}
      <section className="rounded-2xl border border-black/10 bg-white p-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold mb-2">Prix (DH)</label>
            <div className="relative">
              <input
                required
                type="number"
                min="0"
                placeholder="0.00"
                className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#173fdb] transition"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-black/40">DH</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-4">Villes</label>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => toggleCity(city.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    formData.cityIds?.includes(city.id)
                      ? 'bg-[#173fdb] text-white'
                      : 'bg-[#f7f3ea] text-black/70 hover:bg-black/5'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
            <input type="hidden" name="cityIds" value={formData.cityIds?.join(',') || ''} required />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold mb-2">Quantité disponible</label>
            <input
              required
              type="number"
              min="1"
              className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#173fdb] transition"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Contact préféré</label>
            <div className="relative">
              <select
                required
                className="w-full appearance-none rounded-xl border border-black/15 bg-white px-4 py-3 pr-10 outline-none focus:border-[#173fdb] transition"
                value={formData.contactTypes?.[0] || ''}
                onChange={(e) => setFormData({ ...formData, contactTypes: [e.target.value as ContactType] })}
              >
                {CONTACT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none text-black/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
        <p className="text-xs text-black/50 max-w-sm">
          En publiant cette annonce, vous acceptez nos <a href="#" className="underline">Conditions Générales de Vente</a> et notre <a href="#" className="underline">Politique de Confidentialité</a>.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#ff5d39] px-12 py-4 text-base font-black text-white shadow-lg shadow-[#ff5d39]/20 transition hover:-translate-y-1 hover:bg-[#e94422] disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {submitting ? 'Publication...' : 'Publier l\'annonce'}
        </button>
      </div>
    </form>
  );
}
