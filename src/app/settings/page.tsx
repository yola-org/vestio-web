'use client';

import { useEffect, useState, FormEvent } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { profileApi, callApi } from '@/lib/api';
import { UserProfile } from '@/types/api';
import { ArrowIcon, UserIcon } from '@/components/shared/Icons';
import { useNotifications } from '@/components/shared/NotificationProvider';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { notify } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await callApi(profileApi.get());
      await result.handle({
        onSuccess: (data) => {
          setProfile(data);
          setFirstName(data.firstName);
          setLastName(data.lastName);
          setBio(data.bio || '');
          setPhoneNumber(data.phoneNumber || '');
        },
      });
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await callApi(profileApi.update({
      firstName,
      lastName,
      bio,
      phoneNumber
    }));
    
    await result.handle({
      onSuccess: () => {
        notify.success('Profil mis à jour avec succès !');
        router.push('/profile');
      },
      onError: () => {
        notify.error('Erreur lors de la mise à jour du profil.');
      }
    });

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea]">
        <Header />
        <main className="main-container py-20 flex justify-center">
          <div className="animate-pulse text-xl font-bold">Chargement des paramètres...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515]">
      <Header />
      
      <main className="py-12 main-container">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black tracking-tight mb-8">Paramètres</h1>
          
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-black/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-[#173fdb]" /> Informations personnelles
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2" htmlFor="firstName">Prénom</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" htmlFor="lastName">Nom</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Parlez-nous un peu de vous..."
                  className="w-full p-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="phone">Numéro de téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0612345678"
                  className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition"
                />
              </div>

              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  className="w-full bg-[#173fdb] text-white h-12 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#1335b8] transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'} <ArrowIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
