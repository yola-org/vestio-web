'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProfileAvatar from '@/components/shared/ProfileAvatar';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import { profileApi, callApi, listingsApi, Listing } from '@/lib/api';
import ListingGrid from '@/components/shared/ListingGrid';
import { UserProfile } from '@/types/api';
import { SettingsIcon, CameraIcon } from '@/components/shared/Icons';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch profile
      const profileResult = await callApi(profileApi.get());
      await profileResult.handle({
        onSuccess: (data) => setProfile(data),
      });

      // Fetch user listings (in a real app we'd filter by user id, here we just list all for demo)
      const listingsResult = await callApi(listingsApi.list(0, 50));
      await listingsResult.handle({
        onSuccess: (data) => setListings(data?.content || []),
      });

      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f7f3ea]">
        <Header />
        <main className="main-container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Profil non trouvé</h1>
          <Link href="/login" className="text-[#173fdb] font-bold hover:underline">
            Veuillez vous connecter
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515]">
      <Header />
      
      <main className="py-12 main-container">
        {/* Profile Header Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-black/5 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-[#f7f3ea]">
                <ProfileAvatar 
                  firstName={profile.firstName} 
                  lastName={profile.lastName} 
                  size="xl"
                  alt={`${profile.firstName} ${profile.lastName}`} 
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-black/5 hover:bg-[#f7f3ea] transition">
                <CameraIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-3xl font-black tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                <Link 
                  href="/settings" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-sm font-bold hover:bg-black/5 transition"
                >
                  <SettingsIcon className="h-4 w-4" /> Modifier le profil
                </Link>
              </div>
              <p className="text-black/60 font-medium mb-4 max-w-2xl">
                {profile.bio || "Aucune bio renseignée. Ajoutez-en une pour vous présenter à la communauté !"}
              </p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold">{listings.length}</span> <span className="text-black/50">articles</span>
                </div>
                <div>
                  <span className="font-bold">0</span> <span className="text-black/50">abonnés</span>
                </div>
                <div>
                  <span className="font-bold">0</span> <span className="text-black/50">abonnements</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mb-8 border-b border-black/10">
          <div className="flex gap-8">
            <button className="pb-4 text-sm font-bold border-b-2 border-[#173fdb] text-[#173fdb]">
              Articles ({listings.length})
            </button>
            <button className="pb-4 text-sm font-bold text-black/40 hover:text-black transition">
              Avis (0)
            </button>
            <button className="pb-4 text-sm font-bold text-black/40 hover:text-black transition">
              À propos
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        <ListingGrid 
          listings={listings} 
          isLoading={false} 
          columns="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          emptyMessage="Vous n'avez pas encore d'articles en vente."
        />
        
        {listings.length === 0 && (
          <div className="mt-6 text-center">
            <Link 
              href="/listings/new" 
              className="inline-block bg-[#ff5d39] text-white px-8 py-4 rounded-full font-bold hover:bg-[#e94422] transition"
            >
              Vendre mon premier article
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
