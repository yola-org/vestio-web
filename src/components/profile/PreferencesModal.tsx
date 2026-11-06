'use client';

import { useState } from 'react';
import { profileApi } from '@/lib/api';
import { useApiAction } from '@/hooks/use-api-action';
import { useApiQuery } from '@/hooks/use-api-query';
import { CloseIcon } from '@/components/shared/Icons';
import PreferencesModalSkeleton from '@/components/profile/PreferencesModalSkeleton';
import { useNotifications } from '@/components/shared/NotificationProvider';
import { useTranslations } from 'next-intl';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const { notify } = useNotifications();
  const t = useTranslations();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const categoriesQuery = useApiQuery(profileApi.getCategories, {
    critical: true,
    loading: false,
    enabled: isOpen,
    deps: [isOpen],
  });

  const preferencesQuery = useApiQuery(profileApi.getPreferences, {
    loading: false,
    enabled: isOpen,
    deps: [isOpen],
    onSuccess: (data) => {
      setSelectedCategoryIds(data?.categoryIds || []);
      setSelectedGender(data?.gender || null);
    },
  });

  const updatePreferences = useApiAction(profileApi.updatePreferences, {
    loading: false,
    onSuccess: () => {
      notify.success(t('preferences.success'));
      onClose();
    },
  });

  const categories = categoriesQuery.data ?? [];
  const loading = categoriesQuery.loading || preferencesQuery.loading;
  const saving = updatePreferences.loading;

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.some(i => String(i) === String(id)) 
        ? prev.filter(i => String(i) !== String(id)) 
        : [...prev, String(id)]
    );
  };

  const handleSave = async () => {
    await updatePreferences.execute({
      categoryIds: selectedCategoryIds,
      gender: selectedGender,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('preferences.title')}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-black/5">
          <div>
            <h2 className="text-2xl font-bold text-black">{t('preferences.title')}</h2>
            <p className="text-sm text-black/60 mt-1">{t('preferences.subtitle')}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition"
          >
            <CloseIcon className="h-6 w-6 text-black/40" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-10">
          {loading ? (
            <PreferencesModalSkeleton />
          ) : (
            <>
              {/* Gender Preference */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black/30">
                    {t('preferences.gender')}
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'FEMALE', name: t('preferences.genders.FEMALE') },
                    { id: 'MALE', name: t('preferences.genders.MALE') },
                    { id: 'UNISEX', name: t('preferences.genders.UNISEX') }
                  ].map((g) => {
                    const isSelected = String(selectedGender) === String(g.id);
                    return (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGender(isSelected ? null : g.id)}
                        className={`flex h-12 items-center justify-center rounded-2xl border-2 transition-all duration-200 text-sm font-bold tracking-tight ${
                          isSelected 
                            ? 'border-[#ff5d39] bg-[#ff5d39] text-white shadow-[0_8px_20px_rgba(255,93,57,0.25)]' 
                            : 'border-black/5 bg-[#f7f3ea]/50 text-black/60 hover:border-black/10'
                        }`}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {categories.map((parent) => (
                <div key={parent.id} className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-black/30">
                      {parent.name}
                    </h3>
                    {(!parent.subCategories || parent.subCategories.length === 0) && (
                      <button
                        onClick={() => toggleCategory(String(parent.id))}
                        className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase transition-all ${
                          selectedCategoryIds.some(id => String(id) === String(parent.id))
                            ? 'border-[#173fdb] bg-[#173fdb] text-white'
                            : 'border-black/10 text-black/40 hover:border-black/20'
                        }`}
                      >
                        {selectedCategoryIds.some(id => String(id) === String(parent.id)) ? t('preferences.selected') : t('preferences.select')}
                      </button>
                    )}
                  </div>
                  {parent.subCategories && parent.subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {parent.subCategories.map((child) => {
                        const isSelected = selectedCategoryIds.some(id => String(id) === String(child.id));
                        return (
                          <button
                            key={child.id}
                            onClick={() => toggleCategory(String(child.id))}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 text-xs font-bold tracking-[0.08em] uppercase whitespace-nowrap ${
                              isSelected 
                                ? 'border-[#173fdb] bg-[#173fdb]/5 text-[#173fdb] font-black' 
                                : 'border-black/5 bg-white text-black/60 hover:border-black/20'
                            }`}
                          >
                            {isSelected && (
                              <div className="flex items-center justify-center -ms-1">
                                <CloseIcon className="h-3.5 w-3.5" />
                              </div>
                            )}
                            {child.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="p-6 bg-[#f7f3ea]/30 border-t border-black/5 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-black/60 hover:text-black transition"
          >
            {t('preferences.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-[#173fdb] text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#173fdb]/20 hover:bg-[#1234b5] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {t('preferences.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
