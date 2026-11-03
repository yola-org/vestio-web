'use client';

import { useState, useEffect } from 'react';
import { profileApi, callApi } from '@/lib/api';
import { CloseIcon } from '@/components/shared/Icons';
import { Category } from '@/types/api';
import PreferencesModalSkeleton from '@/components/profile/PreferencesModalSkeleton';
import { useNotifications } from '@/components/shared/NotificationProvider';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const { notify } = useNotifications();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    const [treeResult, prefsResult] = await Promise.all([
      callApi(profileApi.getCategories(), { silent: true }),
      callApi(profileApi.getPreferences(), { silent: true })
    ]);

    await treeResult.handle({ onSuccess: (data) => setCategories(data) });
    await prefsResult.handle({ 
      onSuccess: (data) => {
        setSelectedCategoryIds(data?.categoryIds || []);
        setSelectedGender(data?.gender || null);
      }
    });
    
    setLoading(false);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.some(i => String(i) === String(id)) 
        ? prev.filter(i => String(i) !== String(id)) 
        : [...prev, String(id)]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await callApi(profileApi.updatePreferences({ 
      categoryIds: selectedCategoryIds,
      gender: selectedGender
    }));
    
    await result.handle({
      onSuccess: () => {
        notify.success('Vos préférences ont été enregistrées avec succès.');
        onClose();
      }
    });
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-black/5">
          <div>
            <h2 className="text-2xl font-bold text-black">Mes Préférences</h2>
            <p className="text-sm text-black/60 mt-1">Sélectionnez vos styles et catégories favoris.</p>
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
                    Genre
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'FEMALE', name: 'Femme' },
                    { id: 'MALE', name: 'Homme' },
                    { id: 'UNISEX', name: 'Mixte' }
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
                    {(!parent.nestedCategories || parent.nestedCategories.length === 0) && (
                      <button
                        onClick={() => toggleCategory(String(parent.id))}
                        className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase transition-all ${
                          selectedCategoryIds.some(id => String(id) === String(parent.id))
                            ? 'border-[#173fdb] bg-[#173fdb] text-white'
                            : 'border-black/10 text-black/40 hover:border-black/20'
                        }`}
                      >
                        {selectedCategoryIds.some(id => String(id) === String(parent.id)) ? 'Sélectionné' : 'Sélectionner'}
                      </button>
                    )}
                  </div>
                  {parent.nestedCategories && parent.nestedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {parent.nestedCategories.map((child) => {
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
                              <div className="flex items-center justify-center -ml-1">
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
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-[#173fdb] text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#173fdb]/20 hover:bg-[#1234b5] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
