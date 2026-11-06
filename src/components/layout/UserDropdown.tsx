'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  LogOutIcon, 
  HelpIcon, 
  ContactIcon, 
  SettingsIcon,
  ChevronIcon
} from '@/components/shared/Icons';
import ProfileAvatar from '@/components/shared/ProfileAvatar';
import PreferencesModal from '@/components/profile/PreferencesModal';
import { authApi, profileApi } from '@/lib/api';
import { useApiAction } from '@/hooks/use-api-action';
import { useApiQuery } from '@/hooks/use-api-query';
import { clearAuthTracking, notifyAuthChanged } from '@/lib/auth';
import { useTranslations } from 'next-intl';

export default function UserDropdown() {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: profile } = useApiQuery(profileApi.get);
  const logout = useApiAction(authApi.logout, {
    onSuccess: () => {
      clearAuthTracking();
      notifyAuthChanged();
      router.push('/login');
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout.execute();
    setIsOpen(false);
    router.push('/login');
  };

  const menuItems = [
    { label: t('userMenu.profile'), href: '/profile', icon: UserIcon },
    { label: t('userMenu.preferences'), onClick: () => setIsPreferencesOpen(true), icon: SettingsIcon },
    { label: t('userMenu.help'), href: '/help', icon: HelpIcon },
    { label: t('userMenu.contact'), href: '/contact', icon: ContactIcon },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 transition hover:bg-black/5"
        aria-label={t('userMenu.account')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ProfileAvatar 
          firstName={profile?.firstName} 
          lastName={profile?.lastName} 
          size="md"
        />
        <ChevronIcon className={`h-4 w-4 text-black/40 transition lg:block hidden ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute end-0 mt-2 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
          <div className="border-b border-black/5 p-4 bg-[#f7f3ea]/30">
            <p className="text-xs font-bold uppercase tracking-wider text-black/40">{t('userMenu.account')}</p>
            {profile && (
              <p className="mt-1 text-sm font-bold truncate">
                {profile.firstName} {profile.lastName}
              </p>
            )}
          </div>
          
          <div className="py-2">
            {menuItems.map((item) => (
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:bg-[#173fdb]/5 hover:text-[#173fdb]"
                >
                  <item.icon className="h-5 w-5 opacity-70" />
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:bg-[#173fdb]/5 hover:text-[#173fdb]"
                >
                  <item.icon className="h-5 w-5 opacity-70" />
                  {item.label}
                </button>
              )
            ))}
          </div>

          <div className="border-t border-black/5 py-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-start text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOutIcon className="h-5 w-5 opacity-70" />
              {t('userMenu.logout')}
            </button>
          </div>
        </div>
      )}
      <PreferencesModal 
        isOpen={isPreferencesOpen} 
        onClose={() => setIsPreferencesOpen(false)} 
      />
    </div>
  );
}
