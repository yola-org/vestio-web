'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CameraIcon, ChevronIcon, CheckIcon } from '@/components/shared/Icons';
import { profileApi, listingsApi } from '@/lib/api';
import { useApiForm } from '@/hooks/use-api-form';
import { useApiQuery } from '@/hooks/use-api-query';
import type { Condition, ContactType, ListingInput } from '@/lib/api/schemas';
import { useTranslations } from 'next-intl';
import Button from '@/components/shared/Button';

export default function SellForm() {
  const router = useRouter();
  const t = useTranslations();
  
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

  const CONDITIONS: { value: Condition; label: string; description: string }[] = [
    {
      value: 'NEW_WITH_TAG',
      label: t('conditions.NEW_WITH_TAG.label'),
      description: t('conditions.NEW_WITH_TAG.description'),
    },
    {
      value: 'NEW_WITHOUT_TAG',
      label: t('conditions.NEW_WITHOUT_TAG.label'),
      description: t('conditions.NEW_WITHOUT_TAG.description'),
    },
    {
      value: 'VERY_GOOD',
      label: t('conditions.VERY_GOOD.label'),
      description: t('conditions.VERY_GOOD.description'),
    },
    {
      value: 'GOOD',
      label: t('conditions.GOOD.label'),
      description: t('conditions.GOOD.description'),
    },
    {
      value: 'SATISFACTORY',
      label: t('conditions.SATISFACTORY.label'),
      description: t('conditions.SATISFACTORY.description'),
    },
  ];

  const CONTACT_TYPES: { value: ContactType; label: string }[] = [
    { value: 'WHATSAPP', label: t('sell.contactTypes.WHATSAPP') },
    { value: 'PHONE', label: t('sell.contactTypes.PHONE') },
    { value: 'CHAT', label: t('sell.contactTypes.CHAT') },
    { value: 'EMAIL', label: t('sell.contactTypes.EMAIL') },
  ];

  const citiesQuery = useApiQuery(profileApi.getCities, { critical: true, loading: false });
  const categoriesQuery = useApiQuery(profileApi.getCategories, {
    critical: true,
    loading: false,
    onSuccess: (data) => {
      // Only set first parent as selected if none is selected yet
      if (data.length > 0 && !selectedParentId) {
        const firstParent = data.find((category) => !category.parentId) || data[0];
        setSelectedParentId(firstParent.id);
      }
    },
  });
  const sizesQuery = useApiQuery(profileApi.getSizes, { critical: true, loading: false });

  const { formAction, pending: submitting } = useApiForm(() => listingsApi.create(formData as ListingInput), {
    loading: false,
    onSuccess: () => {
      router.push('/');
    },
  });

  const cities = citiesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const sizes = sizesQuery.data ?? [];
  const loading = citiesQuery.loading || categoriesQuery.loading || sizesQuery.loading;
  const allCategories = categories.flatMap(c => [c, ...(c.subCategories || [])]);
  const selectedParent = categories.find(c => c.id === selectedParentId);
  const selectedCategory = allCategories.find(c => c.id === formData.categoryId);


  const availableSizes = sizes.find(s => {
    const sizeGroupId = selectedCategory?.sizeGroup?.id || selectedCategory?.sizeGroupId;
    return s.id === sizeGroupId;
  })?.sizes || [];

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
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      {/* Photo Upload Placeholder */}
      <section className="rounded-2xl border-2 border-dashed border-black/10 bg-white p-10 text-center transition hover:border-[#173fdb]/30">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f3ea] text-[#ff5d39]">
          <CameraIcon className="h-10 w-10" />
        </div>
        <h3 className="mt-4 text-lg font-bold">{t('sell.photosTitle')}</h3>
        <p className="mt-1 text-sm text-black/50">{t('sell.photosHint')}</p>
        <button type="button" className="mt-6 rounded-full bg-[#173fdb] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#173fdb]/90">
          {t('sell.selectFiles')}
        </button>
      </section>

      {/* Main Details */}
      <section className="rounded-2xl border border-black/10 bg-white p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">{t('sell.listingTitle')}</label>
          <input
            required
            type="text"
            placeholder={t('sell.listingTitlePlaceholder')}
            className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#173fdb] transition"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">{t('sell.description')}</label>
          <textarea
            required
            rows={5}
            placeholder={t('sell.descriptionPlaceholder')}
            className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#173fdb] transition"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </section>

      {/* Categories & Attributes */}
      <section className="rounded-2xl border border-black/10 bg-white p-8 space-y-8">
        <div>
          <label className="block text-sm font-bold mb-4">{t('sell.mainCategory')}</label>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter(c => !c.parentId)
              .map((cat) => (
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

        {selectedParent && (
          <div>
            <label className="block text-sm font-bold mb-4">{t('sell.subcategory')}</label>
            <div className="flex flex-wrap gap-2">
              {allCategories
                .filter(c => c.parentId === selectedParent.id)
                .map((child) => (
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
          <label className="block text-sm font-bold mb-4">{t('sell.size')}</label>
          <div className="flex flex-wrap gap-2">
            {!formData.categoryId ? (
              <div className="text-sm text-black/30 italic py-2">{t('sell.selectSubcategoryFirst')}</div>
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
              <div className="text-sm text-black/30 italic py-2">{t('sell.noSizes')}</div>
            )}
          </div>
          <input type="hidden" name="sizeIds" value={formData.sizeIds?.join(',') || ''} required={formData.categoryId ? availableSizes.length > 0 : false} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-4">{t('sell.condition')}</label>
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
            <label className="block text-sm font-bold mb-2">{t('sell.price', { currency: t('common.currency') })}</label>
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
              <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm font-bold text-black/40">{t('common.currency')}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-4">{t('sell.cities')}</label>
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
            <label className="block text-sm font-bold mb-2">{t('sell.quantity')}</label>
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
            <label className="block text-sm font-bold mb-2">{t('sell.contact')}</label>
            <div className="relative">
              <select
                required
                className="w-full appearance-none rounded-xl border border-black/15 bg-white px-4 py-3 pe-10 outline-none focus:border-[#173fdb] transition"
                value={formData.contactTypes?.[0] || ''}
                onChange={(e) => setFormData({ ...formData, contactTypes: [e.target.value as ContactType] })}
              >
                {CONTACT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronIcon className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none text-black/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
        <p className="text-xs text-black/50 max-w-sm">
          {t('sell.termsPrefix')} <a href="#" className="underline">{t('sell.termsLink')}</a> {t('sell.termsJoin')} <a href="#" className="underline">{t('sell.privacyLink')}</a>{t('sell.termsSuffix')}
        </p>
        <Button
          type="submit"
          loading={submitting}
          className="rounded-full bg-[#ff5d39] px-12 py-4 text-base font-black text-white shadow-lg shadow-[#ff5d39]/20 transition hover:-translate-y-1 hover:bg-[#e94422] disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {t('sell.submit')}
        </Button>
      </div>
    </form>
  );
}
