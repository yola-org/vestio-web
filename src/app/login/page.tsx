'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowIcon } from '@/components/shared/Icons';
import { authApi, callApi } from '@/lib/api';
import { markAuthenticated, notifyAuthChanged } from '@/lib/auth';
import { useNotifications } from '@/components/shared/NotificationProvider';
import { useTranslations } from 'next-intl';
import {ApiCallError} from "@/lib/api/call.ts";

export default function LoginPage() {
  const router = useRouter();
  const { notify } = useNotifications();
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    const result = await callApi(authApi.login({ email, password }), {
      errors: { ERR_UNAUTHORIZED: t('auth.login.invalidCredentials') },
    });

    await result.handle({
      onSuccess: () => {
        markAuthenticated();
        notifyAuthChanged();
        notify.success(t('auth.login.success'));
        router.push('/');
      },
      onError: (error : ApiCallError) => {
        if (error.code === 'ERR_UNAUTHORIZED') {
          setLoginError(error.message);
        }
      }
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-primary">
      <Header />
      <main className="py-20 main-container">
        <div className="mx-auto max-w-md bg-white p-8 shadow-sm rounded-2xl">
          <h1 className="text-4xl font-black tracking-tight mb-2">{t('auth.login.title')}</h1>
          <p className="text-black/60 mb-8">{t('auth.login.subtitle')}</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="email">{t('auth.register.email')}</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                placeholder={t('auth.register.emailPlaceholder')}
                autoComplete="email"
                required
                value={email}
                aria-invalid={Boolean(loginError)}
                aria-describedby={loginError ? 'login-error' : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setLoginError('');
                }}
                className={`w-full h-12 px-4 rounded-xl border ${loginError ? 'border-red-500' : 'border-black/15'} focus:border-deep-accent focus:ring-2 focus:ring-deep-accent/10 outline-none transition`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="password">{t('auth.register.password')}</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                aria-invalid={Boolean(loginError)}
                aria-describedby={loginError ? 'login-error' : undefined}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setLoginError('');
                }}
                className={`w-full h-12 px-4 rounded-xl border ${loginError ? 'border-red-500' : 'border-black/15'} focus:border-deep-accent focus:ring-2 focus:ring-deep-accent/10 outline-none transition`}
              />
            </div>
            <button disabled={isSubmitting} className="w-full bg-deep-accent text-white h-12 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')} <ArrowIcon className="h-5 w-5" />
            </button>
          </form>
          {loginError && (
            <p id="login-error" role="alert" className="mt-4 text-sm font-medium text-red-700">
              {loginError}
            </p>
          )}
          
          <div className="mt-8 pt-8 border-t border-black/10 text-center">
            <p className="text-sm text-black/60 mb-4">{t('auth.login.noAccount')}</p>
            <Link href="/register" className="inline-block text-accent font-bold hover:underline">
              {t('auth.login.join')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
