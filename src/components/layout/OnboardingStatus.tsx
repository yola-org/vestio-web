'use client';

import { useState, useEffect, useRef } from 'react';
import { RocketIcon, CheckIcon, CloseIcon } from '@/components/shared/Icons';
import { profileApi } from '@/lib/api';
import { useApiQuery } from '@/hooks/use-api-query';
import { useTranslations } from 'next-intl';

export default function OnboardingStatus() {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: status, loading } = useApiQuery(profileApi.getOnboardingStatus);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (loading || !status) return null;

  // Check if all steps are completed
  const isCompleted = status.accountCreated && 
                      status.additionalDataAdded && 
                      status.preferencesAdded && 
                      status.publishedSomething;

  if (isCompleted) return null;

  const steps = [
    { id: 'account', label: t('onboarding.steps.account'), completed: status.accountCreated, href: '/login' },
    { id: 'profile', label: t('onboarding.steps.profile'), completed: status.additionalDataAdded, href: '/settings' },
    { id: 'preferences', label: t('onboarding.steps.preferences'), completed: status.preferencesAdded },
    { id: 'publish', label: t('onboarding.steps.publish'), completed: status.publishedSomething, href: '/listings/new' },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-deep-accent/10 text-deep-accent transition hover:bg-deep-accent/20 active:scale-95"
        aria-label={t('onboarding.ariaLabel')}
      >
        <RocketIcon className={`h-5 w-5 ${progress > 0 ? 'animate-bounce-subtle' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full end-0 mt-3 w-72 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-deep-accent p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black tracking-tight text-lg">{t('onboarding.title')}</h3>
              <button onClick={() => setIsOpen(false)}>
                <CloseIcon className="h-5 w-5 opacity-60 hover:opacity-100" />
              </button>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div 
                className="absolute top-0 start-0 h-full bg-sub-accent transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-bold opacity-80 uppercase tracking-wider">{t('onboarding.progress', { progress })}</p>
          </div>
          
          <div className="p-4">
            <ul className="space-y-3">
              {steps.map((step) => (
                <li key={step.id} className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-black/10 text-black/20'
                  }`}>
                    {step.completed ? <CheckIcon className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">{steps.indexOf(step) + 1}</span>}
                  </div>
                  <a href={step.href && !step.completed ? step.href : ""} className={`text-sm font-medium ${step.completed ? 'text-black/40 line-through' : 'text-primary'}`}>
                    {step.label}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 rounded-xl bg-background p-4 text-center">
              <p className="text-[13px] font-medium text-black/60 leading-relaxed">
                {t('onboarding.hint')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
